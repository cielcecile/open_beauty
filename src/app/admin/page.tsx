'use client';

import { useState } from 'react';
import styles from './admin.module.css';

export default function AdminPage() {
    const [activeTab, setActiveTab] = useState('hospitals');

    return (
        <div className={styles.adminContainer}>
            {/* Sidebar Navigation */}
            <aside className={styles.sidebar}>
                <div className={styles.sidebarTitle}>AUREUM ADMIN</div>
                <nav>
                    <ul className={styles.navMenu}>
                        <li
                            className={`${styles.navItem} ${activeTab === 'hospitals' ? styles.navItemActive : ''}`}
                            onClick={() => setActiveTab('hospitals')}
                        >
                            病院管理 (Clinics)
                        </li>
                        <li
                            className={`${styles.navItem} ${activeTab === 'pricing' ? styles.navItemActive : ''}`}
                            onClick={() => setActiveTab('pricing')}
                        >
                            価格表・FAQ (Data)
                        </li>
                        <li
                            className={`${styles.navItem} ${activeTab === 'analytics' ? styles.navItemActive : ''}`}
                            onClick={() => setActiveTab('analytics')}
                        >
                            統計 (Analytics)
                        </li>
                        <li
                            className={`${styles.navItem} ${activeTab === 'settings' ? styles.navItemActive : ''}`}
                            onClick={() => setActiveTab('settings')}
                        >
                            設定 (Settings)
                        </li>
                    </ul>
                </nav>
            </aside>

            {/* Main Content Area */}
            <main className={styles.mainContent}>
                <header className={styles.header}>
                    <h1 className={styles.pageTitle}>
                        {activeTab === 'hospitals' && '登録病院管理'}
                        {activeTab === 'pricing' && '価格表およびRAGデータ管理'}
                        {activeTab === 'analytics' && 'サービス統計'}
                        {activeTab === 'settings' && '一般設定'}
                    </h1>
                    <button className={styles.btnPrimary}>+ 新規追加</button>
                </header>

                {activeTab === 'hospitals' && (
                    <div className={styles.tableContainer}>
                        <table className={styles.table}>
                            <thead>
                                <tr>
                                    <th className={styles.th}>病院名</th>
                                    <th className={styles.th}>所在地</th>
                                    <th className={styles.th}>状態</th>
                                    <th className={styles.th}>アクション</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td className={styles.td}>Lienjang Clinic (Gangnam)</td>
                                    <td className={styles.td}>Seoul, Gangnam-gu...</td>
                                    <td className={styles.td}><span className={`${styles.badge} ${styles.badgeSuccess}`}>Active</span></td>
                                    <td className={styles.td}>
                                        <button className={styles.actionBtn}>修正</button>
                                        <button className={styles.actionBtn}>削除</button>
                                    </td>
                                </tr>
                                <tr>
                                    <td className={styles.td}>AUREUM Signature</td>
                                    <td className={styles.td}>Seoul, Sinsa-dong...</td>
                                    <td className={styles.td}><span className={`${styles.badge} ${styles.badgeSuccess}`}>Active</span></td>
                                    <td className={styles.td}>
                                        <button className={styles.actionBtn}>修正</button>
                                        <button className={styles.actionBtn}>削除</button>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                )}

                {activeTab === 'pricing' && (
                    <div>
                        <div className={styles.cardGrid}>
                            <div className={styles.card}>
                                <h3 className={styles.cardTitle}>現在学習中のデータ</h3>
                                <p>価格表 PDF (Lienjang_Feb.pdf)</p>
                                <p>FAQ Documentation (2024_ver1.txt)</p>
                            </div>
                            <div className={styles.card}>
                                <h3 className={styles.cardTitle}>n8n 同期状態</h3>
                                <p>最終同期: 2024-02-09 10:20</p>
                                <span className={`${styles.badge} ${styles.badgeSuccess}`}>正常 (Connected)</span>
                            </div>
                        </div>

                        <section className={styles.uploadSection}>
                            <h3 className={styles.uploadTitle}>新しいデータをアップロード</h3>
                            <p style={{ color: '#888', marginBottom: '1rem' }}>
                                Excel、PDF、またはテキストファイルをドラッグしてアップロードしてください。<br />
                                AI相談員の「ユナ」がリアルタイムで学習を開始します。
                            </p>
                            <input type="file" id="fileUpload" style={{ display: 'none' }} />
                            <label htmlFor="fileUpload" className={styles.btnPrimary} style={{ cursor: 'pointer' }}>
                                ファイル選択
                            </label>
                        </section>
                    </div>
                )}
            </main>
        </div>
    );
}
