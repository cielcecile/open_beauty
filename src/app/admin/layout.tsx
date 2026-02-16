'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Inter } from 'next/font/google';
import { useAuth } from '@/context/AuthContext';
import { isAdminEmail } from '@/lib/admin';
import styles from './admin.module.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, loading } = useAuth();
  const allowed = isAdminEmail(user?.email);

  useEffect(() => {
    if (!loading && !allowed) router.replace('/');
  }, [allowed, loading, router]);

  if (loading || !allowed) {
    return (
      <div className={`${styles.adminContainer} ${inter.variable}`}>
        <main className={styles.mainContent}>
          <div className={styles.contentBody}>管理者権限を確認中...</div>
        </main>
      </div>
    );
  }

  return (
    <div className={`${styles.adminContainer} ${inter.variable}`}>
      <aside className={styles.sidebar}>
        <div className={styles.sidebarTitle}>
          <Image src="/logo.png" alt="AUREUM" width={32} height={32} style={{ marginRight: '8px' }} />
          <span style={{ fontSize: '0.9em' }}>AUREUM BEAUTY ADMIN</span>
        </div>
        <nav>
          <ul className={styles.navMenu}>
            <Link href="/admin" style={{ textDecoration: 'none' }}><li className={`${styles.navItem} ${pathname === '/admin' ? styles.navItemActive : ''}`}>ダッシュボード</li></Link>
            <Link href="/admin/hospitals" style={{ textDecoration: 'none' }}><li className={`${styles.navItem} ${pathname === '/admin/hospitals' ? styles.navItemActive : ''}`}>病院管理</li></Link>
            <Link href="/admin/treatments" style={{ textDecoration: 'none' }}><li className={`${styles.navItem} ${pathname === '/admin/treatments' ? styles.navItemActive : ''}`}>施術管理</li></Link>
            <Link href="/admin/settings" style={{ textDecoration: 'none' }}><li className={`${styles.navItem} ${pathname === '/admin/settings' ? styles.navItemActive : ''}`}>設定</li></Link>
          </ul>
        </nav>
      </aside>

      <main className={styles.mainContent}>
        <header className={styles.headerBar}>
          <div className={styles.headerTitle}>
            {pathname === '/admin' && 'ダッシュボード'}
            {pathname === '/admin/hospitals' && '病院管理'}
            {pathname === '/admin/treatments' && '施術管理'}
            {pathname === '/admin/settings' && '設定'}
          </div>
          <div className={styles.userInfo} style={{ marginLeft: 'auto' }}>
            <div style={{ textAlign: 'right', lineHeight: '1.2' }}>
              <div style={{ fontSize: '0.85rem', fontWeight: '600', color: '#333' }}>{user?.email}</div>
              <div style={{ fontSize: '0.75rem', color: '#888' }}>管理者</div>
            </div>
            <div className={styles.userAvatar} style={{ position: 'relative' }}>
              <Image src="https://ui-avatars.com/api/?name=管理者&background=7e3af2&color=fff" alt="管理者" fill style={{ objectFit: 'cover', borderRadius: '50%' }} unoptimized />
            </div>
          </div>
        </header>
        <div className={styles.contentBody}>{children}</div>
      </main>
    </div>
  );
}


