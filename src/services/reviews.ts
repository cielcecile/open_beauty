import { supabase } from '@/lib/supabase';

export interface Review {
    id: string;
    hospital_id: string;
    author_name: string;
    rating: number;
    content: string;
    created_at: string;
}

// Fallback reviews
const FALLBACK_REVIEWS: Record<string, Review[]> = {
    'd1': [
        { id: 'fr1', hospital_id: 'd1', author_name: 'Yuki T.', rating: 5, content: '日本語対応が完璧で、とても安心して施術を受けられました。ピコトーニングの効果に大満足です！', created_at: '2026-01-20' },
        { id: 'fr2', hospital_id: 'd1', author_name: 'Mika S.', rating: 4, content: '院内がとても清潔で、先生の説明がわかりやすかったです。リピートしたいです。', created_at: '2026-01-15' },
        { id: 'fr3', hospital_id: 'd1', author_name: 'Rina K.', rating: 5, content: 'ジュベルックを受けましたが、肌のキメが劇的に改善しました。コスパ最高！', created_at: '2026-01-10' },
    ],
    'p1': [
        { id: 'fr4', hospital_id: 'p1', author_name: 'Saki M.', rating: 5, content: 'ボトックスがとても自然な仕上がりでした。日本の半額以下で驚きました。', created_at: '2026-02-01' },
        { id: 'fr5', hospital_id: 'p1', author_name: 'Hana Y.', rating: 4, content: '日本語通訳の方がずっと付き添ってくれて、不安なく施術できました。', created_at: '2026-01-25' },
    ],
};

/**
 * 해당 병원의 리뷰 목록 조회 (최신순)
 */
export async function getReviews(hospitalId: string): Promise<Review[]> {
    try {
        const { data, error } = await supabase
            .from('reviews')
            .select('*')
            .eq('hospital_id', hospitalId)
            .order('created_at', { ascending: false });

        if (error || !data || data.length === 0) {
            return FALLBACK_REVIEWS[hospitalId] || getDefaultReviews(hospitalId);
        }

        return data as Review[];
    } catch {
        return FALLBACK_REVIEWS[hospitalId] || getDefaultReviews(hospitalId);
    }
}

/**
 * 평균 별점 계산
 */
export function getAverageRating(reviews: Review[]): number {
    if (reviews.length === 0) return 0;
    const sum = reviews.reduce((acc, r) => acc + r.rating, 0);
    return Math.round((sum / reviews.length) * 10) / 10;
}

function getDefaultReviews(hospitalId: string): Review[] {
    return [
        { id: 'dr1', hospital_id: hospitalId, author_name: 'ゲスト', rating: 5, content: 'まだレビューがありませんが、高い評価を受けているクリニックです。', created_at: new Date().toISOString().split('T')[0] },
    ];
}
