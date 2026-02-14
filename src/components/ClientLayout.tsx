'use client';

import { usePathname } from 'next/navigation';
import Header from "@/components/Header";
import BottomNav from "@/components/BottomNav";
import ChatBot from "@/components/ChatBot";
import Footer from "@/components/Footer";
import { ChatProvider } from "@/context/ChatContext";
import { AuthProvider } from "@/context/AuthContext";

export default function ClientLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();
    const isAdminPage = pathname?.startsWith('/admin');
    const isHospitalDetail = pathname ? /^\/hospitals\/[^/]+$/.test(pathname) : false;
    // 설문·진단·결과 페이지: 몰입 모드 (Header/Footer/BottomNav 숨김)
    const isImmersive = ['/analysis', '/survey', '/result'].some(p => pathname?.startsWith(p));
    const showChrome = !isAdminPage && !isImmersive;

    return (
        <AuthProvider>
            <ChatProvider>
                {showChrome && <Header />}
                <main style={{
                    flex: 1,
                    minHeight: isAdminPage ? '100vh' : 'calc(100vh - 80px)',
                    display: 'flex',
                    flexDirection: 'column',
                    paddingBottom: showChrome ? '80px' : 0
                }}>
                    {children}
                    {showChrome && <Footer />}
                </main>
                {showChrome && <BottomNav />}
                {showChrome && !isHospitalDetail && <ChatBot />}
            </ChatProvider>
        </AuthProvider>
    );
}
