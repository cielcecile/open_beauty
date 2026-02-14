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

// Fallback pricing data per hospital ID
const FALLBACK_PRICING: Record<string, PricingItem[]> = {
    'd1': [
        { id: 'fp1', hospital_id: 'd1', treatment_name: 'ピコトーニング', price_krw: 45000, price_jpy: 15000, event_price: 35000, discount_percent: 22, is_active: true, sort_order: 1 },
        { id: 'fp2', hospital_id: 'd1', treatment_name: 'オリジオ (300shot)', price_krw: 350000, price_jpy: 80000, is_active: true, sort_order: 2 },
        { id: 'fp3', hospital_id: 'd1', treatment_name: 'ジュベルック (2cc)', price_krw: 250000, price_jpy: 60000, event_price: 199000, discount_percent: 20, is_active: true, sort_order: 3 },
        { id: 'fp4', hospital_id: 'd1', treatment_name: 'アクアピーリング', price_krw: 50000, price_jpy: 18000, is_active: true, sort_order: 4 },
    ],
    'p1': [
        { id: 'fp5', hospital_id: 'p1', treatment_name: 'フルフェイスボトックス', price_krw: 120000, price_jpy: 35000, is_active: true, sort_order: 1 },
        { id: 'fp6', hospital_id: 'p1', treatment_name: '唇フィラー (1cc)', price_krw: 200000, price_jpy: 50000, event_price: 150000, discount_percent: 25, is_active: true, sort_order: 2 },
        { id: 'fp7', hospital_id: 'p1', treatment_name: '二重手術 (埋没法)', price_krw: 800000, price_jpy: 200000, is_active: true, sort_order: 3 },
    ],
};

/**
 * 해당 병원의 가격표 목록 조회
 */
export async function getPricing(hospitalId: string): Promise<PricingItem[]> {
    try {
        const { data, error } = await supabase
            .from('pricing')
            .select('*')
            .eq('hospital_id', hospitalId)
            .eq('is_active', true)
            .order('sort_order', { ascending: true });

        if (error || !data || data.length === 0) {
            return FALLBACK_PRICING[hospitalId] || getDefaultPricing(hospitalId);
        }

        return data as PricingItem[];
    } catch {
        return FALLBACK_PRICING[hospitalId] || getDefaultPricing(hospitalId);
    }
}

function getDefaultPricing(hospitalId: string): PricingItem[] {
    return [
        { id: 'default1', hospital_id: hospitalId, treatment_name: 'カウンセリング', price_krw: 0, price_jpy: 0, is_active: true, sort_order: 1 },
        { id: 'default2', hospital_id: hospitalId, treatment_name: '基本施術', price_krw: 100000, price_jpy: 30000, is_active: true, sort_order: 2 },
    ];
}
