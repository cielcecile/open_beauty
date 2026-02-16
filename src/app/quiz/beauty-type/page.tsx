'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import styles from '../quiz.module.css';

interface Question {
  text: string;
  options: { text: string; type: string }[];
}

const QUESTIONS: Question[] = [
  {
    text: 'Q1. 好きなメイクの雰囲気は？',
    options: [
      { text: 'ナチュラルで透明感のあるスタイル', type: 'clean' },
      { text: 'トレンド感のある韓国アイドル風', type: 'k-master' },
      { text: '上品で落ち着いた大人スタイル', type: 'classy' },
      { text: '印象が強い華やかスタイル', type: 'bold' },
    ],
  },
  {
    text: 'Q2. 仕上がりで重視するポイントは？',
    options: [
      { text: '自然で負担の少ない変化', type: 'clean' },
      { text: '写真映えする肌ツヤ', type: 'k-master' },
      { text: '長く維持できる安定感', type: 'classy' },
      { text: '短期間で目に見える変化', type: 'bold' },
    ],
  },
  {
    text: 'Q3. 理想の印象に近いのは？',
    options: [
      { text: '清潔感があってやわらかい印象', type: 'clean' },
      { text: '洗練されたK-Beauty印象', type: 'k-master' },
      { text: '高級感のある上品な印象', type: 'classy' },
      { text: '存在感のある強い印象', type: 'bold' },
    ],
  },
  {
    text: 'Q4. 興味のある施術カテゴリは？',
    options: [
      { text: 'スキンケア・トーニング', type: 'clean' },
      { text: 'リフトアップ・輪郭ケア', type: 'k-master' },
      { text: '再生治療・プレミアムケア', type: 'classy' },
      { text: 'ボリューム改善・集中治療', type: 'bold' },
    ],
  },
  {
    text: 'Q5. 施術後に期待することは？',
    options: [
      { text: '毎日の肌コンディション向上', type: 'clean' },
      { text: '韓国っぽいトレンド感', type: 'k-master' },
      { text: '高級感のある仕上がり', type: 'classy' },
      { text: 'はっきり分かる変化', type: 'bold' },
    ],
  },
];

const RESULTS: Record<string, { title: string; desc: string; celeb: string; recommend: string }> = {
  clean: {
    title: 'クリアスキン・ナチュラルタイプ',
    desc: '自然な透明感とバランスを重視するタイプです。刺激の少ないケアがよく合います。',
    celeb: '清潔感のあるナチュラル系スタイル',
    recommend: 'ピコトーニング / アクアピーリング / 保湿再生ケア',
  },
  'k-master': {
    title: 'K-Beautyトレンドタイプ',
    desc: 'ツヤ感と立体感を重視するタイプです。トレンド施術との相性が高いです。',
    celeb: '韓国アイドル系のグロウスキン',
    recommend: 'リフトアップ / スキンブースター / 輪郭ケア',
  },
  classy: {
    title: 'エレガント・プレミアムタイプ',
    desc: '上品で安定した変化を好むタイプです。計画的な中長期ケアが向いています。',
    celeb: '落ち着いた上品なビューティースタイル',
    recommend: '再生治療 / 弾力ケア / プレミアム複合管理',
  },
  bold: {
    title: 'インパクト重視タイプ',
    desc: '短期間で明確な変化を求めるタイプです。目的に合わせた集中管理が効果的です。',
    celeb: '華やかで存在感のあるスタイル',
    recommend: '輪郭施術 / HIFU / ボリューム調整',
  },
};

export default function BeautyTypeQuiz() {
  const [step, setStep] = useState(0);
  const [scores, setScores] = useState<Record<string, number>>({ clean: 0, 'k-master': 0, classy: 0, bold: 0 });
  const [result, setResult] = useState<string | null>(null);

  const handleAnswer = (type: string) => {
    const nextScores = { ...scores, [type]: scores[type] + 1 };
    setScores(nextScores);

    if (step < QUESTIONS.length - 1) {
      setStep(step + 1);
      return;
    }

    const maxType = Object.keys(nextScores).reduce((a, b) => (nextScores[a] > nextScores[b] ? a : b));
    setResult(maxType);
  };

  if (result) {
    const data = RESULTS[result];
    return (
      <div className={styles.container}>
        <motion.div className={styles.resultContainer} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
          <h1>診断結果</h1>
          <div className={styles.typeTitle}>{data.title}</div>
          <p>{data.desc}</p>

          <div className={styles.celebCard}>
            <h3>イメージ</h3>
            <p>{data.celeb}</p>
          </div>

          <div className={styles.celebCard} style={{ background: '#fffbf0', border: '1px solid #ffeaa7' }}>
            <h3>おすすめ施術</h3>
            <p>{data.recommend}</p>
          </div>

          <Link href="/treatments" className={styles.actionButton}>
            施術メニューを見る
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.progressBar}>
        <div className={styles.progress} style={{ width: `${((step + 1) / QUESTIONS.length) * 100}%` }}></div>
      </div>

      <h1 className={styles.title}>ビューティータイプ診断</h1>

      <AnimatePresence mode="wait">
        <motion.div key={step} initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -20, opacity: 0 }} className={styles.questionCard}>
          <h2 className={styles.questionText}>{QUESTIONS[step].text}</h2>
          <div>
            {QUESTIONS[step].options.map((opt) => (
              <button key={opt.text} className={styles.optionButton} onClick={() => handleAnswer(opt.type)}>
                {opt.text}
              </button>
            ))}
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
