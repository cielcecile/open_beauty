
const { createClient } = require('@supabase/supabase-js');
const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config({ path: '.env.local' });

// Initialize Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY; // Need Service Role Key for RAG writes if RLS is strict, or just Anon if policy allows

if (!supabaseUrl || !supabaseServiceKey) {
    console.error("Missing Supabase URL or Service Role Key.");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "models/gemini-embedding-001" });

async function generateEmbedding(text) {
    try {
        const result = await model.embedContent(text);
        return result.embedding.values;
    } catch (e) {
        console.warn(`Failed to generate embedding:`, e.message);
        return null;
    }
}

async function ingestHospitalData(hospitalId) {
    console.log(`Ingesting data for hospital: ${hospitalId}`);

    // 1. Fetch Hospital Info
    const { data: hospital, error: hError } = await supabase
        .from('hospitals')
        .select('*')
        .eq('id', hospitalId)
        .single();

    if (hError || !hospital) {
        console.error("Hospital not found:", hError);
        return;
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

    // 4. Fetch Reviews (Optional, maybe top 5 positive ones)
    const { data: reviews } = await supabase
        .from('reviews')
        .select('*')
        .eq('hospital_id', hospitalId)
        .limit(5);


    const knowledgeChunks = [];

    // Create text chunks
    // Hospital Description
    if (hospital.description) {
        knowledgeChunks.push(`【病院紹介】${hospital.name}: ${hospital.description}`);
    }
    if (hospital.detail_description) {
        knowledgeChunks.push(`【詳細説明】${hospital.name}: ${hospital.detail_description}`);
    }
    if (hospital.address) {
        knowledgeChunks.push(`【住所】${hospital.name}: ${hospital.address}`);
    }

    // Pricing
    if (pricing && pricing.length > 0) {
        pricing.forEach(p => {
            let priceText = `【価格/施術】${hospital.name}の${p.treatment_name}は ${p.price_krw.toLocaleString()} KRW (約 ${p.price_jpy.toLocaleString()} JPY) です。`;
            if (p.event_price) {
                priceText += ` 現在イベント価格で ${p.event_price.toLocaleString()} KRW 입니다.`;
            }
            knowledgeChunks.push(priceText);
        });
    }

    // FAQs
    if (faqs && faqs.length > 0) {
        faqs.forEach(f => {
            knowledgeChunks.push(`【よくある質問】Q: ${f.question} A: ${f.answer}`);
        });
    }

    // Reviews
    if (reviews && reviews.length > 0) {
        reviews.forEach(r => {
            knowledgeChunks.push(`【口コミ】${r.rating}点: ${r.content}`);
        });
    }

    // Generate Embeddings & Save
    for (const chunk of knowledgeChunks) {
        const embedding = await generateEmbedding(chunk);
        if (embedding) {
            const { error } = await supabase.from('hospital_knowledge').insert({
                hospital_id: hospitalId,
                content: chunk,
                embedding: embedding,
                metadata: { source: 'auto-ingest', timestamp: new Date() }
            });

            if (error) console.error("Error inserting chunk:", error);
            else console.log("Saved chunk:", chunk.substring(0, 30) + "...");
        }
        // Rate limit prevention
        await new Promise(r => setTimeout(r, 500));
    }

    console.log(`Finished ingestion for ${hospital.name}`);
}

// Main execution
(async () => {
    // List of hospitals to ingest (or fetch all)
    // For demo, let's just do 'd1' (Aureum) and 'p1' (LienJang)
    const targetHospitals = ['d1', 'p1', 't1', 'o1'];

    for (const hid of targetHospitals) {
        await ingestHospitalData(hid);
    }
})();
