import Link from 'next/link';
import Image from 'next/image';
import styles from './Header.module.css';

export default function Header() {
    return (
        <header className={styles.header}>
            <Link href="/" className={styles.logo} style={{ fontSize: '1.2rem', margin: '0 auto', display: 'flex', alignItems: 'center' }}>
                <Image src="/logo.png" alt="AUREUM" width={28} height={28} style={{ marginRight: '10px' }} />
                AUREUM BEAUTY
            </Link>
        </header>
    );
}
