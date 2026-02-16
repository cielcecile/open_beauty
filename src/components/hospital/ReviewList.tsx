'use client';

import type { Review } from '@/services/reviews';
import { getAverageRating } from '@/services/reviews';
import styles from './ReviewList.module.css';

interface ReviewListProps {
  reviews: Review[];
}

export default function ReviewList({ reviews }: ReviewListProps) {
  if (reviews.length === 0) return null;

  const avgRating = getAverageRating(reviews);

  return (
    <section className={styles.section}>
      <h2 className={styles.sectionTitle}>口コミ・レビュー</h2>

      <div className={styles.summary}>
        <div className={styles.avgScore}>
          <span className={styles.avgNumber}>{avgRating}</span>
          <span className={styles.avgLabel}>/ 5.0</span>
        </div>
        <div className={styles.avgStars}>{'★'.repeat(Math.round(avgRating))}{'☆'.repeat(5 - Math.round(avgRating))}</div>
        <span className={styles.totalCount}>{reviews.length}件のレビュー</span>
      </div>

      <div className={styles.reviewList}>
        {reviews.map((review) => (
          <div key={review.id} className={styles.reviewCard}>
            <div className={styles.reviewHeader}>
              <div className={styles.authorInfo}>
                <div className={styles.avatar}>{review.author_name.charAt(0)}</div>
                <div>
                  <span className={styles.authorName}>{review.author_name}</span>
                  <span className={styles.reviewDate}>{new Date(review.created_at).toLocaleDateString('ja-JP')}</span>
                </div>
              </div>
              <div className={styles.reviewStars}>{'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}</div>
            </div>
            <p className={styles.reviewContent}>{review.content}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
