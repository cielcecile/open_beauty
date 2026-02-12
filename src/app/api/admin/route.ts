import { NextResponse } from 'next/server';

// Mock DB for initial setup
const hospitals = [
    { id: 1, name: 'Lienjang Clinic (Gangnam)', location: 'Seoul, Gangnam-gu', status: 'Active' },
    { id: 2, name: 'AUREUM Signature', location: 'Seoul, Sinsa-dong', status: 'Active' }
];

export async function GET() {
    return NextResponse.json({ hospitals });
}

export async function POST(req: Request) {
    try {
        const data = await req.json();

        if (data.type === 'hospital') {
            const newHospital = { id: hospitals.length + 1, ...data.payload, status: 'Active' };
            hospitals.push(newHospital);
            return NextResponse.json({ success: true, hospital: newHospital });
        }

        return NextResponse.json({ success: false, message: 'Invalid data type' }, { status: 400 });

    } catch (err) {
        console.error('admin POST error:', err);
        return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 });
    }
}
