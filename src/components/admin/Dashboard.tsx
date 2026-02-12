'use client';

import { useEffect } from 'react';
import styles from '@/app/admin/admin.module.css';

// Mock Data for Dashboard
const MOCK_STATS = [
    { label: '全体病院問い合わせ件数', value: '1,284', change: '+12%', icon: '📩', color: '#7e3af2' },
    { label: '予約件数', value: '856', change: '+8%', icon: '📅', color: '#10b981' },
    { label: '予約総額', value: '¥12,450,000', change: '+24%', icon: '💰', color: '#f59e0b' },
    { label: '平均予約単価', value: '¥14,500', change: '+5%', icon: '💎', color: '#3b82f6' },
    { label: '月間アクセス', value: '45,200', change: '+15%', icon: '📈', color: '#6366f1' },
    { label: '新規ユーザー', value: '3,450', change: '+18%', icon: '🆕', color: '#ec4899' },
    { label: '総会員数', value: '12,800', change: '+5%', icon: '👥', color: '#8b5cf6' },
    { label: '平均滞在時間', value: '4m 32s', change: '+2%', icon: '⏱️', color: '#06b6d4' },
];

const MOCK_RESERVATIONS = [
    { id: '1', hospital: 'アウルム皮膚科', patient: '佐藤 美咲', date: '2026-02-14 14:00', service: 'オリジオ 300shot', amount: '350,000 KRW', status: 'CONFIRMED' },
    { id: '2', hospital: 'ドリーム整形外科', patient: '田中 健太', date: '2026-02-15 10:30', service: '二重埋没法', amount: '1,200,000 KRW', status: 'PENDING' },
    { id: '3', hospital: 'ホワイト歯科', patient: '鈴木 一郎', date: '2026-02-15 16:00', service: 'ホワイトニング', amount: '150,000 KRW', status: 'COMPLETED' },
    { id: '4', hospital: 'ID病院', patient: '高橋 花子', date: '2026-02-16 11:00', service: '輪郭3点', amount: '5,500,000 KRW', status: 'CONFIRMED' },
    { id: '5', hospital: 'アウルム皮膚科', patient: '伊藤 由美', date: '2026-02-16 13:30', service: 'ポテンツァ', amount: '450,000 KRW', status: 'CANCELLED' },
];

const STATUS_MAP: Record<string, string> = {
    'CONFIRMED': '予約確定',
    'COMPLETED': '施術完了',
    'PENDING': '確認中',
    'CANCELLED': 'キャンセル'
};

export default function AdminDashboard() {
    useEffect(() => {
        document.title = 'ダッシュボード | Open Beauty Admin';
    }, []);

    return (
        <div style={{ padding: '0 1rem' }}>
            {/* Stats Grid - 4 per row */}
            <div className={styles.statsGrid}>
                {MOCK_STATS.map((stat, index) => (
                    <div key={index} className={styles.card} style={{
                        margin: 0,
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        padding: '1.5rem',
                        transition: 'transform 0.2s, box-shadow 0.2s',
                        cursor: 'default',
                        minHeight: '160px'
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                            <div style={{
                                width: '48px',
                                height: '48px',
                                borderRadius: '12px',
                                background: `${stat.color}15`,
                                color: stat.color,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '1.5rem'
                            }}>
                                {stat.icon}
                            </div>
                            <span style={{
                                padding: '4px 8px',
                                borderRadius: '20px',
                                background: stat.change.startsWith('+') ? '#def7ec' : '#fde8e8',
                                color: stat.change.startsWith('+') ? '#03543f' : '#9b1c1c',
                                fontSize: '0.9rem',
                                fontWeight: '700'
                            }}>
                                {stat.change}
                            </span>
                        </div>
                        <div>
                            <div style={{ fontSize: '1.05rem', color: '#6b7280', fontWeight: '500', marginBottom: '0.2rem' }}>{stat.label}</div>
                            <div style={{ fontSize: '2.2rem', fontWeight: '800', color: '#111827' }}>{stat.value}</div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Recent Reservations Section */}
            <div className={styles.tableContainer} style={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.05)' }}>
                <div style={{ padding: '2rem', borderBottom: '1px solid #f3f4f6', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#fff' }}>
                    <h2 style={{ fontSize: '1.6rem', fontWeight: '700', color: '#111827', margin: 0 }}>🏥 最近の予約状況</h2>
                    <button className={styles.btnPrimary} style={{ padding: '0.8rem 1.5rem', fontSize: '1.1rem' }}>全件表示</button>
                </div>
                <div style={{ overflowX: 'auto' }}>
                    <table className={styles.table}>
                        <thead>
                            <tr>
                                <th className={styles.th} style={{ fontSize: '1rem', color: '#6b7280' }}>ID</th>
                                <th className={styles.th} style={{ fontSize: '1rem', color: '#6b7280' }}>病院名</th>
                                <th className={styles.th} style={{ fontSize: '1rem', color: '#6b7280' }}>患者名</th>
                                <th className={styles.th} style={{ fontSize: '1rem', color: '#6b7280' }}>予約日時</th>
                                <th className={styles.th} style={{ fontSize: '1rem', color: '#6b7280' }}>施術内容</th>
                                <th className={styles.th} style={{ fontSize: '1rem', color: '#6b7280' }}>金額</th>
                                <th className={styles.th} style={{ fontSize: '1rem', color: '#6b7280' }}>ステータス</th>
                            </tr>
                        </thead>
                        <tbody>
                            {MOCK_RESERVATIONS.map((res) => (
                                <tr key={res.id} style={{ transition: 'background 0.2s' }}>
                                    <td className={styles.td} style={{ color: '#9ca3af', fontWeight: '500' }}>#{res.id}</td>
                                    <td className={styles.td} style={{ fontWeight: '700', color: '#111827' }}>{res.hospital}</td>
                                    <td className={styles.td}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                            <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.9rem' }}>👤</div>
                                            <span style={{ fontWeight: '500' }}>{res.patient}</span>
                                        </div>
                                    </td>
                                    <td className={styles.td} style={{ color: '#4b5563' }}>{res.date}</td>
                                    <td className={styles.td} style={{ color: '#4b5563' }}>{res.service}</td>
                                    <td className={styles.td} style={{ fontWeight: '700', color: '#111827' }}>{res.amount}</td>
                                    <td className={styles.td}>
                                        <span className={styles.badge} style={{
                                            padding: '8px 14px',
                                            borderRadius: '8px',
                                            fontWeight: '700',
                                            fontSize: '1rem',
                                            background: res.status === 'CONFIRMED' ? '#e1effe' :
                                                res.status === 'COMPLETED' ? '#def7ec' :
                                                    res.status === 'PENDING' ? '#fdf6b2' : '#fde8e8',
                                            color: res.status === 'CONFIRMED' ? '#1e429f' :
                                                res.status === 'COMPLETED' ? '#03543f' :
                                                    res.status === 'PENDING' ? '#723b13' : '#9b1c1c'
                                        }}>
                                            {STATUS_MAP[res.status]}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
