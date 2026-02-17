import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai';
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

const safetySettings = [
  { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_NONE },
  { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_NONE },
  { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_NONE },
  { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_NONE },
];

function parseJson<T>(text: string): T {
  try {
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('No JSON object found');
    return JSON.parse(jsonMatch[0]) as T;
  } catch (err) {
    console.error('JSON parsing failed:', text);
    throw err;
  }
}

function normalizeScores(input: number[]): number[] {
  if (!input || input.length === 0) return [50, 50, 50, 50, 50];
  const scores = input.slice(0, 5);
  while (scores.length < 5) scores.push(50);
  return scores.map(s => Math.max(0, Math.min(100, Math.round(Number(s) || 50))));
}

export async function POST(req: Request) {
  const { genAI } = getClients();
  const identifier = getRequestIdentifier(req);
  const limit = checkRateLimit('api-analyze', identifier, 60, 60_000);

  if (!limit.allowed) {
    return NextResponse.json({
      error: `리퀘스트가 너무 많습니다. ${Math.ceil(limit.retryAfterMs / 1000)}초 후 다시 시도해 주세요.`
    }, { status: 429 });
  }

  try {
    const body = await req.json();
    const { image, concerns: userConcerns = [] } = body as { image?: string, concerns?: string[] };
    if (!image) return NextResponse.json({ error: '画像が必要です' }, { status: 400 });

    const dataParts = image.split(',');
    if (dataParts.length < 2) return NextResponse.json({ error: '画像形式が不正です' }, { status: 400 });
    const base64Data = dataParts[1];
    const mimeType = dataParts[0].match(/:(.*?);/)?.[1] || 'image/jpeg';

    const models = ['gemini-2.0-flash', 'gemini-1.5-flash'];
    const prompt = `あなたは親しみやすい美容アドバイザーです。ユーザーの写真を見て、楽しくてためになる美容レポートを作成してください。
※これは医療診断ではありません。エステや化粧品選定の参考にしてもらうためのアドバイスです。
悩み（${userConcerns.join(', ') || '特にな시'}）に寄り添ったコメントをお願いします。

以下のJSON形式でのみ回答してください：
{
  "faceType": "一番近い顔型 (卵型, 丸型, 面長, 逆三角形, ベース型)",
  "skinAge": (数値),
  "scores": [キメ, 弾力, 毛穴, 明るさ, 総合],
  "concerns": ["現在の特徴"],
  "message": "楽しくて元気の出るアドバイス",
  "recommendations": [
    { "name": "施術名", "category": "カテゴリー", "description": "解説", "price_range": "目安" }
  ]
}
※すべて日本語で出力してください。`;

    let successText = '';
    let finalModelName = '';

    for (const modelName of models) {
      try {
        console.log(`Analyzing with AI model: ${modelName}...`);
        const model = genAI.getGenerativeModel({ model: modelName, safetySettings });
        const result = await model.generateContent([{ text: prompt }, { inlineData: { data: base64Data, mimeType } }]);
        const response = await result.response;

        if (response.promptFeedback?.blockReason) {
          console.warn(`Blocked by ${modelName}: ${response.promptFeedback.blockReason}`);
          continue;
        }

        const text = response.text();
        if (text && text.includes('{')) {
          successText = text;
          finalModelName = modelName;
          console.log(`Analysis success with ${modelName}`);
          break;
        }
      } catch (err: any) {
        if (err?.status === 429 || err?.message?.includes('429')) {
          console.warn(`Rate limit hit on ${modelName}`);
          continue;
        }
        console.error(`Error with ${modelName}:`, err.message);
      }
    }

    if (!successText) {
      return NextResponse.json({
        error: '현재 구글 API 할당량이 소진되었거나 요청이 차단되었습니다. 잠시 후 다시 시도해 주세요.'
      }, { status: 429 });
    }

    const resData = parseJson<AnalysisData & AdviceData>(successText);
    return NextResponse.json({
      faceType: resData.faceType || '卵型',
      skinAge: resData.skinAge || 25,
      scores: normalizeScores(resData.scores || []),
      concerns: resData.concerns || [],
      message: resData.message || 'おすすめのケアを継続しましょう。バランスのとれた食生活と十分な睡眠も大切です。',
      recommendations: resData.recommendations || [],
      model: finalModelName
    });

  } catch (error) {
    console.error('Core analysis error:', error);
    return NextResponse.json({ error: '시스템 오류가 발생했습니다.' }, { status: 500 });
  }
}
