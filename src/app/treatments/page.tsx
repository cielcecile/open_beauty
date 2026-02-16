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
  { name: 'ピコトーニング', krPrice: '45,000ウォン', jpPrice: '15,000円', effect: '色素改善・トーンアップ', downtime: 'なし', category: '美肌' },
  { name: 'オリジオ (300shot)', krPrice: '350,000ウォン', jpPrice: '80,000円', effect: 'リフトアップ', downtime: '即日メイク可', category: 'リフト' },
  { name: 'ジュベルック (2cc)', krPrice: '250,000ウォン', jpPrice: '60,000円', effect: '毛穴・キメ改善', downtime: '1-2日(赤み)', category: '再生' },
  { name: 'シュリンクユニバース', krPrice: '99,000ウォン', jpPrice: '30,000円', effect: '弾力・輪郭ケア', downtime: 'なし', category: 'リフト' },
  { name: 'ポテンツァ (Pump Tip)', krPrice: '220,000ウォン', jpPrice: '60,000円', effect: 'ニキビ跡・毛穴', downtime: '3-4日(赤み)', category: '美肌' },
];

export default function TreatmentsPage() {
  return (
    <div className={styles.container}>
      <motion.h1 className={styles.title} initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} style={{ textAlign: 'center', marginBottom: '2rem' }}>
        韓国人気施術 価格比較
      </motion.h1>

      <motion.div className={styles.intro} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} style={{ textAlign: 'center', marginBottom: '3rem', color: '#666', lineHeight: '1.6' }}>
        <p>韓国で人気の施術を厳選してまとめました。</p>
        <p>日本価格との比較でコスト感を確認できます。</p>
      </motion.div>

      <motion.div className={styles.tableContainer} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.5 }}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>施術名</th>
              <th>韓国価格</th>
              <th>日本価格</th>
              <th>効果・ダウンタイム</th>
              <th>相談</th>
            </tr>
          </thead>
          <tbody>
            {TREATMENTS.map((treatment) => (
              <tr key={treatment.name}>
                <td style={{ fontWeight: 600 }}>{treatment.name}</td>
                <td className={styles.priceKr}>{treatment.krPrice}</td>
                <td className={styles.priceJp}>{treatment.jpPrice}</td>
                <td style={{ fontSize: '0.85rem', color: '#666' }}>
                  <span style={{ display: 'block', color: '#333', fontWeight: 500 }}>{treatment.effect}</span>
                  {treatment.downtime}
                </td>
                <td><Link href="/survey" className={styles.ctaButton}>相談する</Link></td>
              </tr>
            ))}
          </tbody>
        </table>
      </motion.div>

      <div style={{ marginTop: '3rem', textAlign: 'center' }}>
        <h3 className={styles.sectionTitle}>パッケージでさらにお得に</h3>
        <Link href="/packages" style={{ display: 'inline-block', padding: '1rem 2rem', background: '#d4a373', color: 'white', borderRadius: '8px', textDecoration: 'none', fontWeight: 700 }}>
          3日間ビューティープランを見る →
        </Link>
      </div>
    </div>
  );
}
