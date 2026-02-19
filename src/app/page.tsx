'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { StarOutlined, RightOutlined } from '@ant-design/icons';
import styles from './page.module.css';

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    // @ts-ignore
    transition: { duration: 0.8, ease: "easeOut" }
  }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2
    }
  }
};

export default function Home() {
  return (
    <main className={styles.main}>
      <motion.div
        className={styles.heroSection}
        initial="hidden"
        animate="visible"
        variants={staggerContainer}
      >
        <div className={styles.heroContent}>
          <motion.div variants={fadeIn as any}>
            <h1 className={styles.title}>
              AI美容分析で<br />
              <span className="text-accent">あなただけの美</span>を見つける
            </h1>
            <p className={styles.subtitle}>
              最先端AIが写真一枚で肌状態を分析。<br />
              最適な美容施術とクリニックを、<br className="sm:hidden" />あなたのために提案します。
            </p>
          </motion.div>

          <motion.div variants={fadeIn as any}>
            <Link href="/analysis" className={styles.ctaButton}>
              <div className="flex-center" style={{ gap: '8px' }}>
                <StarOutlined style={{ fontSize: '1.2rem' }} />
                <span>AI美容分析をはじめる</span>
              </div>
              <span className={styles.ctaSubtext}>無料・会員登録なしで試す</span>
            </Link>
          </motion.div>

          <motion.div
            className={styles.quizGrid}
            variants={fadeIn as any}
          >
            <Link href="/quiz/beauty-type" className={`${styles.quizCard} beauty`}>
              <div className={styles.cardIcon}>💄</div>
              <h3 className={styles.cardTitle}>ビューティータイプ診断</h3>
              <p className={styles.cardDesc}>
                5つの質問であなたの美の傾向を分析。<br />
                似合うメイクや施術の方向性がわかります。
              </p>
              <div className="text-accent" style={{ marginTop: 'auto', paddingTop: '1rem' }}>
                診断する <RightOutlined style={{ fontSize: '0.8rem' }} />
              </div>
            </Link>

            <Link href="/quiz/k-beauty" className={`${styles.quizCard} kbeauty`}>
              <div className={styles.cardIcon}>🌸</div>
              <h3 className={styles.cardTitle}>K-Beautyスタイル診断</h3>
              <p className={styles.cardDesc}>
                韓国トレンドの中から<br />
                あなたに最適なスタイルをご提案します。
              </p>
              <div className="text-accent" style={{ marginTop: 'auto', paddingTop: '1rem' }}>
                診断する <RightOutlined style={{ fontSize: '0.8rem' }} />
              </div>
            </Link>
          </motion.div>
        </div>
      </motion.div>
    </main>
  );
}
