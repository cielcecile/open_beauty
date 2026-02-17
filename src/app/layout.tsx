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
  title: 'AUREUM BEAUTY | AI美容分析',
  description: 'AI画像分析・施術提案・クリニック比較・チャット相談を一つのサービスで提供します。',
  keywords: ['AI美容分析', '美容施術', 'クリニック比較', 'AUREUM BEAUTY'],
  authors: [{ name: 'AUREUM BEAUTY Team' }],
  openGraph: {
    title: 'AUREUM BEAUTY | AI美容分析',
    description: 'AIであなたに合う美容施術を見つけましょう。',
    url: 'https://open-beauty.vercel.app',
    siteName: 'AUREUM BEAUTY',
    images: [{ url: '/og-image.jpg', width: 1200, height: 630, alt: 'AUREUM BEAUTY AI Beauty Analysis' }],
    locale: 'ja_JP',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AUREUM BEAUTY | AI美容分析',
    description: 'AIで美容分析と施術提案を体験してください。',
    images: ['/og-image.jpg'],
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

