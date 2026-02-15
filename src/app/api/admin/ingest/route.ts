import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Supabase (Use Service Role Key for RLS bypass if needed, or ensuring the user is admin)
// For this context, we'll use the service role key to ensure we can read all data and write to knowledge table
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error("Missing Supabase URL or Service Role Key.");
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
const model = genAI.getGenerativeModel({ model: "models/gemini-embedding-001" });

async function generateEmbedding(text: string) {
    try {
        const result = await model.embedContent(text);
        return result.embedding.values;
    } catch (e: any) {
        console.warn(`Failed to generate embedding:`, e.message);
        return null;
    }
}

export async function POST(req: Request) {
    try {
        const { hospitalId } = await req.json();

        if (!hospitalId) {
            return NextResponse.json({ error: 'Hospital ID is required' }, { status: 400 });
        }

        console.log(`[Admin Ingest] Starting for hospital: ${hospitalId}`);

        // 1. Fetch Hospital Info
        const { data: hospital, error: hError } = await supabase
            .from('hospitals')
            .select('*')
            .eq('id', hospitalId)
            .single();

        if (hError || !hospital) {
            return NextResponse.json({ error: 'Hospital not found' }, { status: 404 });
        }

        // 2. Fetch Pricing
        const { data: pricing } = await supabase
            .from('pricing')
            .select('*')
            .eq('hospital_id', hospitalId);

        // 3. Fetch FAQs
        const { data: faqs } = await supabase
            .from('faqs')
            .select('*')
            .eq('hospital_id', hospitalId);

        // 4. Fetch Reviews (Top 5)
        const { data: reviews } = await supabase
            .from('reviews')
            .select('*')
            .eq('hospital_id', hospitalId)
            .limit(5);

        const knowledgeChunks: string[] = [];

        // Create text chunks
        // Hospital Description
        if (hospital.description) knowledgeChunks.push(`【病院紹介】${hospital.name}: ${hospital.description}`);
        if (hospital.detail_description) knowledgeChunks.push(`【詳細説明】${hospital.name}: ${hospital.detail_description}`);
        if (hospital.address) knowledgeChunks.push(`【住所】${hospital.name}: ${hospital.address}`);

        // Pricing
        if (pricing && pricing.length > 0) {
            pricing.forEach((p: any) => {
                let priceText = `【価格/施術】${hospital.name}の${p.treatment_name}は ${p.price_krw.toLocaleString()} KRW (約 ${p.price_jpy.toLocaleString()} JPY) です。`;
                if (p.event_price) {
                    priceText += ` 現在イベント価格で ${p.event_price.toLocaleString()} KRW 입니다.`;
                }
                knowledgeChunks.push(priceText);
            });
        }

        // FAQs
        if (faqs && faqs.length > 0) {
            faqs.forEach((f: any) => {
                knowledgeChunks.push(`【よくある質問】Q: ${f.question} A: ${f.answer}`);
            });
        }

        // Reviews
        if (reviews && reviews.length > 0) {
            reviews.forEach((r: any) => {
                knowledgeChunks.push(`【口コミ】${r.rating}点: ${r.content}`);
            });
        }

        // Clear existing knowledge for this hospital before re-ingesting? 
        // Or just append/update? Ideally clear old ones to avoid duplicates.
        // Let's delete old ones for this hospital first.
        await supabase.from('hospital_knowledge').delete().eq('hospital_id', hospitalId);

        // Generate Embeddings & Save
        let successCount = 0;
        for (const chunk of knowledgeChunks) {
            const embedding = await generateEmbedding(chunk);
            if (embedding) {
                await supabase.from('hospital_knowledge').insert({
                    hospital_id: hospitalId,
                    content: chunk,
                    embedding: embedding,
                    metadata: { source: 'admin-manual-ingest', timestamp: new Date() }
                });
                successCount++;
            }
            // Simple rate limit
            await new Promise(r => setTimeout(r, 200));
        }

        return NextResponse.json({
            success: true,
            message: `Ingestion complete for ${hospital.name}`,
            chunksProcessed: successCount
        });

    } catch (error: any) {
        console.error('[Admin Ingest] Error:', error);
        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
    }
}
