'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import styles from '../quiz.module.css';

interface Question {
    text: string;
    options: { text: string; isCorrect: boolean; explanation: string }[];
}

const QUESTIONS: Question[] = [
    {
        text: "Q1. 2025年、韓国で最も注目されている「肌の再生」を促すスキンブースターは？",
        options: [
            { text: "シャネル注射", isCorrect: false, explanation: "シャネル注射も人気ですが、2025年のトレンドはもっと進化しています！" },
            { text: "ジュベルック (Juvelook)", isCorrect: true, explanation: "正解！ジュベルックはコラーゲン生成を促進する最もホットな施術です。" },
            { text: "水光注射", isCorrect: false, explanation: "水光注射は保湿がメインですが、再生にはジュベルックが強力です。" }
        ]
    },
    {
        text: "Q2. 色素沈着やシミを除去するのに最も効果的でダウンタイムが少ないレーザーは？",
        options: [
            { text: "CO2レーザー", isCorrect: false, explanation: "CO2レーザーは効果的ですが、ダウンタイムが長めです。" },
            { text: "ピコトーニング", isCorrect: true, explanation: "正解！ピコ秒単位の照射で肌へのダメージを最小限に抑えます。" },
            { text: "IPL", isCorrect: false, explanation: "IPLは全体的なトーンアップに良いですが、シミ集中ケアならピコトーニング！" }
        ]
    },
    {
        text: "Q3. 「切らないリフトアップ」として知られる、高周波(RF)を利用した施術は？",
        options: [
            { text: "ボトックス", isCorrect: false, explanation: "ボトックスは筋肉の動きを抑制する注射です。" },
            { text: "オリジオ (Oligio)", isCorrect: true, explanation: "正解！韓国版サーマクールとも呼ばれ、即効性のある引き締め効果があります。" },
            { text: "脂肪溶解注射", isCorrect: false, explanation: "これは脂肪を溶かすための施術です。" }
        ]
    }
];

export default function KBeautyQuiz() {
    const [step, setStep] = useState(0);
    const [score, setScore] = useState(0);
    const [showExplanation, setShowExplanation] = useState(false);
    const [selectedOption, setSelectedOption] = useState<number | null>(null);
    const [isFinished, setIsFinished] = useState(false);

    const handleAnswer = (idx: number) => {
        setSelectedOption(idx);
        setShowExplanation(true);
        if (QUESTIONS[step].options[idx].isCorrect) {
            setScore(score + 1);
        }
    };

    const nextQuestion = () => {
        if (step < QUESTIONS.length - 1) {
            setStep(step + 1);
            setShowExplanation(false);
            setSelectedOption(null);
        } else {
            setIsFinished(true);
        }
    };

    if (isFinished) {
        return (
            <div className={styles.container}>
                <motion.div
                    className={styles.resultContainer}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                >
                    <h1>🇰🇷 K-ビューティークイズ結果</h1>
                    <div className={styles.typeTitle}>{score}点 / {QUESTIONS.length}点</div>

                    <p style={{ marginBottom: '2rem' }}>
                        {score === QUESTIONS.length ? "完璧です！あなたはK-ビューティーマスター🎓" :
                            score >= 1 ? "素晴らしい！トレンドをよく知っていますね✨" : "これからもっと詳しくなれますよ！🌱"}
                    </p>

                    <div className={styles.celebCard}>
                        <h3>💡 学んだトレンド施術</h3>
                        <p>ジュベルック、ピコトーニング、オリジオ</p>
                    </div>

                    <Link href="/treatments" className={styles.actionButton}>
                        トレンド施術の価格を見る
                    </Link>
                </motion.div>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            <div className={styles.progressBar}>
                <div
                    className={styles.progress}
                    style={{ width: `${((step + 1) / QUESTIONS.length) * 100}%` }}
                ></div>
            </div>

            <h1 className={styles.title}>K-ビューティートレンドクイズ</h1>

            <motion.div className={styles.questionCard}>
                <h2 className={styles.questionText}>
                    <span style={{ color: '#d4a373', display: 'block', fontSize: '0.9rem', marginBottom: '0.5rem' }}>
                        Question {step + 1}
                    </span>
                    {QUESTIONS[step].text}
                </h2>

                <div>
                    {!showExplanation ? (
                        QUESTIONS[step].options.map((opt, idx) => (
                            <button
                                key={idx}
                                className={styles.optionButton}
                                onClick={() => handleAnswer(idx)}
                            >
                                {opt.text}
                            </button>
                        ))
                    ) : (
                        <div>
                            <div style={{
                                padding: '1rem',
                                background: QUESTIONS[step].options[selectedOption!].isCorrect ? '#e6fffa' : '#fff5f5',
                                borderRadius: '8px',
                                marginBottom: '1rem',
                                border: `1px solid ${QUESTIONS[step].options[selectedOption!].isCorrect ? '#38b2ac' : '#fc8181'}`
                            }}>
                                <h3 style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>
                                    {QUESTIONS[step].options[selectedOption!].isCorrect ? "⭕ 正解！" : "❌ 残念..."}
                                </h3>
                                <p>{QUESTIONS[step].options[selectedOption!].explanation}</p>
                            </div>
                            <button className={styles.actionButton} onClick={nextQuestion}>
                                {step < QUESTIONS.length - 1 ? "次の問題へ" : "結果を見る"}
                            </button>
                        </div>
                    )}
                </div>
            </motion.div>
        </div>
    );
}
