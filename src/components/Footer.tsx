
import styles from './Footer.module.css';

export default function Footer() {
    return (
        <footer className={styles.footer}>
            <div className={styles.links}>
                <a href="#" className={styles.link}>利用規約</a>
                <a href="#" className={styles.link}>プライバシーポリシー</a>
                <a href="#" className={styles.link}>お問い合わせ</a>
            </div>
            <p className={styles.copy}>&copy; 2026 Aureum. All rights reserved.</p>
        </footer>
    );
}
