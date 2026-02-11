import type { Metadata, Viewport } from "next";
import { Noto_Sans_JP } from "next/font/google";
import "./globals.css";

const notoSansJP = Noto_Sans_JP({
  variable: "--font-noto-sans-jp",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});

export const metadata: Metadata = {
  title: "Aureum | AI 뷰티 자기진단 솔루션",
  description: "AI가 분석하는 당신만의 맞춤형 뷰티 솔루션, Aureum(아울름). 정밀한 분석으로 숨겨진 아름다움을 찾아보세요.",
  keywords: ["AI 뷰티", "자가진단", "피부 분석", "퍼스널 컬러", "뷰티 솔루션", "Aureum"],
  authors: [{ name: "Aureum Team" }],
  openGraph: {
    title: "Aureum | AI 뷰티 자기진단",
    description: "AI가 분석하는 당신만의 맞춤형 뷰티 솔루션",
    url: "https://open-beauty.vercel.app",
    siteName: "Aureum",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Aureum AI Beauty Analysis",
      },
    ],
    locale: "ko_KR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Aureum | AI 뷰티 자기진단",
    description: "AI가 분석하는 맞춤형 뷰티 솔루션",
    images: ["/og-image.jpg"],
  },
  other: {
    "geo.region": "KR",
    "geo.placename": "Seoul",
    "geo.position": "37.5665;126.9780",
    "ICBM": "37.5665, 126.9780",
  }
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
};


import ChatBot from "@/components/ChatBot";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body className={`${notoSansJP.variable}`}>
        {children}
        <ChatBot />
      </body>
    </html>
  );
}
