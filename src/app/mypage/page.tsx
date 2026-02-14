'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Auth from '@/components/Auth';
import styles from './mypage.module.css';

// Mock Data
const DIAGNOSIS_HISTORY = [
    { id: 1, date: '2026-02-12', faceType: 'エレガントキャット', skinAge: 25, highlight: '水分不足', score: 85 },
    { id: 2, date: '2025-11-20', faceType: 'ナチュラル', skinAge: 27, highlight: '毛穴目立ち', score: 72 },
];

const SAVED_CLINICS = [
    { id: 101, name: 'アウルムクリニック', rating: 4.9, location: '江南・新沙', tags: ['リフトアップ', '肌管理'] },
    { id: 102, name: 'リエンジャン美容外科', rating: 4.8, location: '江南・駅三', tags: ['ボトックス', 'フィラー'] },
];

const SAVED_TREATMENTS = [
    { id: 201, name: 'オリジオ (300shot)', price: '350,000 KRW', effect: '即時リフトアップ' },
    { id: 202, name: 'ジュベルック (2cc)', price: '250,000 KRW', effect: '毛穴縮小・肌再生' },
];

const RESERVATIONS = [
    { id: 301, clinic: 'アウルムクリニック', treatment: 'ポテンツァ + ジュベルック', date: '2026-03-15 14:00', status: '予約確定' }
];

