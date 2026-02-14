import { supabase } from '@/lib/supabase';

export interface Hospital {
    id: string;
    name: string;
    category: 'DERMATOLOGY' | 'PLASTIC' | 'DENTISTRY' | 'ORIENTAL';
    description: string;
    detail_description?: string;
    image_url: string;
    address?: string;
    lat?: number;
    lng?: number;
    rank: number;
    created_at?: string;
}

// Fallback data for when Supabase is not configured or has no data
import { INITIAL_CLINICS } from '@/data/clinics';

function clinicToHospital(clinic: typeof INITIAL_CLINICS[0]): Hospital {
    return {
        id: clinic.id,
        name: clinic.name,
        category: clinic.category,
        description: clinic.description,
        detail_description: clinic.detailDescription,
        image_url: clinic.image,
        address: clinic.address,
        lat: clinic.location?.lat,
        lng: clinic.location?.lng,
        rank: clinic.rank,
    };
}

/**
 * 병원 목록 조회 (카테고리 필터 옵션)
 */
export async function getHospitals(category?: string): Promise<Hospital[]> {
    try {
        let query = supabase
            .from('hospitals')
            .select('*')
            .order('rank', { ascending: true });

        if (category) {
            query = query.eq('category', category);
        }

        const { data, error } = await query;

        if (error || !data || data.length === 0) {
            // Fallback to local data
            const fallback = category
                ? INITIAL_CLINICS.filter(c => c.category === category)
                : INITIAL_CLINICS;
            return fallback.map(clinicToHospital);
        }

        return data as Hospital[];
    } catch {
        const fallback = category
            ? INITIAL_CLINICS.filter(c => c.category === category)
            : INITIAL_CLINICS;
        return fallback.map(clinicToHospital);
    }
}

/**
 * 병원 단건 조회
 */
export async function getHospital(id: string): Promise<Hospital | null> {
    try {
        const { data, error } = await supabase
            .from('hospitals')
            .select('*')
            .eq('id', id)
            .single();

        if (error || !data) {
            // Fallback to local data
            const clinic = INITIAL_CLINICS.find(c => c.id === id);
            return clinic ? clinicToHospital(clinic) : null;
        }

        return data as Hospital;
    } catch {
        const clinic = INITIAL_CLINICS.find(c => c.id === id);
        return clinic ? clinicToHospital(clinic) : null;
    }
}
