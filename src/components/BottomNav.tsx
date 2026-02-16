'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import styles from './BottomNav.module.css';
import { useChat } from '@/context/ChatContext';
import { useAuth } from '@/context/AuthContext';

const NAV_ITEMS = [
  { label: 'ホーム', href: '/', icon: 'HM', type: 'link' },
  { label: 'AI分析', href: '/analysis', icon: 'AI', type: 'link' },
  { label: 'クリニック', href: '/hospitals', icon: 'CL', type: 'link' },
  { label: 'メニュー', href: '/packages', icon: 'PK', type: 'link' },
  { label: 'マイ', href: '/mypage', icon: 'MY', type: 'link' },
  { label: 'AI相談', href: '#chat', icon: 'CH', type: 'button' },
] as const;

export default function BottomNav() {
  const pathname = usePathname();
  const { toggleChat, isOpen } = useChat();
  const { user } = useAuth();

  const visibleItems = NAV_ITEMS.filter((item) => !(item.href === '/mypage' && !user));

  return (
    <nav className={styles.bottomNav}>
      {visibleItems.map((item) => {
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
          <Link key={item.href} href={item.href} className={`${styles.navItem} ${pathname === item.href ? styles.active : ''}`}>
            <span className={styles.icon}>{item.icon}</span>
            <span className={styles.label}>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
