'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import Auth from '@/components/Auth';
import { supabase } from '@/lib/supabase';
import styles from './mypage.module.css';

interface HistoryItem {
  id: string;
  date: string;
  faceType: string;
  skinAge: number;
  highlight: string;
  score: number;
  imageUrl: string | null;
}

interface SavedTreatment {
  id: string;
  treatment_name: string;
  treatment_price: string;
  created_at: string;
}

type Tab = 'HISTORY' | 'WISHLIST' | 'RESERVATIONS';

export default function MyPage() {
  const { user, loading } = useAuth();
  const [tab, setTab] = useState<Tab>('HISTORY');
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [wishlist, setWishlist] = useState<SavedTreatment[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    if (!user) return;
    const fetchData = async () => {
      setLoadingData(true);

      // 1. Fetch History
      const { data: historyData } = await supabase
        .from('analysis_results')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      setHistory((historyData || []).map(row => ({
        id: String(row.id),
        date: new Date(row.created_at).toLocaleDateString('ja-JP'),
        faceType: row.face_type || '不明',
        skinAge: Number(row.skin_age || 0),
        highlight: row.survey_data?.concerns?.[0] || '一般',
        score: row.scores ? Math.round(row.scores.reduce((a: number, b: number) => a + b, 0) / row.scores.length) : 0,
        imageUrl: row.image_url || null
      })));

      // 2. Fetch Wishlist
      const { data: wishlistData } = await supabase
        .from('saved_treatments')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      setWishlist(wishlistData || []);

      setLoadingData(false);
    };
    void fetchData();
  }, [user]);

  if (loading) return <div className={styles.container}>読み込み中...</div>;
  if (!user) return <div className={styles.container}><Auth /></div>;

  return (
    <div className={styles.container}>
      <motion.div
        className={styles.profileCard}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className={styles.profileInfo}>
          <div className={styles.avatar}>{(user.email?.[0] || 'U').toUpperCase()}</div>
          <div>
            <h2>{user.user_metadata?.full_name || user.email?.split('@')[0]}</h2>
            <p>{user.email}</p>
          </div>
        </div>
      </motion.div>

      <div className={styles.tabs}>
        <button className={`${styles.tab} ${tab === 'HISTORY' ? styles.activeTab : ''}`} onClick={() => setTab('HISTORY')}>✨ 分析履歴</button>
        <button className={`${styles.tab} ${tab === 'WISHLIST' ? styles.activeTab : ''}`} onClick={() => setTab('WISHLIST')}>💖 保存リスト</button>
        <button className={`${styles.tab} ${tab === 'RESERVATIONS' ? styles.activeTab : ''}`} onClick={() => setTab('RESERVATIONS')}>📅 予約管理</button>
      </div>

      <div className={styles.content}>
        <AnimatePresence mode="wait">
          {tab === 'HISTORY' && (
            <motion.div
              key="history"
              className={styles.grid}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
            >
              {loadingData ? <p>読み込み中...</p> : history.length === 0 ? (
                <div className={styles.emptyState}>
                  <p>まだ分析履歴がありません。</p>
                  <Link href="/analysis" className={styles.button}>AI分析をはじめる</Link>
                </div>
              ) : history.map(item => (
                <div key={item.id} className={styles.card}>
                  <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    {item.imageUrl ? (
                      <div className={styles.imgWrapper}>
                        <Image src={item.imageUrl} alt="分析" width={60} height={60} style={{ borderRadius: '12px', objectFit: 'cover' }} unoptimized />
                      </div>
                    ) : (
                      <div className={styles.imgPlaceholder}>✨</div>
                    )}
                    <div>
                      <h3 className={styles.cardTitle}>{item.faceType}</h3>
                      <p className={styles.cardSubtitle}>{item.date} / 肌年齢 {item.skinAge}歳</p>
                    </div>
                  </div>
                  <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span className={styles.scoreBadge}>スコア: {item.score}</span>
                    <Link href={`/analysis?id=${item.id}`} className={styles.linkButton}>詳細を見る &rarr;</Link>
                  </div>
                </div>
              ))}
            </motion.div>
          )}

          {tab === 'WISHLIST' && (
            <motion.div
              key="wishlist"
              className={styles.grid}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
            >
              {loadingData ? <p>読み込み中...</p> : wishlist.length === 0 ? (
                <div className={styles.emptyState}>
                  <p>保存された施術はありません。</p>
                  <Link href="/hospitals" className={styles.button}>クリニックを探す</Link>
                </div>
              ) : wishlist.map(item => (
                <div key={item.id} className={styles.card} style={{ borderLeft: '4px solid var(--c-accent)' }}>
                  <h3 className={styles.cardTitle}>{item.treatment_name}</h3>
                  <p className={styles.cardSubtitle}>{item.treatment_price}</p>
                  <div style={{ marginTop: '1rem', textAlign: 'right' }}>
                    <button
                      className={styles.linkButton}
                      style={{ color: 'var(--c-danger)' }}
                      onClick={async () => {
                        await supabase.from('saved_treatments').delete().eq('id', item.id);
                        setWishlist(prev => prev.filter(i => i.id !== item.id));
                      }}
                    >
                      削除
                    </button>
                  </div>
                </div>
              ))}
            </motion.div>
          )}

          {tab === 'RESERVATIONS' && (
            <motion.div
              key="res"
              className={styles.emptyState}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📅</div>
              <p>現在、確定した予約はありません。</p>
              <p style={{ fontSize: '0.85rem', color: '#888', marginTop: '0.5rem' }}>予約履歴는 각 병원 페이지에서 확인할 수 있습니다.</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
