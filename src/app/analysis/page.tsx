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
            alert('분석 중 오류가 발생했습니다. 다시 시도해 주세요.');
        } finally {
            setIsAnalyzing(false);
        }
    };

    const shareToSns = (platform: string) => {
        const url = window.location.href;
        const text = `Aureum AI 뷰티 진단 결과: 저는 '${result?.faceType}' 타입으로 분석되었어요!`;

        switch (platform) {
            case 'line':
                window.open(`https://social-plugins.line.me/lineit/share?url=${encodeURIComponent(url)}`);
                break;
            case 'x':
                window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`);
                break;
            case 'instagram':
                alert('이미지를 저장하여 인스타그램 스토리에 공유해보세요!');
                break;
        }
    };

    return (
        <div className={styles.container}>
            <h1 className={styles.title}>AI 정밀 사진 분석</h1>

            {!image && (
                <div className={styles.uploadBox} onClick={() => document.getElementById('file-input')?.click()}>
                    <span className={styles.icon}>📸</span>
                    <p className={styles.uploadText}>분석할 사진 업로드</p>
                    <p className={styles.hintText}>정면에서 밝은 조명 아래 촬영해 주세요</p>
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
                        AI 분석 시작하기
                    </button>
                    <button
                        onClick={() => setImage(null)}
                        style={{ background: 'none', border: 'none', marginTop: '1rem', color: '#888', cursor: 'pointer' }}
                    >
                        사진 다시 찍기
                    </button>
                </div>
            )}

            {isAnalyzing && (
                <div className={styles.loadingOverlay}>
                    <div className={styles.spinner}></div>
                    <p>AI가 당신의 아름다움을 분석 중입니다...</p>
                </div>
            )}

            {result && (
                <div className={styles.resultArea}>
                    <Yuna message={`분석이 완료되었습니다! ${result.faceType}인 당신, 정말 매력적이시네요!`} />

                    <div className={styles.resultHeader}>
                        <span className={styles.faceTypeBadge}>{result.faceType}</span>
                        <h2 className={styles.resultTitle}>당신만을 위한 뷰티 리포트</h2>
                    </div>

                    <div className={styles.scoreCardGrid}>
                        <div className={styles.scoreCard}>
                            <span className={styles.scoreValue}>{result.facialBalance?.symmetryScore}%</span>
                            <span className={styles.scoreLabel}>얼굴 대칭 점수</span>
                        </div>
                        <div className={styles.scoreCard}>
                            <span className={styles.scoreValue}>{result.facialBalance?.goldenRatioMatch}</span>
                            <span className={styles.scoreLabel}>황금비율 일치도</span>
                        </div>
                    </div>

                    <div className={styles.ageComparison}>
                        <p className={styles.ageText}>평균 주름 및 탄력 기반</p>
                        <p className={styles.ageText}>
                            예상 피부 나이: <span className={styles.ageHighlight}>만 {result.skinAge?.apparentAge}세</span>
                        </p>
                        <p style={{ fontSize: '0.85rem', color: '#666', marginTop: '0.5rem' }}>
                            (실제 나이보다 {(result.skinAge?.actualAge || 0) - (result.skinAge?.apparentAge || 0)}살 더 어려 보여요!)
                        </p>
                    </div>

                    <div className={styles.detailSection}>
                        <h3 className={styles.sectionTitle}>⚖️ 밸런스 진단</h3>
                        <div className={styles.adviceBox}>{result.facialBalance?.balanceStatus}</div>
                    </div>

                    <div className={styles.detailSection}>
                        <h3 className={styles.sectionTitle}>✨ 전문가 코멘트</h3>
                        <div className={styles.adviceBox}>{result.facialBalance?.advice}</div>
                    </div>

                    <div className={styles.detailSection}>
                        <h3 className={styles.sectionTitle}>🏥 추천 시술 플랜</h3>
                        <div className={styles.adviceBox}>{result.skinAge?.recommendation}</div>
                    </div>

                    <div className={styles.shareArea}>
                        <p className={styles.shareTitle}>결과 공유하고 친구들과 비교해보기</p>
                        <div className={styles.shareButtons}>
                            <button className={styles.shareBtn} onClick={() => shareToSns('line')} title="라인">🟢</button>
                            <button className={styles.shareBtn} onClick={() => shareToSns('instagram')} title="인스타그램">📸</button>
                            <button className={styles.shareBtn} onClick={() => shareToSns('x')} title="X (트위터)">🐦</button>
                        </div>
                    </div>

                    <div className={styles.btnGroup}>
                        <a href="/survey" className={styles.analyzeBtn} style={{ textDecoration: 'none', textAlign: 'center' }}>
                            맞춤형 병원 추천받기
                        </a>
                        <button
                            onClick={() => { setResult(null); setImage(null); }}
                            style={{ background: 'none', border: 'none', color: '#888', cursor: 'pointer', fontSize: '0.9rem', marginTop: '1rem' }}
                        >
                            다시 분석하기
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
