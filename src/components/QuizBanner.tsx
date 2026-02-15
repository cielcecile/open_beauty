import Link from 'next/link';
import styles from './QuizBanner.module.css';

interface QuizBannerProps {
    title: string;
    description: string;
    href: string;
    icon: string;
    gradient: string;
}

export default function QuizBanner({ title, description, href, icon, gradient }: QuizBannerProps) {
    return (
        <Link
            href={href}
            className={styles.banner}
            style={{ background: gradient }}
        >
            <span className={styles.icon}>{icon}</span>
            <span className={styles.title}>{title}</span>
            <span className={styles.description}>{description}</span>
        </Link>
    );
}
