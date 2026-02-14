'use client';

import styles from '../admin.module.css';

export default function AdminSettingsPage() {
    return (
        <div>
            <div className={styles.header}>
                <h2 className={styles.pageTitle}>⚙️ 管理者設定</h2>
            </div>

            <div className={styles.card}>
                <h3 className={styles.cardTitle}>管理者アカウント設定</h3>
                <p style={{ color: 'var(--admin-text-second)', marginBottom: '1.5rem', fontSize: '1.1rem' }}>
                    管理者アカウントの追加・削除・権限変更が行えます。
                </p>
                <button className={styles.btnPrimary}>管理者を招待</button>
            </div>

            <div className={styles.card}>
                <h3 className={styles.cardTitle}>サイト設定</h3>
                <p style={{ color: 'var(--admin-text-second)', marginBottom: '1.5rem', fontSize: '1.1rem' }}>
                    SEO設定、メタデータ、SNS連携などの設定を行えます。
                </p>
                <button className={styles.btnPrimary}>設定を変更</button>
            </div>
        </div>
    );
}
