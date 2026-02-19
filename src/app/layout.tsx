import type { Metadata, Viewport } from 'next';
import { Noto_Sans_JP } from 'next/font/google';
import './globals.css';
import ClientLayout from '@/components/ClientLayout';
import { AntdRegistry } from '@ant-design/nextjs-registry';
import { ConfigProvider } from 'antd';

const notoSansJP = Noto_Sans_JP({
  variable: '--font-noto-sans-jp',
  subsets: ['latin'],
  weight: ['400', '500', '700'],
});

export const metadata: Metadata = {
  title: {
    template: '%s | AUREUM BEAUTY',
    default: 'AUREUM BEAUTY | AI美容分析とプレミアム施術提案',
  },
  description: 'AUREUM BEAUTYは、最先端のAI技術であなたの肌を分析し、最適な美容施術とクリニックを提案するプレミアムサービスです。',
  keywords: ['AI美容分析', '肌診断', '美容整形', 'クリニック比較', '韓国美容', 'AUREUM BEAUTY', 'アンチエイジング'],
  authors: [{ name: 'AUREUM BEAUTY Team' }],
  metadataBase: new URL('https://open-beauty.vercel.app'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'AUREUM BEAUTY | AI美容分析とプレミアム施術提案',
    description: 'AIであなたに真に合う美容施術を見つけましょう。洗練された美容体験をここから。',
    url: 'https://open-beauty.vercel.app',
    siteName: 'AUREUM BEAUTY',
    images: [{ url: '/og-image.jpg', width: 1200, height: 630, alt: 'AUREUM BEAUTY Premium AI Analysis' }],
    locale: 'ja_JP',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AUREUM BEAUTY | AI美容分析',
    description: 'AIで導き出す、あなただけの美しさ。',
    images: ['/og-image.jpg'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ja">
      <body className={`${notoSansJP.variable} flex-layout`}>
        <AntdRegistry>
          <ConfigProvider
            theme={{
              token: {
                colorPrimary: '#D4AF37',
                borderRadius: 8,
                fontFamily: 'var(--font-noto-sans-jp)',
              },
            }}
          >
            <ClientLayout>{children}</ClientLayout>
          </ConfigProvider>
        </AntdRegistry>
      </body>
    </html>
  );
}

