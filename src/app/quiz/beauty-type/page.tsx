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
        text: "Q1. 普段のメイクスタイルは？",
        options: [
            { text: "ナチュラルで透明感重視", type: "clean" },
            { text: "華やかでトレンドを意識", type: "k-master" },
            { text: "落ち着いた大人な雰囲気", type: "classy" },
            { text: "個性的でアーティスティック", type: "bold" }
        ]
    },
    {
        text: "Q2. 憧れの肌質は？",
        options: [
            { text: "水光肌（ツヤツヤ）", type: "clean" },
            { text: "陶器肌（マットで完璧）", type: "k-master" },
            { text: "健康的なヘルシー肌", type: "bold" },
            { text: "ハリのある弾力肌", type: "classy" }
        ]
    },
    {
        text: "Q3. 休日の過ごし方は？",
        options: [
            { text: "カフェでリラックス", type: "clean" },
            { text: "ショッピングや流行スポットへ", type: "k-master" },
            { text: "ジムやヨガで運動", type: "bold" },
            { text: "ホテルやスパで優雅に", type: "classy" }
        ]
    },
    {
        text: "Q4. ファッションの好みは？",
        options: [
            { text: "シンプル & ベーシック", type: "clean" },
            { text: "フェミニン & キュート", type: "k-master" },
            { text: "モード & 自立した女性", type: "bold" },
            { text: "エレガント & ラグジュアリー", type: "classy" }
        ]
    },
    {
        text: "Q5. もし美容施術を受けるなら？",
        options: [
            { text: "自然に若返りたい", type: "clean" },
            { text: "劇的に変わりたい", type: "bold" },
            { text: "トレンドの施術を試したい", type: "k-master" },
            { text: "エイジングケアを徹底したい", type: "classy" }
        ]
    }
];

const RESULTS: Record<string, { title: string; desc: string; celeb: string; recommend: string }> = {
    clean: {
        title: "🌿 クリーンビューティー型",
        desc: "飾らない自然な美しさを追求するあなた。透明感のある肌とナチュラルな雰囲気が魅力です。",
        celeb: "NewJeans ミンジ、ハン・ヒョジュ",
        recommend: "水光注射、LDM管理、スキンブースター"
    },
    "k-master": {
        title: "💖 K-ビューティーマスタートレンド型",
        desc: "流行に敏感で、常に新しい美を取り入れるあなた。韓国アイドルのような華やかさを目指しています。",
        celeb: "IVE ウォニョン、aespa カリナ",
        recommend: "唇フィラー、フルフェイスボトックス、ポテンツァ"
    },
    classy: {
        title: "✨ ラグジュアリーエレガント型",
        desc: "品格のある美しさを重視するあなた。内側から溢れ出るような優雅なオーラを持っています。",
        celeb: "ソン・ヘギョ、キム・ヒト",
        recommend: "ウルセラ、サーマージ、リジュランヒーラー"
    },
    bold: {
        title: "🔥 個性派グラマラス型",
        desc: "自分だけのスタイルを確立しているあなた。自信に満ちた強い美しさが特徴です。",
        celeb: "Jessi、BLACKPINK リサ",
        recommend: "輪郭注射、ハイフ(HIFU)、インモード"
    }
};

export default function BeautyTypeQuiz() {
    const [step, setStep] = useState(0);
    const [scores, setScores] = useState<Record<string, number>>({ clean: 0, "k-master": 0, classy: 0, bold: 0 });
    const [result, setResult] = useState<string | null>(null);

    const handleAnswer = (type: string) => {
        const newScores = { ...scores, [type]: scores[type] + 1 };
        setScores(newScores);

        if (step < QUESTIONS.length - 1) {
            setStep(step + 1);
        } else {
            // Find max score
            const maxType = Object.keys(newScores).reduce((a, b) => newScores[a] > newScores[b] ? a : b);
            setResult(maxType);
        }
    };

    if (result) {
        const data = RESULTS[result];
        return (
            <div className={styles.container}>
                <motion.div
                    className={styles.resultContainer}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                >
                    <h1>診断完了！あなたのタイプは...</h1>
                    <div className={styles.typeTitle}>{data.title}</div>
                    <p>{data.desc}</p>

                    <div className={styles.celebCard}>
                        <h3>🌟 似ている韓国セレブ</h3>
                        <p>{data.celeb}</p>
                    </div>

                    <div className={styles.celebCard} style={{ background: '#fffbf0', border: '1px solid #ffeaa7' }}>
                        <h3>💉 おすすめ施術</h3>
                        <p>{data.recommend}</p>
                    </div>

                    <div style={{ display: 'flex', gap: '10px', marginTop: '2rem' }}>
                        <button className={styles.actionButton} style={{ background: '#06c755' }}>LINEで共有</button>
                        <button className={styles.actionButton} style={{ background: '#1da1f2' }}>Xで共有</button>
                    </div>

                    <Link href="/treatments" className={styles.actionButton}>
                        おすすめ施術の詳細を見る
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

            <h1 className={styles.title}>パーソナルビューティータイプ診断</h1>

            <AnimatePresence mode='wait'>
                <motion.div
                    key={step}
                    initial={{ x: 20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{ x: -20, opacity: 0 }}
                    className={styles.questionCard}
                >
                    <h2 className={styles.questionText}>{QUESTIONS[step].text}</h2>
                    <div>
                        {QUESTIONS[step].options.map((opt, idx) => (
                            <button
                                key={idx}
                                className={styles.optionButton}
                                onClick={() => handleAnswer(opt.type)}
                            >
                                {opt.text}
                            </button>
                        ))}
                    </div>
                </motion.div>
            </AnimatePresence>
        </div>
    );
}
