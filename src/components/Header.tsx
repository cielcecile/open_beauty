import Link from 'next/link';
import styles from './Header.module.css';

export default function Header() {
    return (
        <header className={styles.header}>
            <Link href="/" className={styles.logo} style={{ fontSize: '1.2rem', margin: '0 auto' }}>
                AUREUM
            </Link>
        </header>
    );
}
