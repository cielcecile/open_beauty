import { supabase } from '@/lib/supabase';
import { INITIAL_CLINICS } from '@/data/clinics';

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

const isDev = process.env.NODE_ENV !== 'production';

function clinicToHospital(clinic: (typeof INITIAL_CLINICS)[0]): Hospital {
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

export async function getHospitals(category?: string): Promise<Hospital[]> {
  let query = supabase.from('hospitals').select('*').order('rank', { ascending: true });
  if (category) query = query.eq('category', category);

  const { data, error } = await query;

  if (error || !data) {
    if (isDev) {
      const fallback = category ? INITIAL_CLINICS.filter((clinic) => clinic.category === category) : INITIAL_CLINICS;
      return fallback.map(clinicToHospital);
    }
    throw new Error('Failed to load hospitals from database.');
  }

  if (data.length === 0 && isDev) {
    const fallback = category ? INITIAL_CLINICS.filter((clinic) => clinic.category === category) : INITIAL_CLINICS;
    return fallback.map(clinicToHospital);
  }

  return data as Hospital[];
}

export async function getHospital(id: string): Promise<Hospital | null> {
  const { data, error } = await supabase.from('hospitals').select('*').eq('id', id).single();

  if (error || !data) {
    if (isDev) {
      const clinic = INITIAL_CLINICS.find((item) => item.id === id);
      return clinic ? clinicToHospital(clinic) : null;
    }

    if (error?.code === 'PGRST116') return null;
    throw new Error('Failed to load hospital from database.');
  }

  return data as Hospital;
}
