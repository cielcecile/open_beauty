import { NextResponse } from 'next/server';

export async function POST(req: Request) {
    try {
        const { image } = await req.json();

        // n8n Webhook URL for Vision Analysis
        const N8N_VISION_WEBHOOK = process.env.N8N_VISION_WEBHOOK;

        if (!N8N_VISION_WEBHOOK) {
            // Mock Response for Development with Enhanced Features
            return NextResponse.json({
                faceType: "エレガントなキャットタイプ",
                facialBalance: {
                    symmetryScore: 92,
                    balanceStatus: "左右の対称性が非常に調和しています。特に顔の上部と下部の比率が1:1.1で、黄金比に非常に近いです。",
                    goldenRatioMatch: "88%",
                    advice: "現在、目元が非常に魅力的です。ほうれい線の部位にわずかにボリュームを加えると、より立体的で華やかな印象が完成するでしょう！"
                },
                skinAge: {
                    actualAge: 32,
                    apparentAge: 28,
                    condition: "肌のキメが滑らかで光沢が優れています。",
                    details: "肌のたるみはほとんどありませんが、目元の周りに微細な乾燥が見られます。",
                    recommendation: "高周波リフティング（オリジオ）またはジュベルックスキンブースターで、現在の光沢を維持することをお勧めします。"
                }
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
