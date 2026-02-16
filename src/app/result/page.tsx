'use client';

import { useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Yuna from '@/components/Yuna';
import BookingModal from '@/components/BookingModal';
import LoginModal from '@/components/LoginModal';
import TreatmentModal from '@/components/TreatmentModal';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import styles from './result.module.css';

interface Treatment {
  name: string;
  name_en?: string;
  desc: string;
  price: string;
  time: string;
  downtime: string;
}

const TREATMENTS: Record<string, Treatment> = {
  sagging: {
    name: 'シュリンクユニバース',
    name_en: 'Shrink Universe',
    desc: '超音波エネルギーで肌の深層を引き締め、弾力改善をサポートします。',
    price: '99,000ウォン〜',
    time: '20分',
    downtime: 'ほぼなし',
  },
  wrinkles: {
    name: 'シワボトックス',
    name_en: 'Wrinkle Botox',
    desc: '表情筋の動きを調整し、シワの緩和を目指します。',
    price: '30,000ウォン〜',
    time: '5分',
    downtime: 'なし',
  },
  pores: {
    name: 'アクアピーリング + ピコトーニング',
    name_en: 'Aquapeel & Pico Toning',
    desc: '毛穴洗浄とトーン改善を同時に行い、透明感のある肌に導きます。',
    price: '50,000ウォン〜',
    time: '40分',
    downtime: '赤み (1-2時間)',
  },
  pigment: {
    name: 'ピコトーニング',
    name_en: 'Pico Toning',
    desc: '色素トラブルにアプローチし、肌トーンを整えます。',
    price: '45,000ウォン〜',
    time: '15分',
    downtime: 'なし',
  },
  default: {
    name: 'シグネチャー複合ケア',
    name_en: 'Signature Care',
    desc: '肌状態に合わせた1:1オーダーメイド管理プログラムです。',
    price: '要相談',
    time: '60分',
    downtime: '個人差あり',
  },
};

function ResultContent() {
  const searchParams = useSearchParams();
  const concerns = useMemo(() => searchParams.get('concerns')?.split(',') || [], [searchParams]);
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [showTreatmentModal, setShowTreatmentModal] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const { user, loading } = useAuth();

  const result = useMemo(() => {
    if (concerns.some((c) => c.includes('Sagging') || c.includes('たるみ'))) return TREATMENTS.sagging;
    if (concerns.some((c) => c.includes('Wrinkles') || c.includes('シワ'))) return TREATMENTS.wrinkles;
    if (concerns.some((c) => c.includes('Pores') || c.includes('毛穴'))) return TREATMENTS.pores;
    if (concerns.some((c) => c.includes('Pigment') || c.includes('シミ'))) return TREATMENTS.pigment;
    return TREATMENTS.default;
  }, [concerns]);

  const isLoggedIn = !loading && !!user;

  useEffect(() => {
    if (!isLoggedIn) return;

    const checkSaved = async () => {
      const { data } = await supabase
        .from('saved_treatments')
        .select('id')
        .eq('user_id', user.id)
        .eq('treatment_name', result.name)
        .maybeSingle();
      setIsSaved(!!data);
    };

    void checkSaved();
  }, [isLoggedIn, result.name, user]);

  const toggleSave = async () => {
    if (!isLoggedIn) {
      setShowLogin(true);
      return;
    }

    setIsSaving(true);
    try {
      if (isSaved) {
        await supabase.from('saved_treatments').delete().eq('user_id', user.id).eq('treatment_name', result.name);
        setIsSaved(false);
      } else {
        await supabase.from('saved_treatments').insert({
          user_id: user.id,
          treatment_name: result.name,
          treatment_name_en: result.name_en || '',
          treatment_desc: result.desc,
          treatment_price: result.price,
          treatment_time: result.time,
          treatment_downtime: result.downtime,
        });
        setIsSaved(true);
      }
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <motion.div className={styles.container} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <h1 className={styles.title}>診断結果レポート</h1>

      <Yuna message="あなたの肌状態に合わせて、最適な施術を提案します。" />

      <motion.div className={styles.resultCard} initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}>
        <span className={styles.typeTag}>#AUREUMおすすめ</span>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', gap: '1rem' }}>
          <div style={{ flex: 1 }}>
            <h2 className={styles.treatmentName}>{result.name}</h2>
            {result.name_en && <p style={{ fontSize: '0.85rem', color: '#888', margin: '4px 0 0 0', fontStyle: 'italic' }}>{result.name_en}</p>}
          </div>
          <button onClick={() => void toggleSave()} disabled={isSaving} title={isSaved ? '保存済み' : '保存する'}>
            {isSaved ? '保存済み' : '保存'}
          </button>
        </div>
        <p className={styles.description}>{result.desc}</p>
      </motion.div>

      <motion.div className={styles.resultCard} initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}>
        <div className={styles.infoGrid}>
          <div className={styles.infoItem}><span className={styles.label}>価格</span><span className={styles.value}>{result.price}</span></div>
          <div className={styles.infoItem}><span className={styles.label}>時間</span><span className={styles.value}>{result.time}</span></div>
          <div className={styles.infoItem}><span className={styles.label}>ダウンタイム</span><span className={styles.value}>{result.downtime}</span></div>
          <div className={styles.infoItem}><span className={styles.label}>痛み</span><span className={styles.value}>個人差あり</span></div>
        </div>

        <div className={styles.actionArea}>
          <button onClick={() => setIsBookingOpen(true)} className={styles.primaryBtn}>無料カウンセリング予約</button>
          <a href="https://lin.ee/0kDysYy" target="_blank" rel="noopener noreferrer" className={styles.secondaryBtn}>LINEで相談</a>
        </div>
      </motion.div>

      <motion.div className={styles.disclaimer} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <p>この結果は情報提供目的であり、医療診断ではありません。正確な診断は医師の相談をご利用ください。</p>
      </motion.div>

      <AnimatePresence>
        {isBookingOpen && <BookingModal onClose={() => setIsBookingOpen(false)} treatmentName={result.name} />}
        {showTreatmentModal && (
          <TreatmentModal
            treatment={{
              id: result.name,
              name: result.name,
              name_en: result.name_en,
              description: result.desc,
              price: result.price,
              time: result.time,
              downtime: result.downtime,
            }}
            onClose={() => setShowTreatmentModal(false)}
          />
        )}
      </AnimatePresence>

      {showLogin && <LoginModal onClose={() => setShowLogin(false)} message="詳細機能を使うにはログインしてください。" />}
    </motion.div>
  );
}

export default function ResultPage() {
  return (
    <Suspense fallback={<div>読み込み中...</div>}>
      <ResultContent />
    </Suspense>
  );
}

