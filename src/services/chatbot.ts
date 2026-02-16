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
    system_prompt: 'あなたは美容クリニックの日本語相談アシスタントです。施術の特徴、費用、ダウンタイム、注意事項を正確かつ丁寧に案内してください。医療診断は行わず、必要時は医師相談を案内してください。',
    welcome_message: 'こんにちは。気になる施術や費用、ダウンタイムについてお気軽にご相談ください。',
    is_active: true,
    training_data: [],
};

/**
 * 指定クリニックのチャットボット設定を取得
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
