import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";
import { createClient } from '@supabase/supabase-js';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || "",
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""
);

export async function POST(req: Request) {
    console.log("Analyze API called");
    console.log("API Key present:", !!process.env.GEMINI_API_KEY);

    try {
        const { image } = await req.json();

        if (!image) {
            return NextResponse.json({ error: "Image is required" }, { status: 400 });
        }

        const match = image.match(/^data:(image\/\w+);base64,/);
        const mimeType = match ? match[1] : "image/jpeg";
        const base64Data = image.replace(/^data:image\/\w+;base64,/, "");

        // Step 1: Vision Analysis
        // Strategy: Try multiple models in order. Prioritize 2.5 Flash as it was seen in debug output.
        // 2.0 Flash is also available but hit quota limits (429). 1.5 versions returned 404.
        const candidateModels = ["gemini-2.5-flash", "gemini-2.0-flash", "gemini-1.5-flash"];
        let result = null;
        let lastError = null;
        let successfulModel = null;

        const visionPrompt = `
        You are an expert aesthetic dermatologist. Analyze the face in the image and provide a JSON response.
        
        Analyze:
        1. **Face Type**: Choose one from [キュート, アクティブキュート, フレッシュ, クールカジュアル, フェミニン, ソフトエレガント, エレガント, クール, グラマラス, セクシー, ボーイッシュ, 知的]. Can be combined (e.g. "エレガント x クール").
        2. **Skin Age**: Estimate skin age (integer).
        3. **Scores** (0-100): Balance, Texture, Clarity, Firmness, Moisture.
        4. **Concerns**: Identify 1-3 primary concerns from: [たるみ/弾力, シワ, 毛穴/傷跡, シミ/肝斑, ニキビ, 乾燥, 赤み].

        Response Format (JSON ONLY):
        {
          "faceType": "String",
          "skinAge": Integer,
          "scores": [Integer, Integer, Integer, Integer, Integer],
          "concerns": ["String", "String"]
        }
        `;

        for (const modelName of candidateModels) {
            try {
                console.log(`Attempting analysis with model: ${modelName}`);
                const model = genAI.getGenerativeModel({ model: modelName });

                result = await model.generateContent([
                    visionPrompt,
                    { inlineData: { data: base64Data, mimeType: mimeType } },
                ]);

                if (result) {
                    console.log(`Success with model: ${modelName}`);
                    successfulModel = model;
                    break;
                }
            } catch (e: any) {
                console.warn(`Failed with model ${modelName}:`, e.message);
                lastError = e;
                continue;
            }
        }

        if (!result || !successfulModel) {
            throw lastError || new Error("All models failed to generate content.");
        }

        const response = await result.response;
        // Clean and parse JSON
        const text = response.text().replace(/```json/g, "").replace(/```/g, "").trim();
        const analysisData = JSON.parse(text);

        // Calculate Cache Key
        const sortedConcerns = (analysisData.concerns || []).sort();
        const faceType = analysisData.faceType;

        // Step 2: Check Cache (Supabase)
        let adviceData = null;

        // Attempt to fetch from cache
        const { data: cached } = await supabase
            .from('cached_recommendations')
            .select('*')
            .eq('face_type', faceType)
            .contains('concerns', sortedConcerns)
            .limit(1);

        if (cached && cached.length > 0) {
            const candidate = cached.find((c: any) => c.concerns.length === sortedConcerns.length);
            if (candidate) {
                console.log("Cache Hit! Using DB for advice.");
                adviceData = {
                    message: candidate.advice,
                    recommendations: candidate.recommendations
                };
            }
        }

        // Step 3: If Cache Miss, Generate Advice & Recommendations
        if (!adviceData) {
            console.log("Cache Miss. Generating advice...");
            const advicePrompt = `
            Based on the analysis:
            - Face Type: ${faceType}
            - Concerns: ${sortedConcerns.join(", ")}
            
            1. Write a polite, professional advice message (Japanese, ~150 chars).
            2. Recommend 2-4 specific aesthetic treatments/procedures. 
            3. For each, provide: Name, Category (Visual/Lift/Skin/etc), Description, and Price Range (KRW/JPY approximation).

            Response Format (JSON ONLY):
            {
              "message": "String",
              "recommendations": [
                { "name": "String", "category": "String", "description": "String", "price_range": "String" }
              ]
            }
            `;

            const adviceResult = await successfulModel.generateContent(advicePrompt);
            const adviceText = await adviceResult.response.text();
            const cleanedAdvice = adviceText.replace(/```json/g, "").replace(/```/g, "").trim();
            adviceData = JSON.parse(cleanedAdvice);

            // Save to Cache
            await supabase.from('cached_recommendations').insert({
                face_type: faceType,
                concerns: sortedConcerns,
                recommendations: adviceData.recommendations,
                advice: adviceData.message
            });

            // Dynamic Treatments Population
            if (adviceData.recommendations) {
                for (const rec of adviceData.recommendations) {
                    const { data: existing } = await supabase
                        .from('treatments')
                        .select('id')
                        .eq('name', rec.name)
                        .single();

                    if (!existing) {
                        await supabase.from('treatments').insert({
                            // name matches schema
                            name: rec.name,
                            category: rec.category,
                            description: rec.description,
                            price_range: rec.price_range,
                            concerns: sortedConcerns
                        });
                    }
                }
            }
        }

        // Combine Results
        const finalResult = {
            ...analysisData,
            ...adviceData
        };

        return NextResponse.json(finalResult);

    } catch (error: any) {
        console.error("AI Analysis Error:", error);
        return NextResponse.json({
            error: "Failed to analyze image",
            details: error.message || String(error)
        }, { status: 500 });
    }
}
