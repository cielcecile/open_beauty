'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
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
            const res = await fetch('/api/vision', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ image })
            });

            if (!res.ok) throw new Error('API request failed');

            const data = await res.json();
            setResult(data);
        } catch (error) {
            console.error('Analysis error:', error);
            alert('分析中にエラーが発生しました。もう一度試してください。');
        } finally {
            setIsAnalyzing(false);
        }
    };

    const shareToSns = (platform: string) => {
        const url = window.location.href;
        const text = `Aureum AIビューティー診断結果：私は「${result?.faceType}」タイプと分析されました！`;

        switch (platform) {
            case 'line':
                window.open(`https://social-plugins.line.me/lineit/share?url=${encodeURIComponent(url)}`);
                break;
            case 'x':
                window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`);
                break;
            case 'instagram':
                alert('画像を保存してInstagramストーリーに共有してみましょう！');
                break;
        }
    };

    return (
        <div className={styles.container}>
            <h1 className={styles.title}>AI精密写真分析</h1>

            {!image && (
                <div className={styles.uploadBox} onClick={() => document.getElementById('file-input')?.click()}>
                    <span className={styles.icon}>📸</span>
                    <p className={styles.uploadText}>分析する写真をアップロード</p>
                    <p className={styles.hintText}>正面から明るい照明の下で撮影してください</p>
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
                        写真を撮り直す
                    </button>
                </div>
            )}

            {isAnalyzing && (
                <div className={styles.loadingOverlay}>
                    <div className={styles.spinner}></div>
                    <p>AIがあなたの美しさを分析しています...</p>
                </div>
            )}

            {result && (
                <div className={styles.resultArea}>
                    <Yuna message={`分析が完了しました！${result.faceType}のあなた、とても魅力的ですね！`} />

                    <div className={styles.resultHeader}>
                        <span className={styles.faceTypeBadge}>{result.faceType}</span>
                        <h2 className={styles.resultTitle}>あなただけのビューティーレポート</h2>
                    </div>

                    <div className={styles.scoreCardGrid}>
                        <div className={styles.scoreCard}>
                            <span className={styles.scoreValue}>{result.facialBalance?.symmetryScore}%</span>
                            <span className={styles.scoreLabel}>顔の対称スコア</span>
                        </div>
                        <div className={styles.scoreCard}>
                            <span className={styles.scoreValue}>{result.facialBalance?.goldenRatioMatch}</span>
                            <span className={styles.scoreLabel}>黄金比の一致度</span>
                        </div>
                    </div>

                    <div className={styles.ageComparison}>
                        <p className={styles.ageText}>平均的なシワと弾力に基づく</p>
                        <p className={styles.ageText}>
                            予想肌年齢: <span className={styles.ageHighlight}>満 {result.skinAge?.apparentAge}歳</span>
                        </p>

                    </div>

                    <div className={styles.detailSection}>
                        <h3 className={styles.sectionTitle}>⚖️ バランス診断</h3>
                        <div className={styles.adviceBox}>{result.facialBalance?.balanceStatus}</div>
                    </div>

                    <div className={styles.detailSection}>
                        <h3 className={styles.sectionTitle}>✨ 専門家コメント</h3>
                        <div className={styles.adviceBox}>{result.facialBalance?.advice}</div>
                    </div>

                    <div className={styles.detailSection}>
                        <h3 className={styles.sectionTitle}>🏥 おすすめの施術プラン</h3>
                        <div className={styles.adviceBox}>{result.skinAge?.recommendation}</div>
                    </div>

                    <div className={styles.shareArea}>
                        <p className={styles.shareTitle}>結果を共有して友達と比較してみる</p>
                        <div className={styles.shareButtons}>
                            <button className={styles.shareBtn} onClick={() => shareToSns('line')} title="LINE">🟢</button>
                            <button className={styles.shareBtn} onClick={() => shareToSns('instagram')} title="Instagram">📸</button>
                            <button className={styles.shareBtn} onClick={() => shareToSns('x')} title="X (Twitter)">🐦</button>
                        </div>
                    </div>

                    <div className={styles.btnGroup}>
                        <Link
                            href={{
                                pathname: '/survey',
                                query: {
                                    analyzed: 'true',
                                    age: result.skinAge?.apparentAge ? `${Math.floor(result.skinAge.apparentAge / 10) * 10}代` : undefined,
                                    concerns: result.facialBalance?.advice.includes('ボリューム') ? 'たるみ/弾力 (Sagging)' : undefined
                                }
                            }}
                            className={styles.analyzeBtn}
                            style={{ textDecoration: 'none', textAlign: 'center' }}
                        >
                            自分に合ったクリニックのおすすめを受ける
                        </Link>
                        <button
                            onClick={() => { setResult(null); setImage(null); }}
                            style={{ background: 'none', border: 'none', color: '#888', cursor: 'pointer', fontSize: '0.9rem', marginTop: '1rem' }}
                        >
                            もう一度分析する
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
