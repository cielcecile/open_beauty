'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Auth from '@/components/Auth';
import styles from './mypage.module.css';
import { supabase } from '@/lib/supabase';

// Mock Data for unimplemented sections
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

    // State
    const [history, setHistory] = useState<any[]>([]);
    const [savedClinics, setSavedClinics] = useState<any[]>([]);
    const [savedTreatments, setSavedTreatments] = useState<any[]>([]);
    const [isLoadingData, setIsLoadingData] = useState(true);

    // Fetch Data from Supabase
    useEffect(() => {
        if (!user) return;

        const fetchData = async () => {
            setIsLoadingData(true);
            try {
                // 1. Fetch Analysis History
                const { data: analysisData, error: analysisError } = await supabase
                    .from('analysis_results')
                    .select('*')
                    .eq('user_id', user.id)
                    .order('created_at', { ascending: false });

                if (analysisError) console.error('Error fetching history:', analysisError);

                if (analysisData) {
                    const formattedHistory = analysisData.map(item => ({
                        id: item.id,
                        date: new Date(item.created_at).toLocaleDateString(),
                        faceType: item.face_type,
                        skinAge: item.skin_age,
                        // Get first concern or default
                        highlight: item.survey_data?.concerns?.[0] || '特になし',
                        // Calculate average score
                        score: item.scores ? Math.round(item.scores.reduce((a: number, b: number) => a + b, 0) / item.scores.length) : 0
                    }));
                    setHistory(formattedHistory);
                }

                // 2. Fetch Wishlist Clinics
                const { data: wishlistData, error: wishlistError } = await supabase
                    .from('wishlist_clinics')
                    .select('*')
                    .eq('user_id', user.id);

                if (wishlistError) {
                    console.error('Error fetching wishlist:', wishlistError);
                } else if (wishlistData && wishlistData.length > 0) {
                    // Fetch hospital details for each wishlist item
                    const hospitalIds = wishlistData.map(item => item.hospital_id);
                    const { data: hospitalsData, error: hospitalsError } = await supabase
                        .from('hospitals')
                        .select('*')
                        .in('id', hospitalIds);

                    if (!hospitalsError && hospitalsData) {
                        const hospitalMap = Object.fromEntries(
                            hospitalsData.map(h => [h.id, h])
                        );
                        
                        const formattedWishlist = wishlistData.map(item => {
                            const hospital = hospitalMap[item.hospital_id];
                            return {
                                id: hospital?.id || item.hospital_id,
                                wishlist_id: item.id,
                                name: hospital?.name || '不明な病院',
                                rating: hospital?.rating || '-',
                                location: hospital?.location || '-',
                                tags: hospital?.tags || []
                            };
                        });
                        setSavedClinics(formattedWishlist);
                    }
                }

                // 3. Fetch Saved Treatments
                const { data: treatmentsData, error: treatmentsError } = await supabase
                    .from('saved_treatments')
                    .select('*')
                    .eq('user_id', user.id)
                    .order('created_at', { ascending: false });

                if (treatmentsError) console.error('Error fetching treatments:', treatmentsError);

                if (treatmentsData) {
                    const formattedTreatments = treatmentsData.map(item => ({
                        id: item.id,
                        name: item.treatment_name,
                        price: item.treatment_price,
                        effect: item.treatment_desc,
                        time: item.treatment_time,
                        downtime: item.treatment_downtime,
                    }));
                    setSavedTreatments(formattedTreatments);
                }

            } catch (error) {
                console.error('Unexpected error:', error);
            } finally {
                setIsLoadingData(false);
            }
        };

        fetchData();
    }, [user]);


    // Delete from Wishlist
    const handleRemoveFromWishlist = async (clinicId: string) => {
        if (!user) return;

        // Optimistic Update
        setSavedClinics(prev => prev.filter(c => c.id !== clinicId));

        try {
            const { error } = await supabase
                .from('wishlist_clinics')
                .delete()
                .eq('user_id', user.id)
                .eq('hospital_id', clinicId);

            if (error) {
                console.error('Error removing from wishlist:', error);
                // Revert if error? (Simplification: just alert)
                alert('削除に失敗しました。');
            }
        } catch (err) {
            console.error(err);
        }
    };

    // Delete from Saved Treatments
    const handleRemoveFromTreatments = async (treatmentId: string) => {
        if (!user) return;

        // Optimistic Update
        setSavedTreatments(prev => prev.filter(t => t.id !== treatmentId));

        try {
            const { error } = await supabase
                .from('saved_treatments')
                .delete()
                .eq('id', treatmentId)
                .eq('user_id', user.id);

            if (error) {
                console.error('Error removing treatment:', error);
                alert('削除に失敗しました。');
            }
        } catch (err) {
            console.error(err);
        }
    };


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
                            <span className={styles.statValue}>{savedClinics.length + savedTreatments.length}</span>
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
                        {isLoadingData ? <p>読み込み中...</p> : history.length > 0 ? history.map(item => (
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
                        )) : (
                            <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '2rem' }}>
                                <p>診断履歴がありません。</p>
                            </div>
                        )}
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
                            {isLoadingData ? <p>読み込み中...</p> : savedClinics.length > 0 ? savedClinics.map(clinic => (
                                <div key={clinic.id} className={styles.card}>
                                    <div className={styles.cardHeader}>
                                        <span style={{ color: 'var(--c-danger)', fontWeight: 'bold' }}>★ {clinic.rating || '-'}</span>
                                        <button className={styles.deleteBtn} onClick={() => handleRemoveFromWishlist(clinic.id)}>×</button>
                                    </div>
                                    <h3 className={styles.cardTitle}>{clinic.name}</h3>
                                    <p className={styles.cardSubtitle}>📍 {clinic.location}</p>
                                    <div style={{ marginBottom: '1rem' }}>
                                        {clinic.tags && clinic.tags.map((t: string) => <span key={t} className={styles.tag}>{t}</span>)}
                                    </div>
                                    <button className={styles.button}>予約相談する</button>
                                </div>
                            )) : (
                                <p>保存された病院はありません。</p>
                            )}
                        </div>

                        <h3 className={styles.sectionTitle}>💉 気になる施術</h3>
                        <div className={styles.grid}>
                            {isLoadingData ? <p>読み込み中...</p> : savedTreatments.length > 0 ? savedTreatments.map(treatment => (
                                <div key={treatment.id} className={styles.card}>
                                    <div className={styles.cardHeader}>
                                        <span style={{ fontSize: '1.2rem' }}>💊</span>
                                        <button className={styles.deleteBtn} onClick={() => handleRemoveFromTreatments(treatment.id)}>×</button>
                                    </div>
                                    <h3 className={styles.cardTitle}>{treatment.name}</h3>
                                    <p className={styles.cardSubtitle}>{treatment.effect}</p>
                                    <div style={{ textAlign: 'right', fontWeight: 'bold', color: 'var(--c-accent)', fontSize: '1.1rem' }}>{treatment.price}</div>
                                    <button className={`${styles.button} ${styles['button-outline']}`}>価格比較を見る</button>
                                </div>
                            )) : (
                                <p>保存された施術はありません。</p>
                            )}
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
