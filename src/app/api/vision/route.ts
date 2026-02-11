import { NextResponse } from 'next/server';

export async function POST(req: Request) {
    try {
        const { image } = await req.json();

        // n8n Webhook URL for Vision Analysis
        const N8N_VISION_WEBHOOK = process.env.N8N_VISION_WEBHOOK;

        if (!N8N_VISION_WEBHOOK) {
            // Mock Response for Development with Enhanced Features
            return NextResponse.json({
                faceType: "우아한 고양이형",
                facialBalance: {
                    symmetryScore: 92,
                    balanceStatus: "좌우 대칭이 매우 조화롭습니다. 특히 상안부와 하안부의 비율이 1:1.1로 한국인의 황금 비율에 근접해 있습니다.",
                    goldenRatioMatch: "88%",
                    advice: "현재 눈매가 매우 매력적입니다. 팔자 주름 부위에 미세하게 볼륨을 더한다면 더욱 입체적이고 화사한 인상이 완성될 거예요!"
                },
                skinAge: {
                    actualAge: 32,
                    apparentAge: 28,
                    condition: "피부결이 매끄럽고 광택이 우수합니다.",
                    details: "피부 처짐은 거의 없으나, 눈가 주변의 미세한 건조함이 보입니다.",
                    recommendation: "고주파 리프팅(올리지오) 또는 쥬베룩 스킨부스터로 현재의 광택을 유지하는 것을 권장합니다."
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
        return NextResponse.json({ error: '분석 중에 에러가 발생했습니다.' }, { status: 500 });
    }
}

