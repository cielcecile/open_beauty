'use client';

import { useState } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import styles from './yuna.module.css';

interface YunaProps {
    message: string;
    sideImage?: string | null;
}

export default function Yuna({ message, sideImage }: YunaProps) {
    const [imageError, setImageError] = useState(false);

    return (
        <motion.div
            className={styles.yunaWrapper}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
        >
            <div className={styles.topRow}>
                <motion.div
                    className={styles.avatarFrame}
                    animate={{
                        y: [0, -8, 0],
                    }}
                    transition={{
                        duration: 4,
                        repeat: Infinity,
                        ease: "easeInOut"
                    }}
                >
                    {!imageError ? (
                        <Image
                            src="/images/yuna.png"
                            alt="AI Counselor Yuna"
                            width={150}
                            height={150}
                            className={styles.avatarImage}
                            priority
                            onError={() => setImageError(true)}
                        />
                    ) : (
                        <div className={styles.avatarFallback}>
                            <span>Yuna</span>
                        </div>
                    )}
                </motion.div>

                {sideImage && (
                    <motion.div
                        className={styles.sideImageFrame}
                        initial={{ opacity: 0, x: 20, rotate: 5 }}
                        animate={{ opacity: 1, x: 0, rotate: 3 }}
                        transition={{ delay: 0.3 }}
                    >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={sideImage} alt="User Analysis" className={styles.sideImage} />
                        <div className={styles.analyzedBadge}>Analyzed</div>
                    </motion.div>
                )}
            </div>

            <motion.div
                className={styles.speechBubble}
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.5, duration: 0.5 }}
            >
                <span className={styles.yunaName}>AI Counselor Yuna</span>
                <p className={styles.message}>{message}</p>
            </motion.div>
        </motion.div>
    );
}
