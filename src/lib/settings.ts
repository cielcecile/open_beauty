import { supabase } from './supabase';

export interface SiteSettings {
    site_name: string;
    site_description: string;
    seo_keywords: string;
    instagram_url?: string;
    facebook_url?: string;
    line_url?: string;
}

const DEFAULT_SETTINGS: SiteSettings = {
    site_name: 'AUREUM BEAUTY',
    site_description: '최상의 맞춤형 뷰티 컨설팅, 아우름 뷰티와 함께하세요.',
    seo_keywords: '뷰티, 한국성형, 일본성형, 뷰티컨설팅, AUREUM',
};

export async function getSiteSettings(): Promise<SiteSettings> {
    try {
        const { data, error } = await supabase
            .from('site_settings')
            .select('*')
            .eq('id', 1)
            .single();

        if (error || !data) return DEFAULT_SETTINGS;

        return {
            site_name: data.site_name || DEFAULT_SETTINGS.site_name,
            site_description: data.site_description || DEFAULT_SETTINGS.site_description,
            seo_keywords: data.seo_keywords || DEFAULT_SETTINGS.seo_keywords,
            instagram_url: data.instagram_url,
            facebook_url: data.facebook_url,
            line_url: data.line_url,
        };
    } catch (e) {
        return DEFAULT_SETTINGS;
    }
}
