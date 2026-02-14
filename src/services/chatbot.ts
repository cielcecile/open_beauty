import { supabase } from '@/lib/supabase';

export interface ChatbotConfig {
    id: string;
    hospital_id: string;
    system_prompt: string;
    welcome_message: string;
    is_active: boolean;
    training_data: Record<string, string>[];
}

const DEFAULT_CHATBOT_CONFIG: Omit<ChatbotConfig, 'id' | 'hospital_id'> = {
    system_prompt: 'あなたは韓国美容クリニックの親切な日本語相談員です。施術や価格について丁寧に案内してください。',
    welcome_message: 'こんにちは！何かご質問はありますか？施術や価格について何でもお気軽にどうぞ😊',
    is_active: true,
    training_data: [],
};

/**
 * 해당 병원의 챗봇 설정 조회
 */
export async function getChatbotConfig(hospitalId: string): Promise<ChatbotConfig> {
    try {
        const { data, error } = await supabase
            .from('chatbot_configs')
            .select('*')
            .eq('hospital_id', hospitalId)
            .single();

        if (error || !data) {
            return {
                id: `default-${hospitalId}`,
                hospital_id: hospitalId,
                ...DEFAULT_CHATBOT_CONFIG,
            };
        }

        return data as ChatbotConfig;
    } catch {
        return {
            id: `default-${hospitalId}`,
            hospital_id: hospitalId,
            ...DEFAULT_CHATBOT_CONFIG,
        };
    }
}
