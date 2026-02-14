'use client';

import { useState } from 'react';
import styles from './BookingSection.module.css';

interface BookingSectionProps {
    hospitalId: string;
    hospitalName: string;
}

export default function BookingSection({ hospitalId, hospitalName }: BookingSectionProps) {
    const [showModal, setShowModal] = useState(false);
    const [form, setForm] = useState({ name: '', contact: '', treatment: '', date: '', message: '' });
    const [submitted, setSubmitted] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            await fetch('/api/booking', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...form,
                    hospitalId,
                    hospitalName,
                }),
            });
            setSubmitted(true);
        } catch {
            alert('送信に失敗しました。もう一度お試しください。');
        } finally {
            setLoading(false);
        }
    };

    return (
        <section className={styles.section}>
            <div className={styles.ctaCard}>
                <h2 className={styles.ctaTitle}>📩 無料カウンセリング予約</h2>
                <p className={styles.ctaDesc}>
                    {hospitalName}への無料カウンセリングを予約しませんか？<br />
                    日本語で丁寧に対応いたします。
                </p>
                <div className={styles.ctaButtons}>
                    <button className={styles.bookBtn} onClick={() => setShowModal(true)}>
                        予約フォームを開く
                    </button>
                    <a
                        href="https://line.me/R/ti/p/@aureum"
                        target="_blank"
                        rel="noopener noreferrer"
                        className={styles.lineBtn}
                    >
                        💬 LINEで相談する
                    </a>
                </div>
            </div>

            {/* Booking Modal */}
            {showModal && (
                <div className={styles.overlay} onClick={() => !loading && setShowModal(false)}>
                    <div className={styles.modal} onClick={e => e.stopPropagation()}>
                        <button className={styles.closeBtn} onClick={() => setShowModal(false)}>×</button>
                        {submitted ? (
                            <div className={styles.successContent}>
                                <div className={styles.successIcon}>✅</div>
                                <h3>予約リクエストを送信しました！</h3>
                                <p>24時間以内にスタッフからご連絡いたします。</p>
                                <button className={styles.doneBtn} onClick={() => { setShowModal(false); setSubmitted(false); }}>
                                    閉じる
                                </button>
                            </div>
                        ) : (
                            <>
                                <h3 className={styles.modalTitle}>
                                    {hospitalName} — 無料カウンセリング予約
                                </h3>
                                <form onSubmit={handleSubmit} className={styles.form}>
                                    <div className={styles.field}>
                                        <label>お名前 *</label>
                                        <input
                                            type="text"
                                            required
                                            placeholder="例: 田中 優希"
                                            value={form.name}
                                            onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                                        />
                                    </div>
                                    <div className={styles.field}>
                                        <label>連絡先 (LINE ID / メール) *</label>
                                        <input
                                            type="text"
                                            required
                                            placeholder="例: yuki_tanaka"
                                            value={form.contact}
                                            onChange={e => setForm(p => ({ ...p, contact: e.target.value }))}
                                        />
                                    </div>
                                    <div className={styles.field}>
                                        <label>希望施術</label>
                                        <input
                                            type="text"
                                            placeholder="例: ピコトーニング"
                                            value={form.treatment}
                                            onChange={e => setForm(p => ({ ...p, treatment: e.target.value }))}
                                        />
                                    </div>
                                    <div className={styles.field}>
                                        <label>希望日時</label>
                                        <input
                                            type="date"
                                            value={form.date}
                                            onChange={e => setForm(p => ({ ...p, date: e.target.value }))}
                                        />
                                    </div>
                                    <div className={styles.field}>
                                        <label>メッセージ</label>
                                        <textarea
                                            placeholder="気になる点やご質問をどうぞ..."
                                            value={form.message}
                                            onChange={e => setForm(p => ({ ...p, message: e.target.value }))}
                                        />
                                    </div>
                                    <button type="submit" className={styles.submitBtn} disabled={loading}>
                                        {loading ? '送信中...' : '予約リクエストを送信'}
                                    </button>
                                </form>
                            </>
                        )}
                    </div>
                </div>
            )}
        </section>
    );
}
