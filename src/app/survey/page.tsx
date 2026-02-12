'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import styles from './survey.module.css';

interface SurveyData {
    ageGroup: string;
    skinType: string;
    concerns: string[]; // Multi-select
    budget: string;
    downtime: string;
}

const QUESTIONS = {
    ageGroup: ['20代', '30代', '40代', '50代以上'],
    skinType: ['乾燥肌 (Dry)', '脂性肌 (Oily)', '混合肌 (Combi)', '敏感肌 (Sensitive)'],
    concerns: ['たるみ/弾力 (Sagging)', 'シワ (Wrinkles)', '毛穴/傷跡 (Pores)', 'シミ/肝斑 (Pigment)', 'ニキビ (Acne)'],
    budget: ['実用重視 (<30万ウォン)', '標準 (30~100万ウォン)', 'プレミアム (100万ウォン+)'],
    downtime: ['全くなし', '2-3日可能', '1週間可能']
};

function SurveyForm() {
    const router = useRouter();
    const searchParams = useSearchParams();

    // Auto-fill from Analysis
    const [data, setData] = useState<SurveyData>({
        ageGroup: searchParams.get('age') || '',
        skinType: '',
        concerns: searchParams.get('concerns') ? [searchParams.get('concerns')!] : [],
        budget: '',
        downtime: ''
    });

    const handleSelect = (key: keyof SurveyData, value: string) => {
        if (key === 'concerns') {
            setData(prev => {
                const current = prev.concerns;
                if (current.includes(value)) {
                    return { ...prev, concerns: current.filter(c => c !== value) };
                } else {
                    return { ...prev, concerns: [...current, value] };
                }
            });
        } else {
            setData(prev => ({ ...prev, [key]: value }));
        }
    };

    const isFormValid = data.ageGroup && data.skinType && data.concerns.length > 0 && data.budget && data.downtime;

    const handleSubmit = () => {
        if (!isFormValid) return;

        // Pass data via query params for MVP simplicity
        const query = new URLSearchParams({
            age: data.ageGroup,
            skin: data.skinType,
            concerns: data.concerns.join(','),
            budget: data.budget,
            downtime: data.downtime
        }).toString();

        router.push(`/result?${query}`);
    };

    return (
        <div className={styles.container}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1.5rem' }}>
                <button
                    onClick={() => router.back()}
                    style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', padding: '10px' }}
                >
                    &larr;
                </button>
                <h1 className={styles.title} style={{ margin: 0, flex: 1, textAlign: 'center' }}>ビューティー自己診断</h1>
            </div>

            {/* 1. Age Group */}
            <section className={styles.questionCard}>
                <label className={styles.questionLabel}>1. 年齢層は？</label>
                <div className={styles.optionsGrid}>
                    {QUESTIONS.ageGroup.map(opt => (
                        <div
                            key={opt}
                            className={`${styles.optionButton} ${data.ageGroup === opt ? styles.selected : ''}`}
                            onClick={() => handleSelect('ageGroup', opt)}
                        >
                            {opt}
                        </div>
                    ))}
                </div>
            </section>

            {/* 2. Skin Type */}
            <section className={styles.questionCard}>
                <label className={styles.questionLabel}>2. 肌タイプは？</label>
                <div className={styles.optionsGrid}>
                    {QUESTIONS.skinType.map(opt => (
                        <div
                            key={opt}
                            className={`${styles.optionButton} ${data.skinType === opt ? styles.selected : ''}`}
                            onClick={() => handleSelect('skinType', opt)}
                        >
                            {opt}
                        </div>
                    ))}
                </div>
            </section>

            {/* 3. Concerns (Multi) */}
            <section className={styles.questionCard}>
                <label className={styles.questionLabel}>3. 最も気になる悩みは？ (複数選択可)</label>
                <div className={styles.optionsGrid}>
                    {QUESTIONS.concerns.map(opt => (
                        <div
                            key={opt}
                            className={`${styles.optionButton} ${data.concerns.includes(opt) ? styles.selected : ''}`}
                            onClick={() => handleSelect('concerns', opt)}
                        >
                            {opt}
                        </div>
                    ))}
                </div>
            </section>

            {/* 4. Budget */}
            <section className={styles.questionCard}>
                <label className={styles.questionLabel}>4. ご予算は？</label>
                <div className={styles.optionsGrid}>
                    {QUESTIONS.budget.map(opt => (
                        <div
                            key={opt}
                            className={`${styles.optionButton} ${data.budget === opt ? styles.selected : ''}`}
                            onClick={() => handleSelect('budget', opt)}
                        >
                            {opt}
                        </div>
                    ))}
                </div>
            </section>

            {/* 5. Downtime */}
            <section className={styles.questionCard}>
                <label className={styles.questionLabel}>5. 回復期間（ダウンタイム）の許容範囲は？</label>
                <div className={styles.optionsGrid}>
                    {QUESTIONS.downtime.map(opt => (
                        <div
                            key={opt}
                            className={`${styles.optionButton} ${data.downtime === opt ? styles.selected : ''}`}
                            onClick={() => handleSelect('downtime', opt)}
                        >
                            {opt}
                        </div>
                    ))}
                </div>
            </section>

            <button
                className={styles.submitButton}
                disabled={!isFormValid}
                onClick={handleSubmit}
            >
                診断結果を見る
            </button>
        </div>
    );
}

import { Suspense } from 'react';

export default function SurveyPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <SurveyForm />
        </Suspense>
    );
}
