import Link from 'next/link';
import styles from './page.module.css';
import QuizBanner from '@/components/QuizBanner';

export default function Home() {
  return (
    <div className={styles.container}>
      <section className={styles.hero}>
        <h1 className={styles.title}>
          AI美容分析で
          <br />
          あなたに合う施術を見つける
        </h1>
        <p className={styles.subtitle}>
          写真一枚で肌状態を分析し、
          <br />
          おすすめ施術とクリニックを比較できます。
          <br />
          予約までスムーズに進められます。
        </p>

        <Link href="/analysis" className={styles.visionButton}>
          <span className={styles.btnIcon}>✨</span>
          <span className={styles.btnText}>AI美容分析をはじめる</span>
          <span className={styles.btnSubtext}>画像アップロードで結果を確認</span>
        </Link>

        <div className={styles.quizSection}>
          <QuizBanner
            title="ビューティータイプ診断"
            description="5つの質問で肌タイプを簡単にチェック"
            href="/quiz/beauty-type"
            icon="💄"
            gradient="linear-gradient(135deg, #ff9a9e 0%, #fecfef 99%, #fecfef 100%)"
          />
          <QuizBanner
            title="K-Beautyスタイル診断"
            description="あなたに合うK-Beauty施術の方向性を提案"
            href="/quiz/k-beauty"
            icon="🌸"
            gradient="linear-gradient(135deg, #84fab0 0%, #8fd3f4 100%)"
          />
        </div>
      </section>
    </div>
  );
}
