import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
    const baseUrl = 'https://open-beauty.vercel.app';

    // 基本的な静的ページの定義
    const routes = [
        '',
        '/analysis',
        '/hospitals',
        '/quiz/beauty-type',
        '/quiz/k-beauty',
        '/login',
    ].map((route) => ({
        url: `${baseUrl}${route}`,
        lastModified: new Date(),
        changeFrequency: 'daily' as const,
        priority: route === '' ? 1 : 0.8,
    }));

    return [...routes];
}
