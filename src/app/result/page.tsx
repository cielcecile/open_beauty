'use client';

import { useSearchParams } from 'next/navigation';
import { Suspense, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Yuna from '@/components/Yuna';
import BookingModal from '@/components/BookingModal';
import styles from './result.module.css';

interface Treatment {
    name: string;
    desc: string;
    price: string;
    time: string;
    downtime: string;
}

const TREATMENTS_DATABASE: Record<string, Treatment> = {
    sagging: {
        name: "シュリンク・ユニバース",
        desc: "超音波エネルギーで肌の深層部をリフトアップし、弾力を改善します。",
        price: "99,000ウォン~",
        time: "20分",
        downtime: "即時メイク可能"
    },
    wrinkles: {
        name: "シワボトックス",
        desc: "筋肉の動きを調整し、表情ジワを緩和・予防します。",
        price: "30,000ウォン~",
        time: "5分",
        downtime: "なし"
    },
    pores: {
        name: "アクアピール & ピコトーニング",
        desc: "毛穴の汚れを洗浄し、色素を改善して透明感のある肌を作ります。",
        price: "50,000ウォン~",
        time: "40分",
        downtime: "赤み (1-2時間)"
    },
    pigment: {
        name: "ピコトーニング",
        desc: "シミ・くしみを効果的に除去し、肌のトーンを明るくします。",
        price: "45,000ウォン~",
        time: "15分",
        downtime: "なし"
    },
    default: {
        name: "Lienjang シグネチャーケア",
        desc: "お客様の肌状態に合わせた1:1オーダーメイドの複合管理プログラムです。",
        price: "要相談",
        time: "60分",
        downtime: "個人差あり"
    }
};

function ResultContent() {
    const searchParams = useSearchParams();
    const concerns = searchParams.get('concerns')?.split(',') || [];
    const [isBookingOpen, setIsBookingOpen] = useState(false);

    const getRecommendation = (): Treatment => {
        if (concerns.some(c => c.includes('Sagging') || c.includes('たるみ'))) return TREATMENTS_DATABASE.sagging;
        if (concerns.some(c => c.includes('Wrinkles') || c.includes('シワ'))) return TREATMENTS_DATABASE.wrinkles;
        if (concerns.some(c => c.includes('Pores') || c.includes('毛穴'))) return TREATMENTS_DATABASE.pores;
        if (concerns.some(c => c.includes('Pigment') || c.includes('シミ'))) return TREATMENTS_DATABASE.pigment;
        return TREATMENTS_DATABASE.default;
    };

    const result = getRecommendation();

    return (
        <motion.div
            className={styles.container}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
        >
            <h1 className={styles.title}>診断結果レポート</h1>

            <Yuna
                message="こんにちは！お悩みに合わせた最適なケアをご提案します。あなたにぴったりの施術はこちらです✨"
            />

            <motion.div
                className={styles.resultCard}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1, duration: 0.6 }}
            >
                <span className={styles.typeTag}>#GlassSkin_Wannabe</span>

                <h2 className={styles.treatmentName}>{result.name}</h2>
                <p className={styles.description}>{result.desc}</p>

                <div className={styles.infoGrid}>
                    <div className={styles.infoItem}>
                        <span className={styles.label}>予想費用</span>
                        <span className={styles.value}>{result.price}</span>
                    </div>
                    <div className={styles.infoItem}>
                        <span className={styles.label}>施術時間</span>
                        <span className={styles.value}>{result.time}</span>
                    </div>
                    <div className={styles.infoItem}>
                        <span className={styles.label}>回復期間</span>
                        <span className={styles.value}>{result.downtime}</span>
                    </div>
                    <div className={styles.infoItem}>
                        <span className={styles.label}>痛み</span>
                        <span className={styles.value}>★☆☆☆☆</span>
                    </div>
                </div>

                <div className={styles.actionArea}>
                    <button
                        onClick={() => setIsBookingOpen(true)}
                        className={styles.primaryBtn}
                    >
                        📝 無料カウンセリング予約
                    </button>
                    <a
                        href="https://lin.ee/0kDysYy"
                        target="_blank"
                        rel="noopener noreferrer"
                        className={styles.secondaryBtn}
                    >
                        💬 LINEで気軽に相談
                    </a>
                </div>
            </motion.div>

            <motion.div
                className={styles.disclaimer}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.5 }}
            >
                <div>
                    <p style={{ fontWeight: 700, marginBottom: '0.4rem' }}>[免責事項]</p>
                    <p>本結果は美容情報の提供を目的としており、医学的な診断ではありません。</p>
                    <p>正確な診断と施術の可否については、必ず病院を訪問し、専門医療スタッフと相談してください。</p>
                    <p style={{ fontSize: '0.7rem', marginTop: '0.5rem', opacity: 0.6 }}>
                        (This result is for information purposes only and is not a medical diagnosis.)
                    </p>
                </div>
            </motion.div>

            <AnimatePresence>
                {isBookingOpen && (
                    <BookingModal
                        onClose={() => setIsBookingOpen(false)}
                        treatmentName={result.name}
                    />
                )}
            </AnimatePresence>
        </motion.div>
    );
}

export default function ResultPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <ResultContent />
        </Suspense>
    );
}
