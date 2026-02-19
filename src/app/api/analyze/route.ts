import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextResponse } from 'next/server';

const apiKey = process.env.GEMINI_API_KEY;
const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;

export async function POST(req: Request) {
  try {
    if (!genAI) {
      return NextResponse.json(
        { code: 'GEMINI_KEY_MISSING', error: 'GEMINI_API_KEY が設定されていません。' },
        { status: 500 }
      );
    }

    const { image, concerns = [] } = await req.json();
    const isSurveyOnly = !image;

    const primaryModel = 'gemini-flash-latest';
    const fallbackModel = 'gemini-2.0-flash';

    const promptText = `
You are a friendly Beauty Advisor.
Based on the user's ${isSurveyOnly ? 'concerns' : 'photo and concerns'}, provide style and care advice.
User Concerns: ${concerns.join(', ') || 'None'}

IMPORTANT: Output MUST be valid JSON only. No markdown formatting.
Language: Japanese

JSON Schema:
{
  "faceType": "String",
  "skinAge": Number,
  "scores": [Number, Number, Number, Number, Number],
  "concerns": ["String", "String"],
  "message": "String",
  "recommendations": [
    { "name": "String", "category": "String", "description": "String", "price_range": "String" }
  ]
}
    `;

    const callModel = async (modelName: string) => {
      const model = genAI.getGenerativeModel({ model: modelName });
      if (isSurveyOnly) {
        return model.generateContent(promptText);
      }

      const b64 = image.split(',')[1];
      const mimeType = image.split(':')[0].split(';')[0].split(':')[1];
      return model.generateContent([
        { text: promptText },
        { inlineData: { data: b64, mimeType } },
      ]);
    };

    let result;
    try {
      result = await callModel(primaryModel);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : '';
      if (message.includes('404') || message.includes('Not Found')) {
        result = await callModel(fallbackModel);
      } else {
        throw err;
      }
    }

    const response = await result.response;
    let text = response.text();
    text = text.replace(/```json/g, '').replace(/```/g, '').trim();

    const data = JSON.parse(text);
    return NextResponse.json(data);
  } catch (error: unknown) {
    console.error('API Error:', error);

    let errorMessage = 'AI Analysis Failed';
    let errorCode = 'SERVER_ERROR';

    const message = error instanceof Error ? error.message : '';

    if (message.includes('429') || message.includes('Quota') || message.includes('projects/')) {
      errorCode = 'GEMINI_QUOTA_EXCEEDED';
      errorMessage = 'アクセスが集中しています。1〜2分後に再度お試しください。';
    } else if (message.includes('404') || message.includes('Not Found')) {
      errorCode = 'AI_MODEL_ERROR';
      errorMessage = 'AIモデルの接続に失敗しました。(404)';
    } else if (message.includes('Safety')) {
      errorCode = 'AI_SAFETY_BLOCK';
      errorMessage = '安全性フィルタによりブロックされました。別の写真で再度お試しください。';
    } else if (error instanceof SyntaxError) {
      errorCode = 'AI_RESPONSE_PARSE_ERROR';
      errorMessage = 'AIの応答が不正な形式でした。再度お試しください。';
    }

    return NextResponse.json(
      { code: errorCode, error: errorMessage, details: message },
      { status: 500 }
    );
  }
}
