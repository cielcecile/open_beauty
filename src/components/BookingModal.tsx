'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import styles from './BookingModal.module.css';

interface BookingModalProps {
    onClose: () => void;
    treatmentName: string;
}

export default function BookingModal({ onClose, treatmentName }: BookingModalProps) {
    const [formData, setFormData] = useState({
        name: '',
        contact: '',
        date: '',
        time: ''
    });
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setStatus('loading');

        try {
            const res = await fetch('/api/booking', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...formData, treatment: treatmentName })
            });

            if (res.ok) {
                setStatus('success');
            } else {
                setStatus('error');
            }
        } catch (err) {
            console.error('Booking submit error:', err);
            setStatus('error');
        }
    };

    return (
        <motion.div
            className={styles.modalOverlay}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
        >
            <motion.div
                className={styles.modalContent}
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                transition={{ type: "spring", damping: 25, stiffness: 300 }}
                onClick={e => e.stopPropagation()}
            >
                <button className={styles.closeBtn} onClick={onClose}>×</button>

                {status === 'success' ? (
                    <div className={styles.successMessage}>
                        <span className={styles.successIcon}>✨</span>
                        <h2 className={styles.title}>予約が受け付けられました</h2>
                        <p className={styles.subtitle}>
                            担当者より24時間以内にご連絡差し上げます。<br />
                            しばらくお待ちください。
                        </p>
                        <button className={styles.submitBtn} onClick={onClose} style={{ width: '100%' }}>閉じる</button>
                    </div>
                ) : (
                    <>
                        <h2 className={styles.title}>無料カウンセリング予約</h2>
                        <p className={styles.subtitle}>希望する施術: {treatmentName}</p>

                        <form className={styles.form} onSubmit={handleSubmit}>
                            <div className={styles.inputGroup}>
                                <label className={styles.label}>お名前 (姓名)</label>
                                <input
                                    className={styles.input}
                                    type="text"
                                    required
                                    placeholder="山田 太郎"
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                />
                            </div>
                            <div className={styles.inputGroup}>
                                <label className={styles.label}>連絡先 (電話番号/LINE ID)</label>
                                <input
                                    className={styles.input}
                                    type="text"
                                    required
                                    placeholder="090-0000-0000"
                                    value={formData.contact}
                                    onChange={e => setFormData({ ...formData, contact: e.target.value })}
                                />
                            </div>
                            <div style={{ display: 'flex', gap: '1rem' }}>
                                <div className={styles.inputGroup} style={{ flex: 1 }}>
                                    <label className={styles.label}>希望日程</label>
                                    <input
                                        className={styles.input}
                                        type="date"
                                        required
                                        value={formData.date}
                                        onChange={e => setFormData({ ...formData, date: e.target.value })}
                                    />
                                </div>
                                <div className={styles.inputGroup} style={{ flex: 1 }}>
                                    <label className={styles.label}>希望時間</label>
                                    <select
                                        className={styles.input}
                                        required
                                        value={formData.time}
                                        onChange={e => setFormData({ ...formData, time: e.target.value })}
                                    >
                                        <option value="">選択</option>
                                        <option value="10:00">10:00</option>
                                        <option value="13:00">13:00</option>
                                        <option value="15:00">15:00</option>
                                        <option value="17:00">17:00</option>
                                    </select>
                                </div>
                            </div>

                            <button className={styles.submitBtn} type="submit" disabled={status === 'loading'}>
                                {status === 'loading' ? '送信中...' : '予約を確定する'}
                            </button>
                            {status === 'error' && <p style={{ color: 'red', fontSize: '0.8rem', textAlign: 'center' }}>送信エラーが発生しました。再度お試しください。</p>}
                        </form>
                    </>
                )}
            </motion.div>
        </motion.div>
    );
}
