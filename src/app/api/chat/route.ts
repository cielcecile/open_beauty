import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";
import { createClient } from '@supabase/supabase-js';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
// For Chat, we use the model verified to work: gemini-flash-latest
const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });
const embeddingModel = genAI.getGenerativeModel({ model: "models/gemini-embedding-001" });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || "",
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""
);

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { message, hospitalId, systemPrompt, hospitalName, history, userId } = body;

        if (!message) {
            return NextResponse.json({ reply: "メッセージを入力してください。" });
        }

        let contextText = "";

        // RAG: If hospitalId is provided, search for relevant info
        if (hospitalId) {
            try {
                // 1. Generate Embedding for user query
                const embeddingResult = await embeddingModel.embedContent(message);
                const queryEmbedding = embeddingResult.embedding.values;

                // 2. Search in Supabase (RPC call)
                const { data: products, error } = await supabase.rpc('match_hospital_knowledge', {
                    query_embedding: queryEmbedding,
                    match_threshold: 0.5, // Similarity threshold
                    match_count: 5,        // Top 5 relevant chunks
                    filter_hospital_id: hospitalId
                });

                if (error) {
                    console.error("RAG Search Error:", error);
                } else if (products && products.length > 0) {
                    contextText = products.map((p: any) => p.content).join("\n\n");
                    console.log("RAG Context found:", products.length, "chunks");
                }
            } catch (e) {
                console.error("Embedding Error:", e);
                // Fail gracefully, continue without context
            }
        }

        // Construct System Prompt
        let finalSystemPrompt = systemPrompt || `あなたは美容クリニックの親切なAIカウンセラーです。`;

        if (hospitalName) {
            finalSystemPrompt += ` ${hospitalName}の担当者として振る舞ってください。`;
        }

        if (contextText) {
            finalSystemPrompt += `\n\n【参考情報（以下の情報を最優先して回答してください）】\n${contextText}\n\nもし参考情報に答えがない場合は、一般的な美容知識に基づいて丁寧に回答するか、「詳細は病院に直接お問い合わせください」と案内してください。嘘の情報は絶対に作らないでください。\n\n【重要】回答は質問された内容（価格や施術効果など）のみに絞り、簡潔に答えてください。\n\n【禁止事項】\n1. **（アスタリスク2つ）による太字強調は使用しないでください。\n2. 日本円(JPY)への換算はしないでください。価格は韓国ウォン(KRW)のみ表記してください。\n3. 質問されていない場合、病院の場所(アクセス)、予約方法、病院の魅力などの宣伝文句は一切含めないでください。\n4. 挨拶や締めの言葉は最小限にしてください。`;
        }

        // Add User Message
        const chat = model.startChat({
            history: history || [], // Optional: past chat history
            generationConfig: {
                maxOutputTokens: 300,
            },
        });

        // Send message with system instruction logic
        // Gemini 2.0 Flash supports system instructions via model config, 
        // but simple way is to prepend to the first message or use 'sendMessage' with prompt.
        // For simplicity in this route, we'll act as a stateless turn or simple history.

        // Better approach for RAG + System Prompt in JS SDK:
        const promptWithContext = `${finalSystemPrompt}\n\nUser Question: ${message}`;

        let text = "";

        // Helper to delay
        const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

        try {
            // Attempt 1: Primary Model (Gemini Flash Latest)
            console.log("Attempt 1: Gemini Flash Latest");
            const result = await model.generateContent(promptWithContext);
            const response = await result.response;
            text = response.text();

        } catch (error1: any) {
            console.warn(`Attempt 1 Failed (${error1.status || error1.message}). Retrying...`);

            // Attempt 2: Retry Primary after 2s delay
            if (error1.status === 429 || error1.message?.includes('429')) {
                await delay(2000);
                try {
                    console.log("Attempt 2: Gemini Flash Latest (Retry)");
                    const result = await model.generateContent(promptWithContext);
                    const response = await result.response;
                    text = response.text();
                } catch (error2: any) {
                    console.warn(`Attempt 2 Failed. Trying Fallback...`);

                    // Attempt 3: Fallback (Gemini Pro Latest) - Only if Flash fails completely
                    try {
                        console.log("Attempt 3: Gemini Pro Latest");
                        const fallbackModel = genAI.getGenerativeModel({ model: "gemini-pro-latest" });
                        const fallbackResult = await fallbackModel.generateContent(promptWithContext);
                        const fallbackResponse = await fallbackResult.response;
                        text = fallbackResponse.text();
                    } catch (error3: any) {
                        console.error("All Attempts Failed.");
                        throw error3;
                    }
                }
            } else {
                throw error1;
            }
        }



        // --- Save to Chat Logs (Async) ---
        // We don't await this to keep response fast
        (async () => {
            try {
                if (!hospitalId) return;

                const { error: logError } = await supabase.from('chat_logs').insert([
                    // User Query
                    {
                        hospital_id: hospitalId,
                        user_id: userId || null,
                        role: 'user',
                        content: message
                    },
                    // AI Response
                    {
                        hospital_id: hospitalId,
                        user_id: userId || null,
                        role: 'assistant',
                        content: text
                    }
                ]);

                if (logError) console.error("Failed to save chat logs:", logError);
                else console.log("Chat logs saved.");

            } catch (err) {
                console.error("Chat logging error:", err);
            }
        })();

        return NextResponse.json({ reply: text });

    } catch (error: any) {
        console.error('Chat API Error:', error);

        if (error.status === 429 || error.message?.includes('429')) {
            return NextResponse.json({
                reply: '申し訳ありません。現在アクセスが集中しており、AIが応答できません。1분 뒤에 다시 시도해주세요. (API Quota Exceeded)'
            }, { status: 429 });
        }

        return NextResponse.json({ reply: '申し訳ありません。システムエラーが発生しました。' }, { status: 500 });
    }
}
