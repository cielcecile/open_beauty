'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import styles from './TreatmentModal.module.css';

interface Treatment {
    id: string;
    name: string;
    name_en?: string;
    description: string;
    image_url?: string;
    price?: string;
    time?: string;
    downtime?: string;
    concern_type?: string;
}

interface TreatmentModalProps {
    treatment: Treatment;
    onClose: () => void;
}

export default function TreatmentModal({ treatment, onClose }: TreatmentModalProps) {
    const { user } = useAuth();
    const router = useRouter();
    const [isSaving, setIsSaving] = useState(false);

    const handleSaveTreatment = async () => {
        if (!user) {
            alert('ログインが必要です。');
            return;
        }

        setIsSaving(true);

        try {
            const { error } = await supabase
                .from('saved_treatments')
                .upsert(
                    {
                        user_id: user.id,
                        treatment_name: treatment.name,
                        treatment_name_en: treatment.name_en || '',
                        treatment_desc: treatment.description,
                        treatment_price: treatment.price || '',
                        treatment_time: treatment.time || '',
                        treatment_downtime: treatment.downtime || '',
                    },
                    { onConflict: 'user_id,treatment_name' }
                );

            if (error) {
                console.error('Error saving treatment:', error);
                alert('保存に失敗しました。');
                return;
            }

            alert('関心施術に登録されました！');
            onClose();
        } catch (err) {
            console.error('Unexpected error:', err);
            alert('エラーが発生しました。');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <motion.div
            className={styles.overlay}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
        >
            <motion.div
                className={styles.modal}
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                transition={{ duration: 0.3 }}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Close Button */}
                <button className={styles.closeBtn} onClick={onClose}>
                    ×
                </button>

                {/* Image */}
                {treatment.image_url && (
                    <div className={styles.imageContainer}>
                        <img
                            src={treatment.image_url}
                            alt={treatment.name}
                            className={styles.image}
                        />
                    </div>
                )}

                {/* Content */}
                <div className={styles.content}>
                    <h2 className={styles.title}>{treatment.name}</h2>
                    {treatment.name_en && (
                        <p style={{ fontSize: '0.9rem', color: '#666', margin: '4px 0 12px 0', fontStyle: 'italic' }}>
                            {treatment.name_en}
                        </p>
                    )}

                    {treatment.concern_type && (
                        <span className={styles.tag}>{treatment.concern_type}</span>
                    )}

                    <p className={styles.description}>{treatment.description}</p>

                    {/* Info Grid */}
                    <div className={styles.infoGrid}>
                        {treatment.price && (
                            <div className={styles.infoItem}>
                                <span className={styles.label}>予想費用</span>
                                <span className={styles.value}>{treatment.price}</span>
                            </div>
                        )}
                        {treatment.time && (
                            <div className={styles.infoItem}>
                                <span className={styles.label}>施術時間</span>
                                <span className={styles.value}>{treatment.time}</span>
                            </div>
                        )}
                        {treatment.downtime && (
                            <div className={styles.infoItem}>
                                <span className={styles.label}>回復期間</span>
                                <span className={styles.value}>{treatment.downtime}</span>
                            </div>
                        )}
                    </div>

                    {/* Buttons */}
                    <div className={styles.buttons}>
                        <button
                            className={styles.primaryBtn}
                            onClick={handleSaveTreatment}
                            disabled={isSaving}
                        >
                            {isSaving ? '保存中...' : '💖 関心施術登録'}
                        </button>
                        <button
                            className={styles.secondaryBtn}
                            onClick={() => {
                                router.push('/mypage');
                                onClose();
                            }}
                        >
                            マイページへ
                        </button>
                    </div>
                </div>
            </motion.div>
        </motion.div>
    );
}
