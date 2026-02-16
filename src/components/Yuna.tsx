'use client';

import { useState } from 'react';
import Image from 'next/image';
import styles from './yuna.module.css';

interface YunaProps {
  message: string;
  sideImage?: string | null;
}

export default function Yuna({ message, sideImage }: YunaProps) {
  const [imageError, setImageError] = useState(false);

  return (
    <div className={styles.yunaWrapper}>
      <div className={styles.topRow}>
        <div className={`${styles.avatarFrame} ${styles.floating}`}>
          {!imageError ? (
            <Image src="/images/yuna.png" alt="ユナ" width={72} height={72} className={styles.avatarImage} onError={() => setImageError(true)} unoptimized />
          ) : (
            <div className={styles.avatarFallback}>ユナ</div>
          )}
        </div>

        {sideImage && (
          <div className={styles.sideImageFrame}>
            <Image src={sideImage} alt="ユーザー" width={80} height={80} className={styles.sideImage} unoptimized />
            <div className={styles.analyzedBadge}>分析済み</div>
          </div>
        )}
      </div>

      <div className={styles.speechBubble}>
        <span className={styles.yunaName}>AIカウンセラー ユナ</span>
        <p className={styles.message}>{message}</p>
      </div>
    </div>
  );
}
