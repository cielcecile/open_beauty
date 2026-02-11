import { NextResponse } from 'next/server';

export async function POST(req: Request) {
    try {
        const data = await req.json();

        // n8n Webhook URL for Booking (to Google Sheets)
        const N8N_BOOKING_WEBHOOK = process.env.N8N_BOOKING_WEBHOOK;

        if (!N8N_BOOKING_WEBHOOK) {
            // Mock for development
            console.log('Booking Data (Mock):', data);
            return NextResponse.json({ success: true, message: 'Mocked successful booking' });
        }

        const response = await fetch(N8N_BOOKING_WEBHOOK, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                ...data,
                source: 'Aureum_Web',
                created_at: new Date().toISOString()
            })
        });

        if (!response.ok) throw new Error('Booking API Error');

        return NextResponse.json({ success: true });

    } catch (error) {
        console.error('Booking API error:', error);
        return NextResponse.json({ success: false }, { status: 500 });
    }
}
