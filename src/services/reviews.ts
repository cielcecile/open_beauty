import { supabase } from '@/lib/supabase';

export interface Review {
  id: string;
  hospital_id: string;
  author_name: string;
  rating: number;
  content: string;
  created_at: string;
}

const isDev = process.env.NODE_ENV !== 'production';

const FALLBACK_REVIEWS: Record<string, Review[]> = {
  d1: [
    { id: 'fr1', hospital_id: 'd1', author_name: 'Yuki T.', rating: 5, content: 'Friendly consultation and clear pricing.', created_at: '2026-01-20' },
  ],
};

export async function getReviews(hospitalId: string): Promise<Review[]> {
  const { data, error } = await supabase
    .from('reviews')
    .select('*')
    .eq('hospital_id', hospitalId)
    .order('created_at', { ascending: false });

  if (error || !data) {
    if (isDev) return FALLBACK_REVIEWS[hospitalId] || getDefaultReviews(hospitalId);
    throw new Error('Failed to load reviews from database.');
  }

  if (data.length === 0 && isDev) return FALLBACK_REVIEWS[hospitalId] || getDefaultReviews(hospitalId);
  return data as Review[];
}

export function getAverageRating(reviews: Review[]): number {
  if (reviews.length === 0) return 0;
  const sum = reviews.reduce((acc, review) => acc + review.rating, 0);
  return Math.round((sum / reviews.length) * 10) / 10;
}

function getDefaultReviews(hospitalId: string): Review[] {
  return [
    { id: 'dr1', hospital_id: hospitalId, author_name: 'Guest', rating: 5, content: 'Great support and process.', created_at: new Date().toISOString().split('T')[0] },
  ];
}
