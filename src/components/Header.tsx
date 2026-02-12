import Link from 'next/link';
import styles from './Header.module.css';

export default function Header() {
    return (
        <header className={styles.header}>
            <Link href="/" className={styles.logo}>
                AUREUM
            </Link>
            <nav className={styles.nav}>
                <Link href="/" className={styles.navLink}>ホーム</Link>
                <Link href="/analysis" className={styles.navLink}>AI分析</Link>
                <Link href="/survey" className={styles.navLink}>自己診断</Link>
            </nav>
        </header>
    );
}
