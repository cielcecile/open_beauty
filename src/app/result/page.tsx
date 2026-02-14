'use client';

import { useSearchParams } from 'next/navigation';
import { Suspense, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Yuna from '@/components/Yuna';
import BookingModal from '@/components/BookingModal';
import LoginModal from '@/components/LoginModal';
import { useAuth } from '@/context/AuthContext';
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
    const [showLogin, setShowLogin] = useState(false);
    const { user, loading: authLoading } = useAuth();

    const getRecommendation = (): Treatment => {
        if (concerns.some(c => c.includes('Sagging') || c.includes('たるみ'))) return TREATMENTS_DATABASE.sagging;
        if (concerns.some(c => c.includes('Wrinkles') || c.includes('シワ'))) return TREATMENTS_DATABASE.wrinkles;
        if (concerns.some(c => c.includes('Pores') || c.includes('毛穴'))) return TREATMENTS_DATABASE.pores;
        if (concerns.some(c => c.includes('Pigment') || c.includes('シミ'))) return TREATMENTS_DATABASE.pigment;
        return TREATMENTS_DATABASE.default;
    };

    const result = getRecommendation();
    const isLoggedIn = !authLoading && !!user;

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

            {/* Preview Card — always visible */}
            <motion.div
                className={styles.resultCard}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1, duration: 0.6 }}
            >
                <span className={styles.typeTag}>#GlassSkin_Wannabe</span>
                <h2 className={styles.treatmentName}>{result.name}</h2>
                <p className={styles.description}>{result.desc}</p>
            </motion.div>

            {/* ===== LOGIN GATE ===== */}
            {!isLoggedIn ? (
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1.2, duration: 0.6 }}
                    style={{ position: 'relative', marginTop: '1rem' }}
                >
                    {/* Blurred preview of detail content */}
                    <div style={{
                        filter: 'blur(6px)',
                        pointerEvents: 'none',
                        userSelect: 'none',
                        opacity: 0.5,
                    }}>
                        <div className={styles.resultCard}>
                            <div className={styles.infoGrid}>
                                <div className={styles.infoItem}>
                                    <span className={styles.label}>予想費用</span>
                                    <span className={styles.value}>***</span>
                                </div>
                                <div className={styles.infoItem}>
                                    <span className={styles.label}>施術時間</span>
                                    <span className={styles.value}>***</span>
                                </div>
                                <div className={styles.infoItem}>
                                    <span className={styles.label}>回復期間</span>
                                    <span className={styles.value}>***</span>
                                </div>
                                <div className={styles.infoItem}>
                                    <span className={styles.label}>痛み</span>
                                    <span className={styles.value}>***</span>
                                </div>
                            </div>
                        </div>
                        <div className={styles.resultCard} style={{ marginTop: '0.8rem' }}>
                            <h3 style={{ fontSize: '1.2rem' }}>🏆 おすすめのクリニック</h3>
                            <p>クリニック情報はログイン後にご覧いただけます。</p>
                        </div>
                    </div>

                    {/* Login CTA overlay */}
                    <div style={{
                        position: 'absolute',
                        inset: 0,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 10,
                    }}>
                        <div style={{
                            background: 'rgba(255,255,255,0.95)',
                            backdropFilter: 'blur(8px)',
                            borderRadius: '20px',
                            padding: '2rem 2.5rem',
                            textAlign: 'center',
                            boxShadow: '0 12px 40px rgba(126, 58, 242, 0.15)',
                            maxWidth: '340px',
                            width: '90%',
                        }}>
                            <div style={{ fontSize: '2.5rem', marginBottom: '0.8rem' }}>🔒</div>
                            <h3 style={{ fontSize: '1.2rem', fontWeight: '700', color: '#111', margin: '0 0 0.5rem' }}>
                                詳細結果を見るには
                            </h3>
                            <p style={{ fontSize: '0.9rem', color: '#666', margin: '0 0 1.5rem', lineHeight: '1.5' }}>
                                ログインすると、費用・施術時間・おすすめクリニックなど<br />
                                すべての診断結果をご覧いただけます。
                            </p>
                            <button
                                onClick={() => setShowLogin(true)}
                                style={{
                                    width: '100%',
                                    padding: '0.9rem',
                                    background: 'linear-gradient(135deg, #7e3af2, #6c2bd9)',
                                    color: '#fff',
                                    border: 'none',
                                    borderRadius: '12px',
                                    fontSize: '1rem',
                                    fontWeight: '700',
                                    cursor: 'pointer',
                                    fontFamily: 'inherit',
                                    marginBottom: '0.7rem',
                                    transition: 'transform 0.2s, box-shadow 0.2s',
                                }}
                                onMouseOver={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(126,58,242,0.3)'; }}
                                onMouseOut={(e) => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = ''; }}
                            >
                                ✨ 無料ログイン / 新規登録
                            </button>
                            <p style={{ fontSize: '0.75rem', color: '#aaa', margin: 0 }}>
                                30秒で完了 ・ 完全無料
                            </p>
                        </div>
                    </div>
                </motion.div>
            ) : (
                <>
                    {/* Full Detail — logged in */}
                    <motion.div
                        className={styles.resultCard}
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 1.2, duration: 0.6 }}
                        style={{ marginTop: '1rem' }}
                    >
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
                        className={styles.resultCard}
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 1.4, duration: 0.6 }}
                        style={{ marginTop: '1rem' }}
                    >
                        <h3 className={styles.treatmentName} style={{ fontSize: '1.2rem', marginBottom: '1rem' }}>🏆 おすすめのクリニック</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                            <div style={{ border: '1px solid #eee', padding: '1rem', borderRadius: '12px', background: '#fafafa' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                                    <span style={{ fontWeight: 700, fontSize: '0.95rem' }}>リエンジャン美容外科 (Lienjang)</span>
                                    <span style={{ fontSize: '0.8rem', color: '#ff6b6b', fontWeight: 600 }}>★ 4.8</span>
                                </div>
                                <p style={{ fontSize: '0.85rem', color: '#666', marginBottom: '0.4rem' }}>📍 ソウル江南・明洞・弘大</p>
                                <p style={{ fontSize: '0.8rem', color: '#888' }}>外国人患者誘致医療機関 / 日本語通訳常駐</p>
                            </div>

                            <div style={{ border: '1px solid #eee', padding: '1rem', borderRadius: '12px', background: '#fafafa' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                                    <span style={{ fontWeight: 700, fontSize: '0.95rem' }}>アウルムクリニック (AUREUM)</span>
                                    <span style={{ fontSize: '0.8rem', color: '#ff6b6b', fontWeight: 600 }}>★ 4.9</span>
                                </div>
                                <p style={{ fontSize: '0.85rem', color: '#666', marginBottom: '0.4rem' }}>📍 ソウル新沙・狎鴎亭</p>
                                <p style={{ fontSize: '0.8rem', color: '#888' }}>プレミアム1:1オーダーメイド施術 / プライベート個室</p>
                            </div>
                        </div>
                    </motion.div>

                    {/* SNS Share Section */}
                    <motion.div
                        className={styles.resultCard}
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 1.6, duration: 0.6 }}
                        style={{ marginTop: '1rem', textAlign: 'center' }}
                    >
                        <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem', color: '#333' }}>📤 友達にもシェアしよう！</h3>
                        <div style={{ display: 'flex', gap: '0.8rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                            <button
                                onClick={() => {
                                    const shareText = `AUREUM BEAUTYで美容診断をやってみたよ！私のおすすめは「${result.name}」✨ あなたも診断してみて👇`;
                                    const shareUrl = typeof window !== 'undefined' ? window.location.href : '';
                                    if (typeof navigator !== 'undefined' && navigator.share) {
                                        navigator.share({ title: 'AUREUM BEAUTY 美容診断', text: shareText, url: shareUrl }).catch(() => { });
                                    } else {
                                        navigator.clipboard?.writeText(`${shareText}\n${shareUrl}`);
                                        alert('リンクをコピーしました！');
                                    }
                                }}
                                style={{ padding: '0.7rem 1.5rem', borderRadius: '10px', border: '1px solid #ddd', background: '#fff', cursor: 'pointer', fontSize: '0.9rem', fontFamily: 'inherit' }}
                            >
                                📋 リンクをコピー
                            </button>
                            <a
                                href={`https://social-plugins.line.me/lineit/share?url=${typeof window !== 'undefined' ? encodeURIComponent(window.location.href) : ''}&text=${encodeURIComponent(`AUREUM BEAUTYで美容診断！おすすめは「${result.name}」✨`)}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{ padding: '0.7rem 1.5rem', borderRadius: '10px', border: 'none', background: '#06C755', color: '#fff', cursor: 'pointer', fontSize: '0.9rem', textDecoration: 'none', fontWeight: '600' }}
                            >
                                💚 LINEで共有
                            </a>
                            <a
                                href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(`AUREUM BEAUTYで美容診断をやってみた！おすすめは「${result.name}」✨ #韓国美容 #AUREUMBEAUTY`)}&url=${typeof window !== 'undefined' ? encodeURIComponent(window.location.href) : ''}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{ padding: '0.7rem 1.5rem', borderRadius: '10px', border: 'none', background: '#000', color: '#fff', cursor: 'pointer', fontSize: '0.9rem', textDecoration: 'none', fontWeight: '600' }}
                            >
                                𝕏 ポスト
                            </a>
                        </div>
                    </motion.div>
                </>
            )}

            <motion.div
                className={styles.disclaimer}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.8 }}
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

            {showLogin && (
                <LoginModal
                    onClose={() => setShowLogin(false)}
                    message="診断結果の詳細を確認するにはログインが必要です。"
                />
            )}
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
