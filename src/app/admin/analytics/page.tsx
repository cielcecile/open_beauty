'use client';

import styles from '../admin.module.css';

export default function AdminAnalyticsPage() {
    return (
        <div>
            <header className={styles.header}>
                <h1 className={styles.pageTitle}>統計 (Analytics)</h1>
            </header>
            <div className={styles.cardGrid}>
                <div className={styles.card}>
                    <h2 className={styles.cardTitle}>月間アクセス</h2>
                    <p style={{ fontSize: '2rem', fontWeight: 'bold' }}>-</p>
                </div>
                <div className={styles.card}>
                    <h2 className={styles.cardTitle}>新規ユーザー</h2>
                    <p style={{ fontSize: '2rem', fontWeight: 'bold' }}>-</p>
                </div>
                <div className={styles.card}>
                    <h2 className={styles.cardTitle}>予約数</h2>
                    <p style={{ fontSize: '2rem', fontWeight: 'bold' }}>-</p>
                </div>
            </div>
            <div className={styles.tableContainer}>
                <div style={{ padding: '2rem', textAlign: 'center', color: '#666' }}>
                    データ集計機能は準備中です。
                </div>
            </div>
        </div>
    );
}
