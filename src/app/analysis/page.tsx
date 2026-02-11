'use client';

import { useState } from 'react';
import Image from 'next/image';
import Yuna from '@/components/Yuna';
import styles from './analysis.module.css';

export default function AnalysisPage() {
    const [image, setImage] = useState<string | null>(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [result, setResult] = useState<any>(null);

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setImage(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const startAnalysis = async () => {
        if (!image) return;
        setIsAnalyzing(true);

        try {
            // API call to the Vision analysis route
            const res = await fetch('/api/vision', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ image })
            });
            const data = await res.json();
            setResult(data);
        } catch (error) {
            console.error('Analysis error:', error);
        } finally {
            setIsAnalyzing(false);
        }
    };

    return (
        <div className={styles.container}>
            <h1 className={styles.title}>AI精密フェイシャル診断</h1>

            {!image && (
                <div className={styles.uploadBox} onClick={() => document.getElementById('file-input')?.click()}>
                    <span className={styles.icon}>📸</span>
                    <p className={styles.uploadText}>顔写真をアップロード</p>
                    <p className={styles.hintText}>正面から明るい場所で撮影してください</p>
                    <input
                        id="file-input"
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        style={{ display: 'none' }}
                    />
                </div>
            )}

            {image && !result && !isAnalyzing && (
                <div className={styles.previewContainer}>
                    <img src={image} alt="Preview" className={styles.previewImage} />
                    <button className={styles.analyzeBtn} onClick={startAnalysis}>
                        AI分析を開始する
                    </button>
                    <button
                        onClick={() => setImage(null)}
                        style={{ background: 'none', border: 'none', marginTop: '1rem', color: '#888', cursor: 'pointer' }}
                    >
                        写真を変更する
                    </button>
                </div>
            )}

            {isAnalyzing && (
                <div className={styles.loadingOverlay}>
                    <div className={styles.spinner}></div>
                    <p>AIがあなたのお顔を詳しく分析中です...</p>
                </div>
            )}

            {result && (
                <div className={styles.resultArea}>
                    <Yuna message="分析が完了しました！あなたの魅力を最大限に引き出すプランはこちらです。" />

                    <h2 className={styles.resultTitle}>診断レポート</h2>

                    <ul className={styles.analysisList}>
                        <li className={styles.analysisItem}>
                            <span className={styles.analysisLabel}>肌の状態</span>
                            <span className={styles.analysisValue}>{result.skinCondition || '良好ですが、乾燥が少し見受けられます。'}</span>
                        </li>
                        <li className={styles.analysisItem}>
                            <span className={styles.analysisLabel}>顔立ちの特徴</span>
                            <span className={styles.analysisValue}>{result.facialFeatures || 'シャープなフェイスラインが魅力的です。'}</span>
                        </li>
                        <li className={styles.analysisItem}>
                            <span className={styles.analysisLabel}>おすすめの施術</span>
                            <span className={styles.analysisValue}>{result.recommendation || '弾力改善のためのシュリンク・ユニバースをおすすめします。'}</span>
                        </li>
                    </ul>

                    <a href="/survey" className={styles.analyzeBtn} style={{ display: 'block', textDecoration: 'none', textAlign: 'center' }}>
                        詳細なアンケートへ
                    </a>
                </div>
            )}
        </div>
    );
}
