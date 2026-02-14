'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import type { Hospital } from '@/services/hospitals';
import styles from './HospitalHeader.module.css';

const CATEGORY_LABELS: Record<string, string> = {
    DERMATOLOGY: '皮膚科',
    PLASTIC: '美容外科',
    DENTISTRY: '歯科',
    ORIENTAL: '韓医院',
};

interface HospitalHeaderProps {
    hospital: Hospital;
    averageRating?: number;
    reviewCount?: number;
}

export default function HospitalHeader({ hospital, averageRating, reviewCount }: HospitalHeaderProps) {
    const router = useRouter();
    const [imageError, setImageError] = useState(false);

    return (
        <div className={styles.headerContainer}>
            {/* Hero Image */}
            <div className={styles.heroImage}>
                {!imageError ? (
                    <Image
                        src={hospital.image_url}
                        alt={hospital.name}
                        fill
                        style={{ objectFit: 'cover' }}
                        sizes="(max-width: 768px) 100vw, 800px"
                        unoptimized
                        onError={() => setImageError(true)}
                    />
                ) : (
                    <div className={styles.imageFallback}>
                        <span>🏥</span>
                    </div>
                )}
                <button onClick={() => router.back()} className={styles.backBtn}>
                    &larr;
                </button>
                <div className={styles.categoryBadge}>
                    {CATEGORY_LABELS[hospital.category] || hospital.category}
                </div>
            </div>

            {/* Info Section */}
            <div className={styles.infoSection}>
                <h1 className={styles.hospitalName}>{hospital.name}</h1>

                {averageRating !== undefined && averageRating > 0 && (
                    <div className={styles.ratingRow}>
                        <span className={styles.stars}>
                            {'★'.repeat(Math.round(averageRating))}{'☆'.repeat(5 - Math.round(averageRating))}
                        </span>
                        <span className={styles.ratingValue}>{averageRating}</span>
                        {reviewCount !== undefined && (
                            <span className={styles.reviewCount}>({reviewCount}件のレビュー)</span>
                        )}
                    </div>
                )}

                <p className={styles.description}>{hospital.description}</p>

                {hospital.detail_description && (
                    <p className={styles.detailDescription}>{hospital.detail_description}</p>
                )}

                {hospital.address && (
                    <div className={styles.addressRow}>
                        <span>📍</span>
                        <span>{hospital.address}</span>
                    </div>
                )}

                <div className={styles.tags}>
                    <span className={styles.tag}>🌐 日本語OK</span>
                    <span className={styles.tag}>💳 カード支払い</span>
                    <span className={styles.tag}>✨ プレミアム</span>
                </div>
            </div>
        </div>
    );
}
