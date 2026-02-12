'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import styles from './BottomNav.module.css';

const NAV_ITEMS = [
    { label: 'ホーム', href: '/', icon: '🏠' },
    { label: 'AI分析', href: '/analysis', icon: '✨' },
    { label: '準備', href: '/packages', icon: '✈️' },
    { label: 'マイ', href: '/mypage', icon: '👤' },
];

export default function BottomNav() {
    const pathname = usePathname();

    return (
        <nav className={styles.bottomNav}>
            {NAV_ITEMS.map((item) => (
                <Link
                    key={item.href}
                    href={item.href}
                    className={`${styles.navItem} ${pathname === item.href ? styles.active : ''}`}
                >
                    <span className={styles.icon}>{item.icon}</span>
                    <span className={styles.label}>{item.label}</span>
                </Link>
            ))}
        </nav>
    );
}
