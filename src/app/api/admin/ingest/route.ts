import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { isAdminEmail } from '@/lib/admin';

function getConfig() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const geminiApiKey = process.env.GEMINI_API_KEY;

  if (!supabaseUrl || !supabaseServiceKey || !supabaseAnonKey || !geminiApiKey) {
    throw new Error('Missing required environment variables for admin ingest route.');
  }

  return { supabaseUrl, supabaseServiceKey, supabaseAnonKey, geminiApiKey };
}

function getClients() {
  const { supabaseUrl, supabaseServiceKey, supabaseAnonKey, geminiApiKey } = getConfig();
  const serviceSupabase = createClient(supabaseUrl, supabaseServiceKey);
  const authSupabase = createClient(supabaseUrl, supabaseAnonKey);
  const genAI = new GoogleGenerativeAI(geminiApiKey);
  const embeddingModel = genAI.getGenerativeModel({ model: 'models/gemini-embedding-001' });
  return { serviceSupabase, authSupabase, embeddingModel };
}

interface HospitalRow {
  id: string;
  name: string;
  description: string | null;
  detail_description: string | null;
  address: string | null;
}

interface PricingRow {
  treatment_name: string;
  price_krw: number | null;
  price_jpy: number | null;
  event_price: number | null;
}

interface FaqRow {
  question: string;
  answer: string;
}

interface ReviewRow {
  rating: number;
  content: string;
}

async function generateEmbedding(embeddingModel: ReturnType<GoogleGenerativeAI['getGenerativeModel']>, text: string): Promise<number[] | null> {
  try {
    const result = await embeddingModel.embedContent(text);
    return result.embedding.values;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.warn('Failed to generate embedding:', message);
    return null;
  }
}

async function requireAdmin(authSupabase: any, request: Request): Promise<NextResponse | null> {
  const authHeader = request.headers.get('authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const token = authHeader.slice('Bearer '.length).trim();
  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data, error } = await authSupabase.auth.getUser(token);
  if (error || !data.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (!isAdminEmail(data.user.email)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  return null;
}

export async function POST(req: Request) {
  const { serviceSupabase, authSupabase, embeddingModel } = getClients();
  const authFailure = await requireAdmin(authSupabase, req);
  if (authFailure) return authFailure;

  try {
    const body = (await req.json()) as { hospitalId?: string };
    const hospitalId = body.hospitalId;

    if (!hospitalId) {
      return NextResponse.json({ error: 'Hospital ID is required' }, { status: 400 });
    }

    const { data: hospital, error: hospitalError } = await serviceSupabase
      .from('hospitals')
      .select('id,name,description,detail_description,address')
      .eq('id', hospitalId)
      .single<HospitalRow>();

    if (hospitalError || !hospital) {
      return NextResponse.json({ error: 'Hospital not found' }, { status: 404 });
    }

    const { data: pricing } = await serviceSupabase
      .from('pricing')
      .select('treatment_name,price_krw,price_jpy,event_price')
      .eq('hospital_id', hospitalId)
      .returns<PricingRow[]>();

    const { data: faqs } = await serviceSupabase
      .from('faqs')
      .select('question,answer')
      .eq('hospital_id', hospitalId)
      .returns<FaqRow[]>();

    const { data: reviews } = await serviceSupabase
      .from('reviews')
      .select('rating,content')
      .eq('hospital_id', hospitalId)
      .limit(5)
      .returns<ReviewRow[]>();

    const knowledgeChunks: string[] = [];

    if (hospital.description) knowledgeChunks.push(`[Hospital Description] ${hospital.name}: ${hospital.description}`);
    if (hospital.detail_description) knowledgeChunks.push(`[Hospital Details] ${hospital.name}: ${hospital.detail_description}`);
    if (hospital.address) knowledgeChunks.push(`[Address] ${hospital.name}: ${hospital.address}`);

    for (const price of pricing ?? []) {
      const krw = price.price_krw?.toLocaleString() ?? 'N/A';
      const jpy = price.price_jpy?.toLocaleString() ?? 'N/A';
      let line = `[Pricing] ${hospital.name} - ${price.treatment_name}: ${krw} KRW (~${jpy} JPY)`;
      if (price.event_price) line += `, event ${price.event_price.toLocaleString()} KRW`;
      knowledgeChunks.push(line);
    }

    for (const faq of faqs ?? []) {
      knowledgeChunks.push(`[FAQ] Q: ${faq.question} A: ${faq.answer}`);
    }

    for (const review of reviews ?? []) {
      knowledgeChunks.push(`[Review ${review.rating}/5] ${review.content}`);
    }

    await serviceSupabase.from('hospital_knowledge').delete().eq('hospital_id', hospitalId);

    let successCount = 0;
    for (const chunk of knowledgeChunks) {
      const embedding = await generateEmbedding(embeddingModel, chunk);
      if (!embedding) continue;

      await serviceSupabase.from('hospital_knowledge').insert({
        hospital_id: hospitalId,
        content: chunk,
        embedding,
        metadata: { source: 'admin-manual-ingest', timestamp: new Date().toISOString() },
      });
      successCount += 1;
      await new Promise((resolve) => setTimeout(resolve, 200));
    }

    return NextResponse.json({
      success: true,
      message: `Ingestion complete for ${hospital.name}`,
      chunksProcessed: successCount,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal Server Error';
    console.error('[Admin Ingest] Error:', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
