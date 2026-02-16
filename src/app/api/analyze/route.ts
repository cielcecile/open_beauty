import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { checkRateLimit, getRequestIdentifier } from '@/lib/rate-limit';

function getClients() {
  const geminiApiKey = process.env.GEMINI_API_KEY;
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!geminiApiKey || !supabaseUrl || !supabaseServiceKey) {
    throw new Error('Missing required environment variables for /api/analyze');
  }

  const genAI = new GoogleGenerativeAI(geminiApiKey);
  const supabase = createClient(supabaseUrl, supabaseServiceKey);
  return { genAI, supabase };
}

type AnalysisData = {
  faceType: string;
  skinAge: number;
  scores: number[];
  concerns: string[];
};

type Recommendation = {
  name: string;
  category: string;
  description: string;
  price_range: string;
};

type AdviceData = {
  message: string;
  recommendations: Recommendation[];
};

type CachedRecommendationRow = {
  face_type: string;
  concerns: string[];
  recommendations: Recommendation[];
  advice: string;
};

function parseJson<T>(text: string): T {
  const cleaned = text.replace(/```json/g, '').replace(/```/g, '').trim();
  return JSON.parse(cleaned) as T;
}

function normalizeScores(input: number[]): number[] {
  if (input.length !== 5) return [50, 50, 50, 50, 50];
  return input.map((value) => Math.max(0, Math.min(100, Math.round(value))));
}

export async function POST(req: Request) {
  const { genAI, supabase } = getClients();
  const identifier = getRequestIdentifier(req);
  const limit = checkRateLimit('api-analyze', identifier, 10, 60_000);
  if (!limit.allowed) {
    return NextResponse.json(
      { error: 'Too many requests. Please try again shortly.' },
      { status: 429, headers: { 'Retry-After': Math.ceil(limit.retryAfterMs / 1000).toString() } }
    );
  }

  try {
    const { image } = (await req.json()) as { image?: string };

    if (!image || typeof image !== 'string') {
      return NextResponse.json({ error: 'Image is required' }, { status: 400 });
    }

    if (image.length > 8_000_000) {
      return NextResponse.json({ error: 'Image payload is too large' }, { status: 413 });
    }

    const match = image.match(/^data:(image\/\w+);base64,/);
    if (!match) {
      return NextResponse.json({ error: 'Unsupported image format' }, { status: 400 });
    }

    const mimeType = match[1];
    const base64Data = image.replace(/^data:image\/\w+;base64,/, '');

    const candidateModels = ['gemini-2.5-flash', 'gemini-2.0-flash', 'gemini-1.5-flash'];

    const visionPrompt = `
You are an expert aesthetic dermatologist.
Return only JSON with this schema:
{
  "faceType": "string",
  "skinAge": number,
  "scores": [number, number, number, number, number],
  "concerns": ["string"]
}
Rules:
- concerns: 1-3 items.
- scores: 0-100 integers.
`;

    let analysisText = '';
    let modelNameUsed = '';
    for (const modelName of candidateModels) {
      try {
        const model = genAI.getGenerativeModel({ model: modelName });
        const result = await model.generateContent([
          visionPrompt,
          { inlineData: { data: base64Data, mimeType } },
        ]);
        analysisText = await result.response.text();
        modelNameUsed = modelName;
        break;
      } catch { }
    }

    if (!analysisText || !modelNameUsed) {
      return NextResponse.json({ error: 'AI analysis is temporarily unavailable' }, { status: 503 });
    }

    const parsedAnalysis = parseJson<AnalysisData>(analysisText);
    const concerns = [...(parsedAnalysis.concerns || [])].map((item) => item.trim()).filter(Boolean).sort();

    const analysisData: AnalysisData = {
      faceType: parsedAnalysis.faceType || 'Balanced',
      skinAge: Math.max(10, Math.min(90, Math.round(parsedAnalysis.skinAge || 25))),
      scores: normalizeScores(parsedAnalysis.scores || []),
      concerns,
    };

    let adviceData: AdviceData | null = null;

    const { data: cached } = await supabase
      .from('cached_recommendations')
      .select('face_type,concerns,recommendations,advice')
      .eq('face_type', analysisData.faceType)
      .contains('concerns', concerns)
      .returns<CachedRecommendationRow[]>();

    if (cached && cached.length > 0) {
      const exact = cached.find((row) => row.concerns.length === concerns.length);
      if (exact) {
        adviceData = {
          message: exact.advice,
          recommendations: exact.recommendations,
        };
      }
    }

    if (!adviceData) {
      const advicePrompt = `
Based on this analysis:
- Face type: ${analysisData.faceType}
- Concerns: ${concerns.join(', ') || 'none'}

Return only JSON:
{
  "message": "string",
  "recommendations": [
    { "name": "string", "category": "string", "description": "string", "price_range": "string" }
  ]
}
Use Japanese for message and treatment naming when appropriate.
`;

      const model = genAI.getGenerativeModel({ model: modelNameUsed });
      const adviceResult = await model.generateContent(advicePrompt);
      const adviceText = await adviceResult.response.text();
      adviceData = parseJson<AdviceData>(adviceText);

      await supabase.from('cached_recommendations').insert({
        face_type: analysisData.faceType,
        concerns,
        recommendations: adviceData.recommendations,
        advice: adviceData.message,
      });

      for (const rec of adviceData.recommendations || []) {
        const { data: existing } = await supabase
          .from('treatments')
          .select('id')
          .eq('name', rec.name)
          .maybeSingle();

        if (!existing) {
          await supabase.from('treatments').insert({
            name: rec.name,
            category: rec.category,
            description: rec.description,
            price_range: rec.price_range,
            concerns,
          });
        }
      }
    }

    return NextResponse.json({
      ...analysisData,
      ...adviceData,
      model: modelNameUsed,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error('Analyze API error:', message);
    return NextResponse.json({ error: 'Failed to analyze image' }, { status: 500 });
  }
}


