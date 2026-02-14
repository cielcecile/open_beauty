import { supabase } from '@/lib/supabase';

export interface FAQ {
    id: string;
    hospital_id: string;
    question: string;
    answer: string;
    sort_order: number;
}

// Fallback FAQs
const FALLBACK_FAQS: Record<string, FAQ[]> = {
    'd1': [
        { id: 'ff1', hospital_id: 'd1', question: '日本語で対応できますか？', answer: 'はい、日本語通訳スタッフが常駐しております。LINEでの事前相談も日本語で対応可能です。', sort_order: 1 },
        { id: 'ff2', hospital_id: 'd1', question: '施術後のダウンタイムはどれくらいですか？', answer: 'ピコトーニングはダウンタイムなく、直後からメイクが可能です。ジュベルックは1-2日赤みが出る場合があります。', sort_order: 2 },
        { id: 'ff3', hospital_id: 'd1', question: '予約はどうすればいいですか？', answer: 'LINEまたは当サイトの予約フォームから簡単に予約できます。24時間以内にスタッフからご連絡差し上げます。', sort_order: 3 },
        { id: 'ff4', hospital_id: 'd1', question: '支払い方法は？', answer: 'クレジットカード（VISA, Mastercard, JCB, AMEX）、現金（ウォン・円）、電子決済に対応しています。', sort_order: 4 },
    ],
    'p1': [
        { id: 'ff5', hospital_id: 'p1', question: '空港からの送迎はありますか？', answer: 'はい、仁川空港からの送迎サービスを提供しています。予約時にお申し付けください。', sort_order: 1 },
        { id: 'ff6', hospital_id: 'p1', question: '術後のケアはどうなりますか？', answer: '帰国後もLINEを通じてアフターケアの相談が可能です。術後の経過写真をお送りいただければ、担当医師が確認します。', sort_order: 2 },
        { id: 'ff7', hospital_id: 'p1', question: 'カウンセリングは無料ですか？', answer: 'はい、初回カウンセリングは完全無料です。オンラインでの事前カウンセリングも可能です。', sort_order: 3 },
    ],
};

/**
 * 해당 병원의 FAQ 목록 조회 (정렬순)
 */
export async function getFAQs(hospitalId: string): Promise<FAQ[]> {
    try {
        const { data, error } = await supabase
            .from('faqs')
            .select('*')
            .eq('hospital_id', hospitalId)
            .order('sort_order', { ascending: true });

        if (error || !data || data.length === 0) {
            return FALLBACK_FAQS[hospitalId] || getDefaultFAQs(hospitalId);
        }

        return data as FAQ[];
    } catch {
        return FALLBACK_FAQS[hospitalId] || getDefaultFAQs(hospitalId);
    }
}

function getDefaultFAQs(hospitalId: string): FAQ[] {
    return [
        { id: 'df1', hospital_id: hospitalId, question: '日本語で対応できますか？', answer: 'はい、日本語通訳スタッフが対応いたします。', sort_order: 1 },
        { id: 'df2', hospital_id: hospitalId, question: '予約方法を教えてください', answer: 'LINEまたは当サイトの予約フォームからご予約いただけます。', sort_order: 2 },
    ];
}
