'use client';

import { useState } from 'react';
import styles from '../admin.module.css';

const MOCK_PRICING = [
    { id: 1, category: '肌管理', name: 'ポテンツァ (CPK)', price: '25,000円', stockout: false },
    { id: 2, category: '肌管理', name: 'リジュラン (2cc)', price: '30,000円', stockout: false },
    { id: 3, category: 'プチ整形', name: 'ボトックス (額)', price: '5,000円', stockout: true },
    { id: 4, category: 'プチ整形', name: 'フィラー (唇)', price: '15,000円', stockout: false },
];

const MOCK_FAQ = [
    { id: 1, question: '予約のキャンセルはいつまで可能ですか？', answer: '予約日の3日前まで可能です。' },
    { id: 2, question: '日本語の通訳はいますか？', answer: 'はい、すべての提携病院に日本語スタッフが常駐しています。' },
];

export default function AdminPricingPage() {
    const [tab, setTab] = useState<'PRICING' | 'FAQ'>('PRICING');

    return (
        <div>
            <header className={styles.header}>
                <h1 className={styles.pageTitle}>価格表・FAQ 管理</h1>
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <button className={`${styles.actionBtn} ${tab === 'PRICING' ? styles.navItemActive : ''}`} onClick={() => setTab('PRICING')}>価格表</button>
                    <button className={`${styles.actionBtn} ${tab === 'FAQ' ? styles.navItemActive : ''}`} onClick={() => setTab('FAQ')}>FAQ</button>
                    <button className={styles.btnPrimary}>+ 新規追加</button>
                </div>
            </header>

            <div className={styles.tableContainer}>
                {tab === 'PRICING' ? (
                    <table className={styles.table}>
                        <thead>
                            <tr>
                                <th className={styles.th}>カテゴリ</th>
                                <th className={styles.th}>施術名</th>
                                <th className={styles.th}>標準価格</th>
                                <th className={styles.th}>ステータス</th>
                                <th className={styles.th}>操作</th>
                            </tr>
                        </thead>
                        <tbody>
                            {MOCK_PRICING.map(item => (
                                <tr key={item.id}>
                                    <td className={styles.td}>{item.category}</td>
                                    <td className={styles.td}>{item.name}</td>
                                    <td className={styles.td}>{item.price}</td>
                                    <td className={styles.td}>
                                        <span className={`${styles.badge} ${item.stockout ? '' : styles.badgeSuccess}`} style={{ background: item.stockout ? '#ffeaea' : '', color: item.stockout ? '#ff4d4d' : '' }}>
                                            {item.stockout ? '一時停止' : '公開中'}
                                        </span>
                                    </td>
                                    <td className={styles.td}>
                                        <button className={styles.actionBtn}>編集</button>
                                        <button className={styles.actionBtn} style={{ color: 'red' }}>削除</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                ) : (
                    <table className={styles.table}>
                        <thead>
                            <tr>
                                <th className={styles.th}>質問</th>
                                <th className={styles.th}>回答</th>
                                <th className={styles.th}>操作</th>
                            </tr>
                        </thead>
                        <tbody>
                            {MOCK_FAQ.map(item => (
                                <tr key={item.id}>
                                    <td className={styles.td} style={{ fontWeight: '600' }}>{item.question}</td>
                                    <td className={styles.td}>{item.answer}</td>
                                    <td className={styles.td}>
                                        <button className={styles.actionBtn}>編集</button>
                                        <button className={styles.actionBtn} style={{ color: 'red' }}>削除</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
}
