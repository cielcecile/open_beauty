import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { checkRateLimit, getRequestIdentifier } from '@/lib/rate-limit';

const geminiApiKey = process.env.GEMINI_API_KEY;
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!geminiApiKey || !supabaseUrl || !supabaseServiceKey) {
  throw new Error('Missing required environment variables for /api/chat');
}

const genAI = new GoogleGenerativeAI(geminiApiKey);
const candidateChatModels = ['gemini-2.5-flash', 'gemini-2.0-flash', 'gemini-1.5-flash'];
const embeddingModel = genAI.getGenerativeModel({ model: 'models/text-embedding-004' });

const supabase = createClient(supabaseUrl, supabaseServiceKey);

type ChatHistoryMessage = {
  role: 'user' | 'model';
  parts: Array<{ text: string }>;
};

type ChatRequestBody = {
  message?: string;
  hospitalId?: string;
  systemPrompt?: string;
  hospitalName?: string;
  history?: ChatHistoryMessage[];
  userId?: string;
};

type MatchKnowledgeRow = {
  content: string;
};

function sanitizeHistory(history: ChatHistoryMessage[] | undefined): ChatHistoryMessage[] {
  if (!Array.isArray(history)) return [];
  return history
    .filter((item) => item && (item.role === 'user' || item.role === 'model'))
    .slice(-10)
    .map((item) => ({
      role: item.role,
      parts: Array.isArray(item.parts) ? item.parts.slice(0, 2) : [],
    }));
}

export async function POST(req: Request) {
  const identifier = getRequestIdentifier(req);
  // Rate limit: 30 requests per minute
  const limit = await checkRateLimit('api-chat', identifier, 30, 60_000);

  if (!limit.allowed) {
    return NextResponse.json(
      { reply: 'リクエストが多すぎます。しばらくしてからもう一度お試しください。' },
      { status: 429, headers: { 'Retry-After': Math.ceil(limit.retryAfterMs / 1000).toString() } }
    );
  }

  try {
    const body = (await req.json()) as ChatRequestBody;
    const message = body.message?.trim();

    if (!message) {
      return NextResponse.json({ reply: 'メッセージを入力してください。' }, { status: 400 });
    }

    if (message.length > 1000) {
      return NextResponse.json({ reply: 'メッセージが長すぎます。1000文字以内で入力してください。' }, { status: 400 });
    }

    let contextText = '';

    if (body.hospitalId) {
      try {
        const embeddingResult = await embeddingModel.embedContent(message);
        const queryEmbedding = embeddingResult.embedding.values;

        // Note: match_hospital_knowledge function must exist in Supabase
        const { data, error } = await supabase.rpc('match_hospital_knowledge', {
          query_embedding: queryEmbedding,
          match_threshold: 0.5,
          match_count: 5,
          filter_hospital_id: body.hospitalId,
        });

        if (!error && Array.isArray(data) && data.length > 0) {
          contextText = (data as MatchKnowledgeRow[]).map((row) => row.content).join('\n\n');
        }
      } catch (error) {
        console.error('RAG lookup error:', error);
      }
    }

    let finalSystemPrompt = body.systemPrompt || 'あなたは美容施術相談AIです。正確で親切に案内してください。';

    if (body.hospitalName) {
      finalSystemPrompt += ` 病院名: ${body.hospitalName}.`;
    }

    if (contextText) {
      finalSystemPrompt += `\n\n病院情報:\n${contextText}\n\n上記の情報に基づいて質問に正確に回答してください。`;
    }

    const promptWithContext = `${finalSystemPrompt}\n\nUser Question: ${message}`;

    let text = '';
    for (const modelName of candidateChatModels) {
      try {
        const model = genAI.getGenerativeModel({ model: modelName });
        const result = await model.generateContent(promptWithContext);
        text = await result.response.text();
        break;
      } catch (err) {
        console.error(`Chat model ${modelName} failed:`, err);
      }
    }

    if (!text) {
      return NextResponse.json(
        { reply: '現在、回答の生成に問題が発生しています。しばらくしてからもう一度お試しください。' },
        { status: 503 }
      );
    }

    // Save chat logs asynchronously
    (async () => {
      try {
        if (!body.hospitalId) return;

        await supabase.from('chat_logs').insert([
          {
            hospital_id: body.hospitalId,
            user_id: body.userId || null,
            role: 'user',
            content: message,
          },
          {
            hospital_id: body.hospitalId,
            user_id: body.userId || null,
            role: 'assistant',
            content: text,
          },
        ]);
      } catch (error) {
        console.error('Failed to save chat logs:', error);
      }
    })();

    return NextResponse.json({ reply: text });
  } catch (error) {
    console.error('Chat API Error:', error);
    return NextResponse.json({ reply: '一時的なエラーが発生しました。しばらくしてからもう一度お試しください。' }, { status: 500 });
  }
}
