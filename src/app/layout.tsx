import type { Metadata, Viewport } from "next";
import { Noto_Sans_JP } from "next/font/google";
import "./globals.css";

const notoSansJP = Noto_Sans_JP({
  variable: "--font-noto-sans-jp",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});

export const metadata: Metadata = {
  title: "AUREUM BEAUTY | AIビューティー自己診断ソリューション",
  description: "AIが分析するあなただけのオーダーメイドビューティーソリューション、AUREUM BEAUTY。精密な分析で隠れた美しさを見つけましょう。",
  keywords: ["AIビューティー", "自己診断", "肌分析", "パーソナルカラー", "ビューティーソリューション", "AUREUM BEAUTY"],
  authors: [{ name: "AUREUM BEAUTY Team" }],
  openGraph: {
    title: "AUREUM BEAUTY | AIビューティー自己診断",
    description: "AIが分析するあなただけのオーダーメイドビューティーソリューション",
    url: "https://open-beauty.vercel.app",
    siteName: "AUREUM BEAUTY",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "AUREUM BEAUTY AI Beauty Analysis",
      },
    ],
    locale: "ja_JP",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "AUREUM BEAUTY | AIビューティー自己診断",
    description: "AIが分析するオーダーメイドビューティーソリューション",
    images: ["/og-image.jpg"],
  },
  other: {
    "geo.region": "JP",
    "geo.placename": "Tokyo",
    "geo.position": "35.6895;139.6917",
    "ICBM": "35.6895, 139.6917",
  }
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
};



import ClientLayout from "@/components/ClientLayout";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body className={`${notoSansJP.variable} flex-layout`}>
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}
