'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import styles from './BottomNav.module.css';
import { useChat } from '@/context/ChatContext';

const NAV_ITEMS = [
    { label: 'ホーム', href: '/', icon: '🏠', type: 'link' },
    { label: 'AI分析', href: '/analysis', icon: '✨', type: 'link' },
    { label: '準備', href: '/packages', icon: '✈️', type: 'link' },
    { label: 'AI相談', href: '#chat', icon: '💬', type: 'button' },
    { label: 'マイ', href: '/mypage', icon: '👤', type: 'link' },
];

export default function BottomNav() {
    const pathname = usePathname();
    const { toggleChat, isOpen } = useChat();

    return (
        <nav className={styles.bottomNav}>
            {NAV_ITEMS.map((item) => {
                if (item.type === 'button') {
                    return (
                        <button
                            key={item.label}
                            className={`${styles.navItem} ${isOpen ? styles.active : ''}`}
                            onClick={toggleChat}
                            style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}
                        >
                            <span className={styles.icon}>{item.icon}</span>
                            <span className={styles.label}>{item.label}</span>
                        </button>
                    );
                }
                return (
                    <Link
                        key={item.href}
                        href={item.href}
                        className={`${styles.navItem} ${pathname === item.href ? styles.active : ''}`}
                    >
                        <span className={styles.icon}>{item.icon}</span>
                        <span className={styles.label}>{item.label}</span>
                    </Link>
                );
            })}
        </nav>
    );
}
