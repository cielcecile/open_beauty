import { supabase } from '@/lib/supabase';

export interface PricingItem {
  id: string;
  hospital_id: string;
  treatment_name: string;
  price_krw: number;
  price_jpy: number;
  event_price?: number;
  discount_percent?: number;
  is_active: boolean;
  sort_order: number;
}

const isDev = process.env.NODE_ENV !== 'production';

const FALLBACK_PRICING: Record<string, PricingItem[]> = {
  d1: [
    { id: 'fp1', hospital_id: 'd1', treatment_name: 'Skin booster', price_krw: 45000, price_jpy: 15000, event_price: 35000, discount_percent: 22, is_active: true, sort_order: 1 },
    { id: 'fp2', hospital_id: 'd1', treatment_name: 'Lifting 300shot', price_krw: 350000, price_jpy: 80000, is_active: true, sort_order: 2 },
  ],
};

export async function getPricing(hospitalId: string): Promise<PricingItem[]> {
  const { data, error } = await supabase
    .from('pricing')
    .select('*')
    .eq('hospital_id', hospitalId)
    .eq('is_active', true)
    .order('sort_order', { ascending: true });

  if (error || !data) {
    if (isDev) return FALLBACK_PRICING[hospitalId] || getDefaultPricing(hospitalId);
    throw new Error('Failed to load pricing from database.');
  }

  if (data.length === 0 && isDev) return FALLBACK_PRICING[hospitalId] || getDefaultPricing(hospitalId);
  return data as PricingItem[];
}

function getDefaultPricing(hospitalId: string): PricingItem[] {
  return [
    { id: 'default1', hospital_id: hospitalId, treatment_name: 'Consultation', price_krw: 0, price_jpy: 0, is_active: true, sort_order: 1 },
  ];
}
