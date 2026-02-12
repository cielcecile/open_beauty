import Link from "next/link";
import styles from "./page.module.css";

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
      </section>
    </div>
  );
}
