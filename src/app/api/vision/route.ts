import { NextResponse } from 'next/server';

export async function POST(req: Request) {
    try {
        const { image } = await req.json();

        // n8n Webhook URL for Vision Analysis
        const N8N_VISION_WEBHOOK = process.env.N8N_VISION_WEBHOOK;

        if (!N8N_VISION_WEBHOOK) {
            // Mock Response for Development
            return NextResponse.json({
                skinCondition: "全体的に透明感がありますが、目の下のわずかなクマと乾燥が確認されました。",
                facialFeatures: "バランスの取れた卵型の顔立ちで、口角が上がっていて明るい印象です。",
                recommendation: "アクアピールでの毛穴ケアと、目元の集中保湿ケアを推奨します。"
            });
        }

        const response = await fetch(N8N_VISION_WEBHOOK, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                image_data: image,
                timestamp: new Date().toISOString()
            })
        });

        if (!response.ok) throw new Error('Vision API Error');

        const data = await response.json();
        return NextResponse.json(data);

    } catch (error) {
        console.error('Vision API Error:', error);
        return NextResponse.json({ error: '分析中にエラーが発生しました。' }, { status: 500 });
    }
}
