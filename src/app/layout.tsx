import type { Metadata, Viewport } from "next";
import { Noto_Sans_JP } from "next/font/google";
import "./globals.css";

const notoSansJP = Noto_Sans_JP({
  variable: "--font-noto-sans-jp",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});

export const metadata: Metadata = {
  title: "Aureum | AIビューティー自己診断",
  description: "AIが分析する、あなただけのビューティーソリューション、Aureum（アウルム）",
  openGraph: {
    title: "Aureum | AIビューティー自己診断",
    description: "AIが分析する、あなただけのビューティーソリューション",
    images: ["/og-image.jpg"],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
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
