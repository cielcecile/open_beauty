import Link from "next/link";
import styles from "./page.module.css";

export default function Home() {
  return (
    <main className={styles.main}>
      <div className={styles.logoArea}>
        <span className={styles.logoText}>AUREUM</span>
      </div>

      <section className={`${styles.hero}`}>
        <h1 className={styles.title}>
          AIが導く、<br />
          あなただけの美しさ
        </h1>
        <p className={styles.subtitle}>
          「AUREUM（アウルム）」は、あなたの持つ本来の魅力を引き出します。<br />
          AI分析で、あなたに最適な施術を見つけましょう。
        </p>

        <div className={styles.ctaArea}>
          <Link href="/analysis" className={styles.visionButton}>
            <span>📸</span> AI精密写真分析
          </Link>
          <Link href="/survey" className={styles.surveyButton}>
            <span>📝</span> 簡単アンケート診断
          </Link>
        </div>
      </section>

      <section className={styles.description}>
        <h3>なぜAureumなのか？</h3>
        <ul className={styles.featureList}>
          <li className={styles.featureItem}>皮膚科専門医データに基づく分析</li>
          <li className={styles.featureItem}>あなたに最適な施術マッチング</li>
          <li className={styles.featureItem}>信頼できるクリニックの厳選</li>
        </ul>
      </section>
    </main>
  );
}
