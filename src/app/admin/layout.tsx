'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { Inter } from 'next/font/google';
import styles from './admin.module.css';

const inter = Inter({
    subsets: ['latin'],
    variable: '--font-inter',
});

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();

    return (
        <div className={`${styles.adminContainer} ${inter.variable}`}>
            {/* Sidebar Navigation */}
            <aside className={styles.sidebar}>
                <div className={styles.sidebarTitle}>
                    <Image src="/logo.png" alt="AUREUM" width={32} height={32} style={{ marginRight: '8px' }} />
                    <span style={{ fontSize: '0.9em' }}>AUREUM BEAUTY ADMIN</span>
                </div>
                <nav>
                    <ul className={styles.navMenu}>
                        <Link href="/admin" style={{ textDecoration: 'none' }}>
                            <li className={`${styles.navItem} ${pathname === '/admin' ? styles.navItemActive : ''}`}>
                                ダッシュボード
                            </li>
                        </Link>
                        <Link href="/admin/hospitals" style={{ textDecoration: 'none' }}>
                            <li className={`${styles.navItem} ${pathname === '/admin/hospitals' ? styles.navItemActive : ''}`}>
                                登録病院管理
                            </li>
                        </Link>
                        <Link href="/admin/treatments" style={{ textDecoration: 'none' }}>
                            <li className={`${styles.navItem} ${pathname === '/admin/treatments' ? styles.navItemActive : ''}`}>
                                施術管理
                            </li>
                        </Link>
                        <Link href="/admin/settings" style={{ textDecoration: 'none' }}>
                            <li className={`${styles.navItem} ${pathname === '/admin/settings' ? styles.navItemActive : ''}`}>
                                設定
                            </li>
                        </Link>
                    </ul>
                </nav>
            </aside>

            {/* Main Content Area */}
            <main className={styles.mainContent}>
                <header className={styles.headerBar}>
                    <div className={styles.headerTitle}>
                        {pathname === '/admin' && 'ダッシュボード'}
                        {pathname === '/admin/hospitals' && '登録病院管理'}
                        {pathname === '/admin/treatments' && '施術管理'}
                        {pathname === '/admin/settings' && '設定'}
                    </div>
                    <div className={styles.userInfo} style={{ marginLeft: 'auto' }}>
                        <div style={{ position: 'relative', marginRight: '1rem' }}>
                            <span style={{ fontSize: '1.2rem', cursor: 'pointer' }}>🔔</span>
                            <span style={{ position: 'absolute', top: -2, right: -2, width: '8px', height: '8px', background: 'red', borderRadius: '50%' }}></span>
                        </div>
                        <div style={{ textAlign: 'right', lineHeight: '1.2' }}>
                            <div style={{ fontSize: '0.85rem', fontWeight: '600', color: '#333' }}>Admin User</div>
                            <div style={{ fontSize: '0.75rem', color: '#888' }}>Super Admin</div>
                        </div>
                        <div className={styles.userAvatar} style={{ position: 'relative' }}>
                            <Image src="https://ui-avatars.com/api/?name=Admin+User&background=7e3af2&color=fff" alt="User" fill style={{ objectFit: 'cover', borderRadius: '50%' }} unoptimized />
                        </div>
                    </div>
                </header>

                <div className={styles.contentBody}>
                    {children}
                </div>
            </main >
        </div >
    );
}
