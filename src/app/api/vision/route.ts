import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { image } = (await req.json()) as { image?: string };

    if (!image) {
      return NextResponse.json({ error: 'Image is required' }, { status: 400 });
    }

    const webhookUrl = process.env.N8N_VISION_WEBHOOK;
    const isDev = process.env.NODE_ENV !== 'production';

    if (!webhookUrl) {
      if (isDev) {
        return NextResponse.json({
          faceType: 'Balanced',
          facialBalance: {
            symmetryScore: 92,
            balanceStatus: 'Well-balanced facial proportion',
            goldenRatioMatch: '88%',
            advice: 'Maintain hydration and sun protection for sustained skin quality.',
          },
          skinAge: {
            actualAge: 32,
            apparentAge: 28,
            condition: 'Healthy skin condition',
            details: 'Good elasticity and moderate pore visibility.',
            recommendation: 'Use a gentle retinol routine and daily SPF.',
          },
        });
      }

      return NextResponse.json({ error: 'Vision integration is not configured' }, { status: 500 });
    }

    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ image_data: image, timestamp: new Date().toISOString() }),
    });

    if (!response.ok) {
      return NextResponse.json({ error: 'Vision API Error' }, { status: 502 });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Vision API Error:', error);
    return NextResponse.json({ error: 'Failed to process image analysis request' }, { status: 500 });
  }
}
