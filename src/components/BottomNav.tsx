'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useChat } from '@/context/ChatContext';
import { useAuth } from '@/context/AuthContext';
import {
  HomeOutlined,
  ScanOutlined,
  MedicineBoxOutlined,
  RocketOutlined,
  UserOutlined,
  MessageOutlined
} from '@ant-design/icons';
import styles from './BottomNav.module.css';

const NAV_ITEMS = [
  { label: 'ホーム', href: '/', icon: <HomeOutlined />, type: 'link' },
  { label: 'AI分析', href: '/analysis', icon: <ScanOutlined />, type: 'link' },
  { label: 'クリニック', href: '/hospitals', icon: <MedicineBoxOutlined />, type: 'link' },
  { label: 'メニュー', href: '/packages', icon: <RocketOutlined />, type: 'link' },
  { label: 'マイ', href: '/mypage', icon: <UserOutlined />, type: 'link' },
  { label: 'AI相談', href: '#chat', icon: <MessageOutlined />, type: 'button' },
] as const;

export default function BottomNav() {
  const pathname = usePathname();
  const { toggleChat, isOpen } = useChat();
  const { user } = useAuth();

  const visibleItems = NAV_ITEMS.filter((item) => !(item.href === '/mypage' && !user));

  return (
    <nav className={styles.bottomNav} style={{
      position: 'fixed',
      bottom: 0,
      left: 0,
      right: 0,
      height: '64px',
      background: 'rgba(255, 255, 255, 0.9)',
      backdropFilter: 'blur(10px)',
      display: 'flex',
      justifyContent: 'space-around',
      alignItems: 'center',
      borderTop: '1px solid #f0f0f0',
      zIndex: 1000,
      padding: '0 10px'
    }}>
      {visibleItems.map((item) => {
        const isActive = pathname === item.href || (item.type === 'button' && isOpen);

        const content = (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            color: isActive ? '#D4AF37' : '#8c8c8c',
            transition: 'all 0.3s',
            cursor: 'pointer'
          }}>
            <span style={{ fontSize: '20px', marginBottom: '4px' }}>{item.icon}</span>
            <span style={{ fontSize: '10px', fontWeight: isActive ? 600 : 400 }}>{item.label}</span>
          </div>
        );

        if (item.type === 'button') {
          return (
            <div key={item.label} onClick={toggleChat}>
              {content}
            </div>
          );
        }

        return (
          <Link key={item.href} href={item.href} style={{ textDecoration: 'none' }}>
            {content}
          </Link>
        );
      })}
    </nav>
  );
}