export default function MyPage() {
    const { user, loading } = useAuth();
    const router = useRouter();
    const [subTab, setSubTab] = useState<'HISTORY' | 'WISHLIST' | 'RESERVATIONS'>('HISTORY');
    const [history, setHistory] = useState<any[]>(DIAGNOSIS_HISTORY);

    useEffect(() => {
        const saved = localStorage.getItem('analysis_history');
        if (saved) {
            setHistory(JSON.parse(saved));
        }
    }, []);

    // useEffect(() => { // This useEffect is removed as per instruction
    //     if (!loading && !user) {
    //         router.push('/');
    //     }
    // }, [user, loading, router]);

    if (loading) return <div className={styles.container}>Loading...</div>;

    // Show Login Screen if not authenticated
    if (!user) {
        return (
            <div className={styles.container} style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Auth />
            </div>
        );
    }

    return (
        <div className={styles.container}>
            {/* Profile Section */}
            <motion.div
                className={styles.profileCard}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
            >
                <div style={{ position: 'relative' }}>
                    <div style={{
                        width: '96px',
                        height: '96px',
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg, #D4AF37, #b89628)',
                        color: 'white',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '2.5rem',
                        fontWeight: 'bold',
                        margin: '0 auto 1rem'
                    }}>
                        {(user.email?.[0] || 'U').toUpperCase()}
                    </div>
                </div>
                <div className={styles.profileInfo}>
                    <h2>
                        {user.user_metadata?.full_name || user.email?.split('@')[0]}
                        <span style={{ fontSize: '0.9rem', color: 'var(--c-accent)', fontWeight: 'normal', display: 'block', marginTop: '0.2rem' }}>
                            {user.email}
                        </span>
                    </h2>
                    <p>美容に関心が高い20代後半、乾燥肌タイプ</p>
                    <div className={styles.statsRow}>
                        <div className={styles.statItem}>
                            <span className={styles.statValue}>{history.length}</span>
                            <span className={styles.statLabel}>診断回数</span>
                        </div>
                        <div className={styles.statItem}>
                            <span className={styles.statValue}>{SAVED_CLINICS.length + SAVED_TREATMENTS.length}</span>
                            <span className={styles.statLabel}>保存リスト</span>
                        </div>
                        <div className={styles.statItem}>
                            <span className={styles.statValue}>{RESERVATIONS.length}</span>
                            <span className={styles.statLabel}>予約中</span>
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* Tabs */}
            <div className={styles.tabs}>
                <button
                    className={`${styles.tab} ${subTab === 'HISTORY' ? styles.activeTab : ''}`}
                    onClick={() => setSubTab('HISTORY')}
                >
                    📜 診断履歴
                </button>
                <button
                    className={`${styles.tab} ${subTab === 'WISHLIST' ? styles.activeTab : ''}`}
                    onClick={() => setSubTab('WISHLIST')}
                >
                    💖 保存リスト
                </button>
                <button
                    className={`${styles.tab} ${subTab === 'RESERVATIONS' ? styles.activeTab : ''}`}
                    onClick={() => setSubTab('RESERVATIONS')}
                >
                    📅 予約管理
                </button>
            </div>

            {/* Content Area */}
            <div className={styles.content}>

                {/* 1. History */}
                {subTab === 'HISTORY' && (
                    <motion.div className={styles.grid} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                        {history.map(item => (
                            <div key={item.id} className={styles.card}>
                                <div className={styles.cardHeader}>
                                    <span className={styles.tag} style={{ background: item.score >= 80 ? 'var(--c-accent)' : '#f0f0f0', color: item.score >= 80 ? 'white' : '#666' }}>
                                        Score: {item.score}
                                    </span>
                                    <span style={{ fontSize: '1.5rem' }}>📊</span>
                                </div>
                                <h3 className={styles.cardTitle}>{item.faceType}</h3>
                                <p className={styles.cardSubtitle}>肌年齢: {item.skinAge}歳 / 悩み: {item.highlight}</p>
                                <Link href={`/analysis?id=${item.id}`} className={`${styles.button} ${styles['button-outline']}`}>詳細を見る</Link>
                                <span className={styles.date}>{item.date}</span>
                            </div>
                        ))}
                        <Link href="/analysis" className={styles.card} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', border: '2px dashed #ddd', boxShadow: 'none', cursor: 'pointer' }}>
                            <span style={{ fontSize: '2rem', color: '#ccc' }}>+</span>
                            <span style={{ color: '#999', marginTop: '0.5rem' }}>新しい診断をする</span>
                        </Link>
                    </motion.div>
                )}

                {/* 2. Wishlist */}
                {subTab === 'WISHLIST' && (
                    <div>
                        <h3 className={styles.sectionTitle}>🏥 保存した病院</h3>
                        <div className={styles.grid} style={{ marginBottom: '2rem' }}>
                            {SAVED_CLINICS.map(clinic => (
                                <div key={clinic.id} className={styles.card}>
                                    <div className={styles.cardHeader}>
                                        <span style={{ color: 'var(--c-danger)', fontWeight: 'bold' }}>★ {clinic.rating}</span>
                                        <button className={styles.deleteBtn}>×</button>
                                    </div>
                                    <h3 className={styles.cardTitle}>{clinic.name}</h3>
                                    <p className={styles.cardSubtitle}>📍 {clinic.location}</p>
                                    <div style={{ marginBottom: '1rem' }}>
                                        {clinic.tags.map(t => <span key={t} className={styles.tag}>{t}</span>)}
                                    </div>
                                    <button className={styles.button}>予約相談する</button>
                                </div>
                            ))}
                        </div>

                        <h3 className={styles.sectionTitle}>💉 気になる施術</h3>
                        <div className={styles.grid}>
                            {SAVED_TREATMENTS.map(treatment => (
                                <div key={treatment.id} className={styles.card}>
                                    <div className={styles.cardHeader}>
                                        <span style={{ fontSize: '1.2rem' }}>💊</span>
                                        <button className={styles.deleteBtn}>×</button>
                                    </div>
                                    <h3 className={styles.cardTitle}>{treatment.name}</h3>
                                    <p className={styles.cardSubtitle}>{treatment.effect}</p>
                                    <div style={{ textAlign: 'right', fontWeight: 'bold', color: 'var(--c-accent)', fontSize: '1.1rem' }}>{treatment.price}</div>
                                    <button className={`${styles.button} ${styles['button-outline']}`}>価格比較を見る</button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* 3. Reservations */}
                {subTab === 'RESERVATIONS' && (
                    <motion.div className={styles.grid} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                        {RESERVATIONS.length > 0 ? RESERVATIONS.map(res => (
                            <div key={res.id} className={styles.card} style={{ borderLeft: '5px solid var(--c-success)' }}>
                                <div className={styles.cardHeader}>
                                    <span className={styles.tag} style={{ background: 'var(--c-success)', color: 'white' }}>{res.status}</span>
                                </div>
                                <h3 className={styles.cardTitle}>{res.clinic}</h3>
                                <p className={styles.cardSubtitle} style={{ marginBottom: '0.5rem' }}>{res.treatment}</p>
                                <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid #eee', color: 'var(--c-text-main)', fontWeight: 'bold' }}>
                                    📅 {res.date}
                                </div>
                                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
                                    <button className={`${styles.button} ${styles['button-outline']}`}>変更</button>
                                    <button className={`${styles.button} ${styles['button-outline']}`} style={{ color: 'var(--c-danger)', borderColor: 'var(--c-danger)' }}>キャンセル</button>
                                </div>
                            </div>
                        )) : (
                            <div className={styles.emptyState} style={{ gridColumn: '1 / -1' }}>
                                <p>現在、予約はありません。</p>
                                <Link href="/analysis" className={styles.button} style={{ maxWidth: '200px', margin: '1rem auto' }}>診断から予約する</Link>
                            </div>
                        )}
                    </motion.div>
                )}

            </div>
        </div>
    );
}
