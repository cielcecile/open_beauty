'use client';

import { usePathname } from 'next/navigation';
import Header from "@/components/Header";
import BottomNav from "@/components/BottomNav";
import ChatBot from "@/components/ChatBot";
import { ChatProvider } from "@/context/ChatContext";

export default function ClientLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();
    const isAdminPage = pathname?.startsWith('/admin');

    return (
        <ChatProvider>
            {!isAdminPage && <Header />}
            <main style={{
                flex: 1,
                minHeight: isAdminPage ? '100vh' : 'calc(100vh - 80px)',
                display: 'flex',
                flexDirection: 'column',
                paddingBottom: isAdminPage ? 0 : '80px'
            }}>
                {children}
            </main>
            {!isAdminPage && <BottomNav />}
            {!isAdminPage && <ChatBot />}
        </ChatProvider>
    );
}
