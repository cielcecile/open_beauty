'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
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

type Tab = 'HISTORY' | 'WISHLIST' | 'RESERVATIONS';

export default function MyPage() {
  const { user, loading } = useAuth();
  const [tab, setTab] = useState<Tab>('HISTORY');
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    if (!user) return;
    const fetchData = async () => {
      setLoadingData(true);
      const { data } = await supabase.from('analysis_results').select('*').eq('user_id', user.id).order('created_at', { ascending: false });
      setHistory(
        (data || []).map((row) => ({
          id: String(row.id),
          date: new Date(row.created_at).toLocaleDateString('ja-JP'),
          faceType: row.face_type || '不明',
          skinAge: Number(row.skin_age || 0),
          highlight: row.survey_data?.concerns?.[0] || 'なし',
          score: row.scores ? Math.round(row.scores.reduce((a: number, b: number) => a + b, 0) / row.scores.length) : 0,
          imageUrl: row.image_url || null,
        }))
      );
      setLoadingData(false);
    };
    void fetchData();
  }, [user]);

  if (loading) return <div className={styles.container}>読み込み中...</div>;
  if (!user) return <div className={styles.container}><Auth /></div>;

  return (
    <div className={styles.container}>
      <motion.div className={styles.profileCard} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className={styles.profileInfo}>
          <h2>{user.user_metadata?.full_name || user.email?.split('@')[0]}</h2>
          <p>{user.email}</p>
        </div>
      </motion.div>

      <div className={styles.tabs}>
        <button className={`${styles.tab} ${tab === 'HISTORY' ? styles.activeTab : ''}`} onClick={() => setTab('HISTORY')}>分析履歴</button>
        <button className={`${styles.tab} ${tab === 'WISHLIST' ? styles.activeTab : ''}`} onClick={() => setTab('WISHLIST')}>保存リスト</button>
        <button className={`${styles.tab} ${tab === 'RESERVATIONS' ? styles.activeTab : ''}`} onClick={() => setTab('RESERVATIONS')}>予約管理</button>
      </div>

      <div className={styles.content}>
        {tab === 'HISTORY' && (
          <div className={styles.grid}>
            {loadingData ? (
              <p>読み込み中...</p>
            ) : history.length === 0 ? (
              <p>分析履歴がありません。</p>
            ) : (
              history.map((item) => (
                <div key={item.id} className={styles.card}>
                  {item.imageUrl && <Image src={item.imageUrl} alt="分析画像" width={56} height={56} unoptimized />}
                  <h3 className={styles.cardTitle}>{item.faceType}</h3>
                  <p className={styles.cardSubtitle}>肌年齢 {item.skinAge} / 悩み: {item.highlight}</p>
                  <p>総合スコア: {item.score}</p>
                  <Link href={`/analysis?id=${item.id}`} className={`${styles.button} ${styles['button-outline']}`}>詳細を見る</Link>
                </div>
              ))
            )}
          </div>
        )}

        {tab !== 'HISTORY' && <p>このセクションは準備中です。</p>}
      </div>
    </div>
  );
}
