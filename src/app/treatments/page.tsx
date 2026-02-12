'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import styles from './treatments.module.css';

interface Treatment {
    name: string;
    krPrice: string;
    jpPrice: string;
    effect: string;
    downtime: string;
    category: string;
}

const TREATMENTS: Treatment[] = [
    { name: "ピコトーニング", krPrice: "45,000ウォン", jpPrice: "15,000円", effect: "シミ改善・美白", downtime: "なし", category: "美肌" },
    { name: "オリジオ (300shot)", krPrice: "350,000ウォン", jpPrice: "80,000円", effect: "強力リフトアップ", downtime: "即時メイク可", category: "リフトアップ" },
    { name: "ジュベルック (2cc)", krPrice: "250,000ウォン", jpPrice: "60,000円", effect: "毛穴・キメ改善", downtime: "1-2日(赤み)", category: "再生" },
    { name: "シュリンクユニバース", krPrice: "99,000ウォン", jpPrice: "30,000円", effect: "二重顎・たるみ改善", downtime: "なし", category: "リフトアップ" },
    { name: "ポテンツァ (Pump Tip)", krPrice: "220,000ウォン", jpPrice: "60,000円", effect: "ニキビ跡・毛穴", downtime: "3-4日(赤み)", category: "美肌" }
];

export default function TreatmentsPage() {
    return (
        <div className={styles.container}>
            <motion.h1
                className={styles.title}
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                style={{ textAlign: "center", marginBottom: "2rem" }}
            >
                🇰🇷 韓国美容施術 価格比較
            </motion.h1>

            <motion.div
                className={styles.intro}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                style={{ textAlign: "center", marginBottom: "3rem", color: "#666", lineHeight: "1.6" }}
            >
                <p>韓国に来たら受けるべき人気施術を厳選しました。</p>
                <p>日本の平均価格と比較して、どれだけお得か確認してみてください。</p>
            </motion.div>

            <motion.div
                className={styles.tableContainer}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5 }}
            >
                <table className={styles.table}>
                    <thead>
                        <tr>
                            <th>施術名</th>
                            <th>韓国価格 (平均)</th>
                            <th>日本価格 (参考)</th>
                            <th>効果・ダウンタイム</th>
                            <th>予約</th>
                        </tr>
                    </thead>
                    <tbody>
                        {TREATMENTS.map((t, i) => (
                            <tr key={i}>
                                <td style={{ fontWeight: 600 }}>{t.name}</td>
                                <td className={styles.priceKr}>{t.krPrice}</td>
                                <td className={styles.priceJp}>{t.jpPrice}</td>
                                <td style={{ fontSize: "0.85rem", color: "#666" }}>
                                    <span style={{ display: "block", color: "#333", fontWeight: 500 }}>{t.effect}</span>
                                    {t.downtime}
                                </td>
                                <td>
                                    <Link href="/survey" className={styles.ctaButton}>相談する</Link>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </motion.div>

            <div style={{ marginTop: "3rem", textAlign: "center" }}>
                <h3 className={styles.sectionTitle}>✨ パッケージでさらにお得に</h3>
                <Link href="/packages" style={{
                    display: "inline-block",
                    padding: "1rem 2rem",
                    background: "#d4a373",
                    color: "white",
                    borderRadius: "8px",
                    textDecoration: "none",
                    fontWeight: 700,
                    boxShadow: "0 4px 6px rgba(212, 163, 115, 0.3)"
                }}>
                    3日間のビューティー旅行プランを見る →
                </Link>
            </div>
        </div>
    );
}
