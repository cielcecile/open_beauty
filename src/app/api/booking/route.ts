import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const data = await req.json();
    const webhookUrl = process.env.N8N_BOOKING_WEBHOOK;
    const isDev = process.env.NODE_ENV !== 'production';

    if (!webhookUrl) {
      if (isDev) {
        console.log('Booking Data (Mock):', data);
        return NextResponse.json({ success: true, message: 'Mocked successful booking' });
      }

      return NextResponse.json({ success: false, error: 'Booking integration is not configured' }, { status: 500 });
    }

    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...data,
        source: 'Aureum_Web',
        created_at: new Date().toISOString(),
      }),
    });

    if (!response.ok) {
      return NextResponse.json({ success: false, error: 'Booking API Error' }, { status: 502 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Booking API error:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
