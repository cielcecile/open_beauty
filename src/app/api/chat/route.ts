import { NextResponse } from 'next/server';

export async function POST(req: Request) {
    try {
        const { message } = await req.json();

        // n8n Webhook URL (User should configure this)
        const N8N_WEBHOOK_URL = process.env.N8N_WEBHOOK_URL;

        if (!N8N_WEBHOOK_URL) {
            // Fallback for development if n8n is not yet connected
            return NextResponse.json({
                reply: `[Demo Mode] 「${message}」についてのご質問ですね。現在は開発中のため、具体的な価格回答はn8n連携後に可能となります。`
            });
        }

        const response = await fetch(N8N_WEBHOOK_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                question: message,
                timestamp: new Date().toISOString()
            })
        });

        if (!response.ok) throw new Error('n8n error');

        const data = await response.json();
        return NextResponse.json({ reply: data.output || data.message });

    } catch (error) {
        console.error('Chat API Error:', error);
        return NextResponse.json({ reply: '申し訳ありません。システムエラーが発生しました。' }, { status: 500 });
    }
}
