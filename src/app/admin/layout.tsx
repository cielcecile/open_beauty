'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import styles from './admin.module.css';

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();

    return (
        <div className={styles.adminContainer}>
            {/* Sidebar Navigation */}
            <aside className={styles.sidebar}>
                <div className={styles.sidebarTitle}>AUREUM ADMIN</div>
                <nav>
                    <ul className={styles.navMenu}>
                        <Link href="/admin/hospitals" style={{ textDecoration: 'none' }}>
                            <li className={`${styles.navItem} ${pathname === '/admin/hospitals' ? styles.navItemActive : ''}`}>
                                登録病院管理
                            </li>
                        </Link>
                        <Link href="/admin/pricing" style={{ textDecoration: 'none' }}>
                            <li className={`${styles.navItem} ${pathname === '/admin/pricing' ? styles.navItemActive : ''}`}>
                                価格表・FAQ
                            </li>
                        </Link>
                        <Link href="/admin/analytics" style={{ textDecoration: 'none' }}>
                            <li className={`${styles.navItem} ${pathname === '/admin/analytics' ? styles.navItemActive : ''}`}>
                                統計 (Analytics)
                            </li>
                        </Link>
                        <Link href="/admin/settings" style={{ textDecoration: 'none' }}>
                            <li className={`${styles.navItem} ${pathname === '/admin/settings' ? styles.navItemActive : ''}`}>
                                設定 (Settings)
                            </li>
                        </Link>
                    </ul>
                </nav>
            </aside>

            {/* Main Content Area */}
            <main className={styles.mainContent}>
                {children}
            </main>
        </div>
    );
}
