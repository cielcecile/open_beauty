'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import styles from '../quiz.module.css';

interface Question {
  text: string;
  options: { text: string; isCorrect: boolean; explanation: string }[];
}

const QUESTIONS: Question[] = [
  {
    text: 'Q1. 透明感ケアに最もよく使われる施術は？',
    options: [
      { text: '一般的な保湿管理', isCorrect: false, explanation: '保湿は基本ですが、トーン改善の主施術ではありません。' },
      { text: 'ピコトーニング', isCorrect: true, explanation: '色素ケアとトーンアップで人気の代表施術です。' },
      { text: '簡単なクレンジング', isCorrect: false, explanation: 'クレンジングだけでは色素改善は限定的です。' },
    ],
  },
  {
    text: 'Q2. 施術直後のダウンタイムが比較的少ないものは？',
    options: [
      { text: 'CO2レーザー', isCorrect: false, explanation: '赤みや回復期間が必要な場合があります。' },
      { text: 'アクアピーリング', isCorrect: true, explanation: '比較的軽い施術で、日常復帰が早いケースが多いです。' },
      { text: '深層剥離治療', isCorrect: false, explanation: '回復に時間が必要になる場合があります。' },
    ],
  },
  {
    text: 'Q3. 高周波(RF)を活用した代表的なリフト施術は？',
    options: [
      { text: 'ボトックス', isCorrect: false, explanation: 'ボトックスは筋肉調整でRF施術とは異なります。' },
      { text: 'オリジオ(Oligio)', isCorrect: true, explanation: 'RFエネルギーで弾力改善を狙う代表的施術です。' },
      { text: '単純な角質管理', isCorrect: false, explanation: '角質管理は表面ケアでRFリフトとは目的が異なります。' },
    ],
  },
];

export default function KBeautyQuiz() {
  const [step, setStep] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [finished, setFinished] = useState(false);

  const answer = (index: number) => {
    setSelectedOption(index);
    setShowExplanation(true);
    if (QUESTIONS[step].options[index].isCorrect) setScore((prev) => prev + 1);
  };

  const next = () => {
    if (step < QUESTIONS.length - 1) {
      setStep((prev) => prev + 1);
      setSelectedOption(null);
      setShowExplanation(false);
      return;
    }
    setFinished(true);
  };

  if (finished) {
    return (
      <div className={styles.container}>
        <motion.div className={styles.resultContainer} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
          <h1>K-Beautyクイズ結果</h1>
          <div className={styles.typeTitle}>{score} / {QUESTIONS.length}</div>
          <p>{score === QUESTIONS.length ? '完璧です。K-Beauty理解度がとても高いです。' : 'よくできました。さらに詳しい施術比較を見てみましょう。'}</p>
          <Link href="/treatments" className={styles.actionButton}>施術メニューを見る</Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.progressBar}>
        <div className={styles.progress} style={{ width: `${((step + 1) / QUESTIONS.length) * 100}%` }}></div>
      </div>

      <h1 className={styles.title}>K-Beauty知識クイズ</h1>

      <motion.div className={styles.questionCard}>
        <h2 className={styles.questionText}>第{step + 1}問<br />{QUESTIONS[step].text}</h2>

        {!showExplanation ? (
          QUESTIONS[step].options.map((option, index) => (
            <button key={option.text} className={styles.optionButton} onClick={() => answer(index)}>
              {option.text}
            </button>
          ))
        ) : (
          <div>
            <div style={{ padding: '1rem', borderRadius: '8px', marginBottom: '1rem', background: QUESTIONS[step].options[selectedOption!].isCorrect ? '#e6fffa' : '#fff5f5' }}>
              <h3 style={{ marginBottom: '0.5rem' }}>{QUESTIONS[step].options[selectedOption!].isCorrect ? '正解' : '不正解'}</h3>
              <p>{QUESTIONS[step].options[selectedOption!].explanation}</p>
            </div>
            <button className={styles.actionButton} onClick={next}>{step < QUESTIONS.length - 1 ? '次へ' : '結果を見る'}</button>
          </div>
        )}
      </motion.div>
    </div>
  );
}
