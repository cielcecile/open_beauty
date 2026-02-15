import Link from "next/link";
import styles from "./page.module.css";
import QuizBanner from "@/components/QuizBanner";

export default function Home() {
  return (
    <div className={styles.container}>
      <section className={styles.hero}>
        <h1 className={styles.title}>
          AIが導く、<br />
          あなただけの美しさ
        </h1>
        <p className={styles.subtitle}>
          AI精密分析とアンケートで、<br />
          あなたに最適な美容医療と<br />
          旅行プランをご提案します。
        </p>

        <Link href="/analysis" className={styles.visionButton}>
          <span className={styles.btnIcon}>✨</span>
          <span className={styles.btnText}>AI総合ビューティー診断を始める</span>
          <span className={styles.btnSubtext}>写真分析 • 悩み相談 • 旅行プラン</span>
        </Link>

        <div className={styles.quizSection}>
          <QuizBanner
            title="パーソナルビューティータイプ"
            description="5つの質問であなたの美のタイプを診断"
            href="/quiz/beauty-type"
            icon="💎"
            gradient="linear-gradient(135deg, #ff9a9e 0%, #fecfef 99%, #fecfef 100%)"
          />
          <QuizBanner
            title="韓国ビューティートレンドクイズ"
            description="最新の韓国美容知識をチェック！"
            href="/quiz/k-beauty"
            icon="🇰🇷"
            gradient="linear-gradient(135deg, #84fab0 0%, #8fd3f4 100%)"
          />
        </div>
      </section>
    </div>
  );
}
