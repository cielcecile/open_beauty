import { supabase } from '@/lib/supabase';

export interface FAQ {
  id: string;
  hospital_id: string;
  question: string;
  answer: string;
  sort_order: number;
}

const isDev = process.env.NODE_ENV !== 'production';

const FALLBACK_FAQS: Record<string, FAQ[]> = {
  d1: [
    { id: 'ff1', hospital_id: 'd1', question: 'How can I make a reservation?', answer: 'Use chat or contact the clinic directly.', sort_order: 1 },
  ],
};

export async function getFAQs(hospitalId: string): Promise<FAQ[]> {
  const { data, error } = await supabase
    .from('faqs')
    .select('*')
    .eq('hospital_id', hospitalId)
    .order('sort_order', { ascending: true });

  if (error || !data) {
    if (isDev) return FALLBACK_FAQS[hospitalId] || getDefaultFAQs(hospitalId);
    throw new Error('Failed to load FAQs from database.');
  }

  if (data.length === 0 && isDev) return FALLBACK_FAQS[hospitalId] || getDefaultFAQs(hospitalId);
  return data as FAQ[];
}

function getDefaultFAQs(hospitalId: string): FAQ[] {
  return [
    { id: 'df1', hospital_id: hospitalId, question: 'How do I contact the clinic?', answer: 'Please use in-app chat.', sort_order: 1 },
  ];
}
