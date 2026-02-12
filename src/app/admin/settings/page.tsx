'use client';

import styles from '../admin.module.css';

export default function AdminSettingsPage() {
    return (
        <div>
            <div className={styles.tableContainer}>
                <div style={{ padding: '2rem' }}>
                    <div className={styles.card} style={{ marginBottom: '1rem' }}>
                        <h2 className={styles.cardTitle}>管理者アカウント設定</h2>
                        <p style={{ color: '#666', marginBottom: '1rem' }}>
                            管理者アカウントの追加・削除・権限変更が行えます。
                        </p>
                        <button className={styles.actionBtn}>管理者を招待</button>
                    </div>

                    <div className={styles.card}>
                        <h2 className={styles.cardTitle}>サイト設定</h2>
                        <p style={{ color: '#666', marginBottom: '1rem' }}>
                            SEO設定、メタデータ、SNS連携などの設定を行えます。
                        </p>
                        <button className={styles.actionBtn}>設定を変更</button>
                    </div>
                </div>
            </div>
        </div>
    );
}
