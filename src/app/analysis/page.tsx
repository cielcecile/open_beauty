'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Radar } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    RadialLinearScale,
    PointElement,
    LineElement,
    Filler,
    Tooltip,
    Legend,
} from 'chart.js';
import html2canvas from 'html2canvas';

import Image from 'next/image';
import Yuna from '@/components/Yuna';
import styles from './analysis.module.css';

// Chart Registration
ChartJS.register(
    RadialLinearScale,
    PointElement,
    LineElement,
    Filler,
    Tooltip,
    Legend
);

// --- Data & Helpers ---

const SURVEY_QUESTIONS = {
    ageGroup: ['20代', '30代', '40代', '50代以上'],
    skinType: ['乾燥肌 (Dry)', '脂性肌 (Oily)', '混合肌 (Combi)', '敏感肌 (Sensitive)'],
    concerns: ['たるみ/弾力', 'シワ', '毛穴/傷跡', 'シミ/肝斑', 'ニキビ'],
    budget: ['実用重視 (<30万ウォン)', '標準 (30~100万ウォン)', 'プレミアム (100万ウォン+)'],
    downtime: ['全くなし', '2-3日可能', '1週間可能']
};

// Treatment Descriptions
const TREATMENTS_DESC: { [key: string]: string } = {
    'たるみ/弾力': 'オリジオ (Oligio): 強力な高周波で即時的なリフトアップ効果\nシュリンクユニバース: 超音波でフェイスラインを引き締め',
    'シワ': 'ボトックス: 表情ジワの改善\nフィラー: 深いシワのボリューム改善',
    '毛穴/傷跡': 'ジュベルック: コラーゲン生成を促進し毛穴を縮小\nポテンツァ: マイクロニードルで肌質改善',
    'シミ/肝斑': 'ピコトーニング: シミを薄くし肌のトーンアップ\n美白点滴: 体の内側から輝く肌へ',
    'ニキビ': 'アグネス: 繰り返すニキビの根源を破壊\nPDT治療: 皮脂分泌を抑制'
};

const CLINICS = [
    { id: 1, name: 'アウルムクリニック', rating: 4.9, desc: 'ソウル大出身、プレミアム1:1管理' },
    { id: 2, name: 'リエンジャン美容外科', rating: 4.8, desc: 'リーズナブルで外国人対応も完璧' }
];

export default function AnalysisPage() {
    const router = useRouter();
    const [step, setStep] = useState<'ENTRY' | 'UPLOAD' | 'SURVEY' | 'ANALYZING' | 'RESULT'>('ENTRY');

    // State
    const [image, setImage] = useState<string | null>(null);
    type SurveyData = {
        ageGroup: string;
        skinType: string;
        concerns: string[];
        budget: string;
        downtime: string;
    };

    type AnalysisResult = { faceType: string; skinAge?: { apparentAge: number } } | null;

    const [analysisResult, setAnalysisResult] = useState<AnalysisResult>(null);
    const [surveyData, setSurveyData] = useState<SurveyData>({
        ageGroup: '',
        skinType: '',
        concerns: [],
        budget: '',
        downtime: ''
    });

    // Mock Scores
    const [scores, setScores] = useState([0, 0, 0, 0, 0]);

    // Handlers
    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setImage(reader.result as string);
                setStep('SURVEY');
            };
            reader.readAsDataURL(file);
        }
    };

    const handleNoPhoto = () => {
        setImage(null);
        setStep('SURVEY');
    };

    const handleSurveySelect = (key: keyof SurveyData, value: string) => {
        if (key === 'concerns') {
            setSurveyData(prev => {
                const current = prev.concerns;
                if (current.includes(value)) return { ...prev, concerns: current.filter(c => c !== value) };
                return { ...prev, concerns: [...current, value] };
            });
        } else {
            setSurveyData(prev => ({ ...(prev as SurveyData), [key]: value } as SurveyData));
        }
    };

    const startComprehensiveAnalysis = async () => {
        setStep('ANALYZING');
        // Logic remains same...
        const baseScores = [85, 80, 75, 80, 85];
        if (surveyData.concerns.includes('たるみ/弾力')) baseScores[1] -= 20;
        if (surveyData.concerns.includes('毛穴/傷跡')) baseScores[2] -= 25;
        if (surveyData.concerns.includes('シミ/肝斑')) baseScores[3] -= 20;
        if (surveyData.concerns.includes('シワ')) baseScores[4] -= 20;
        setScores(baseScores);

        setTimeout(() => {
            setAnalysisResult({ faceType: 'ナチュラル', skinAge: { apparentAge: 25 } });
            setStep('RESULT');
        }, 2500);
    };

    // Save as Image
    const handleDownloadImage = async () => {
        const element = document.getElementById('result-content');
        if (!element) return;

        // Ensure the page is scrolled to top for accurate capture origin
        window.scrollTo(0, 0);

        try {
            const canvas = await html2canvas(element, {
                useCORS: true,
                scale: 2,
                scrollX: 0,
                scrollY: 0,
                x: 0, // Force X origin to 0
                y: 0, // Force Y origin to 0
                backgroundColor: '#ffffff',
                width: element.offsetWidth,
                height: element.offsetHeight,
                logging: false,
                onclone: (clonedDoc) => {
                    const clonedElement = clonedDoc.getElementById('result-content');
                    if (clonedElement && element) {
                        clonedElement.style.margin = '0 auto';
                        clonedElement.style.padding = '40px 30px';
                        clonedElement.style.width = '550px';
                        clonedElement.style.display = 'block';

                        clonedDoc.body.style.display = 'flex';
                        clonedDoc.body.style.justifyContent = 'center';
                        clonedDoc.body.classList.add('no-animation');

                        // Remove any potential fixed/absolute elements that might overlap
                        const fixedElements = clonedDoc.querySelectorAll('[style*="position: fixed"]');
                        fixedElements.forEach(el => (el as HTMLElement).style.display = 'none');
                    }
                }
            });
            const dataUrl = canvas.toDataURL('image/png');
            const link = document.createElement('a');
            link.href = dataUrl;
            link.download = 'aureum-analysis-result.png';
            link.click();
        } catch (err) {
            console.error('Failed to save image:', err);
            alert('画像の保存に失敗しました。');
        }
    };

    // Save to Wishlist (Mock)
    const handleAddToWishlist = (clinicName: string) => {
        // Needs integration with store/context
        alert(`「${clinicName}」をマイ病院リストに保存しました💖\nマイページで確認できます！`);
    };

    // --- Renderers ---
    // (Entry, Upload, Survey, Loading remain largely similar but using updated CSS classes implicitly via module)

    // Simplified for brevity, focusing on RESULT changes

    const renderResult = () => (
        <div className={styles.container}>
            <div id="result-content" className={styles.resultArea} style={{ marginTop: 0, background: '#fff' }}>
                {/* Header */}
                <h2 style={{ textAlign: 'center', fontSize: '1.4rem', marginBottom: '1.5rem', color: '#333' }}>
                    あなたは <span style={{ color: '#d4a373', fontSize: '1.6rem', borderBottom: '2px solid #d4a373' }}>{analysisResult?.faceType || 'ナチュラル'}</span> タイプのお顔です！
                </h2>

                <Yuna
                    message={`${analysisResult?.faceType}タイプですね！全体的に魅力的ですが、いくつかの数値を改善するとさらに美しくなります。`}
                />

                {image && (
                    <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                        <div style={{ display: 'inline-block', position: 'relative', borderRadius: '12px', overflow: 'hidden', border: '3px solid #eee', width: 120, height: 120 }}>
                            <Image src={image} alt="Analyzed" width={120} height={120} style={{ objectFit: 'cover', display: 'block', borderRadius: 12 }} unoptimized />
                            <div style={{ position: 'absolute', bottom: 0, right: 0, background: 'rgba(51,51,51,0.8)', color: 'white', fontSize: '0.6rem', padding: '2px 6px', borderTopLeftRadius: '6px' }}>Analyzed</div>
                        </div>
                    </div>
                )}

                <div className={styles.resultHeader}>
                    <h3 className={styles.resultTitle} style={{ marginTop: '0.5rem' }}>
                        <span style={{ display: 'block', fontSize: '1.8rem', marginBottom: '0.5rem', color: '#d4a373' }}>
                            {analysisResult?.faceType}
                        </span>
                        <span style={{ display: 'block', fontSize: '1.1rem', fontWeight: 'bold' }}>
                            総合ビューティーレポート
                        </span>
                    </h3>
                    <p style={{ fontSize: '0.8rem', color: '#999', marginTop: '0.5rem' }}>※ 写真診断は撮影環境により誤差が生じる場合があります。</p>
                </div>

                {/* Radar Chart */}
                <div style={{ margin: '1rem auto', height: '300px', width: '100%', maxWidth: '500px', position: 'relative' }}>
                    <Radar
                        data={{
                            labels: ['水分', '弾力', '毛穴', '色素', 'シワ'],
                            datasets: [{
                                label: 'あなたのスコア',
                                data: scores,
                                backgroundColor: 'rgba(212, 163, 115, 0.2)',
                                borderColor: '#d4a373',
                                borderWidth: 2,
                                pointBackgroundColor: scores.map(s => s < 80 ? '#FF6B6B' : '#d4a373'),
                                pointRadius: 4
                            }]
                        }}
                        options={{ maintainAspectRatio: false, scales: { r: { min: 0, max: 100 } } }}
                    />
                </div>

                {/* Score Table */}
                <div style={{ background: '#fcfcfc', padding: '1rem', borderRadius: '8px', border: '1px solid #eee', marginBottom: '2rem' }}>
                    <h4 style={{ textAlign: 'center', marginBottom: '1rem', fontSize: '0.95rem' }}>📊 肌ステータス詳細</h4>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.8rem', fontSize: '0.9rem' }}>
                        {['水分', '弾力', '毛穴', '色素', 'シワ'].map((label, i) => (
                            <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem', borderBottom: '1px dashed #eee' }}>
                                <span>{label}</span>
                                <span style={{ fontWeight: 'bold', color: scores[i] < 80 ? '#e53e3e' : '#333' }}>
                                    {scores[i]}点 {scores[i] < 80 && '⚠️'}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Treatments */}
                <div className={styles.detailSection} style={{ background: '#fffaf0', border: '1px solid #eddcd2' }}>
                    <h3 className={styles.sectionTitle} style={{ color: '#d4a373' }}>💉 おすすめの施術ソリューション</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {surveyData.concerns.length > 0 ? surveyData.concerns.map(c => (
                            <div key={c} style={{ background: 'white', padding: '1rem', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                                <strong style={{ color: '#e53e3e', fontSize: '0.9rem', display: 'block', marginBottom: '0.3rem' }}>悩み: {c}</strong>
                                <p style={{ fontSize: '0.85rem', whiteSpace: 'pre-line', color: '#555', lineHeight: 1.6 }}>
                                    {TREATMENTS_DESC[c] || '専門医との相談をおすすめします。'}
                                </p>
                            </div>
                        )) : (
                            <p>特に悩みがない場合でも、定期的な肌管理（アクアピーリングなど）がおすすめです。</p>
                        )}
                    </div>
                </div>

                {/* Clinics with Heart Button */}
                <div className={styles.detailSection}>
                    <h3 className={styles.sectionTitle}>🏆 施術におすすめの病院</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                        {CLINICS.map(clinic => (
                            <div key={clinic.id} style={{ border: '1px solid #eee', padding: '1rem', borderRadius: '8px', background: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        <strong>{clinic.name}</strong>
                                        <span style={{ color: '#ff6b6b', fontSize: '0.8rem' }}>★ {clinic.rating}</span>
                                    </div>
                                    <p style={{ fontSize: '0.8rem', color: '#666', marginTop: '0.2rem' }}>{clinic.desc}</p>
                                </div>
                                <button
                                    onClick={() => handleAddToWishlist(clinic.name)}
                                    style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: '#ff6b6b' }}
                                    title="マイ病院リストに保存"
                                >
                                    ❤️
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Action Buttons */}
            {/* Action Buttons */}
            <div style={{ marginTop: '1.5rem', display: 'flex', gap: '0.6rem', justifyContent: 'space-between' }}>
                {/* Save Image (Left) */}
                <button
                    onClick={handleDownloadImage}
                    style={{
                        flex: 1,
                        padding: '1rem 0.5rem',
                        background: 'white',
                        color: '#333',
                        border: '1px solid #ddd',
                        borderRadius: '8px',
                        fontWeight: 'bold',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.3rem',
                        fontSize: '0.85rem',
                        whiteSpace: 'nowrap'
                    }}
                >
                    <span>📥</span> 画像として保存
                </button>

                {/* Save Report (Right) */}
                <button
                    onClick={() => {
                        const newReport = {
                            id: Date.now(),
                            date: new Date().toLocaleDateString(),
                            faceType: analysisResult?.faceType || 'ナチュラル',
                            skinAge: analysisResult?.skinAge?.apparentAge || 25,
                            highlight: surveyData.concerns[0] || 'なし',
                            score: scores.reduce((a, b) => a + b, 0) / scores.length
                        };

                        const existing = JSON.parse(localStorage.getItem('analysis_history') || '[]');
                        localStorage.setItem('analysis_history', JSON.stringify([newReport, ...existing]));
                        alert('レポートを保存しました！マイページで確認できます。');
                    }}
                    style={{
                        flex: 1,
                        padding: '1rem 0.5rem',
                        background: '#333',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        fontWeight: 'bold',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.3rem',
                        fontSize: '0.85rem',
                        whiteSpace: 'nowrap'
                    }}
                >
                    <span>💾</span> レポートを保存
                </button>
            </div>

            <div style={{ marginTop: '1rem' }}>
                <Link href="/packages" style={{
                    display: 'block',
                    padding: '1rem',
                    background: 'linear-gradient(90deg, #d4a373, #e1c05e)',
                    color: 'white',
                    fontWeight: 'bold',
                    borderRadius: '8px',
                    textDecoration: 'none',
                    textAlign: 'center',
                    boxShadow: '0 4px 10px rgba(212, 163, 115, 0.3)'
                }}>
                    ✈️ おすすめの韓国美容旅行プランを見る
                </Link>
            </div>

            <div style={{ textAlign: 'center', marginTop: '2rem' }}>
                <button onClick={() => { setStep('ENTRY'); setImage(null); }} style={{ background: 'none', border: 'none', color: '#888', textDecoration: 'underline' }}>
                    ホームに戻る
                </button>
            </div>
        </div>
    );

    // Re-implement Renderers for previous steps to keep file consistent
    const renderEntry = () => (
        <div className={styles.container}>
            <h1 className={styles.title}>AI総合ビューティー診断</h1>
            <p style={{ textAlign: 'center', marginBottom: '2rem', color: '#666' }}>
                あなたの写真を分析するか、<br />アンケートのみで診断するか選んでください。
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <button className={styles.uploadBox} onClick={() => setStep('UPLOAD')} style={{ padding: '2rem', background: '#333', color: 'white', border: 'none', marginBottom: 0 }}>
                    <span style={{ fontSize: '2rem', display: 'block', marginBottom: '0.5rem' }}>📸</span>
                    <strong>写真をアップロードして精密診断</strong>
                    <div style={{ fontSize: '0.8rem', opacity: 0.8, marginTop: '0.5rem' }}>AIが肌状態と顔のバランスを分析します</div>
                </button>
                <button className={styles.uploadBox} onClick={handleNoPhoto} style={{ padding: '1.5rem', background: 'white', color: '#333', border: '1px solid #ddd', marginBottom: 0 }}>
                    <span style={{ fontSize: '1.5rem', display: 'block', marginBottom: '0.5rem' }}>📝</span>
                    <strong>写真なしでクイック診断</strong>
                    <div style={{ fontSize: '0.8rem', color: '#888', marginTop: '0.5rem' }}>アンケートのみでタイプを診断します</div>
                </button>
            </div>
            <div style={{ textAlign: 'center', marginTop: '2rem' }}>
                <button onClick={() => router.back()} style={{ background: 'none', border: 'none', color: '#888', textDecoration: 'underline' }}>
                    前のページに戻る
                </button>
            </div>
        </div>
    );

    const renderUpload = () => (
        <div className={styles.container}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1rem' }}>
                <button
                    onClick={() => setStep('ENTRY')}
                    style={{ background: 'none', border: 'none', fontSize: '1.2rem', cursor: 'pointer', padding: '0.5rem' }}
                >
                    &larr;
                </button>
                <h1 className={styles.title} style={{ margin: 0, flex: 1, textAlign: 'center' }}>写真アップロード</h1>
            </div>
            <div className={styles.uploadBox} onClick={() => document.getElementById('file-input')?.click()}>
                <span className={styles.icon}>📸</span>
                <p className={styles.uploadText}>分析する写真をアップロード</p>
                <p className={styles.hintText}>正面から明るい照明の下で撮影してください</p>
                <input id="file-input" type="file" accept="image/*" onChange={handleImageUpload} style={{ display: 'none' }} />
            </div>
        </div>
    );

    const renderSurvey = () => (
        <div className={styles.container}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1rem' }}>
                <button
                    onClick={() => setStep(image ? 'UPLOAD' : 'ENTRY')}
                    style={{ background: 'none', border: 'none', fontSize: '1.2rem', cursor: 'pointer', padding: '0.5rem' }}
                >
                    &larr;
                </button>
                <h1 className={styles.title} style={{ margin: 0, flex: 1, textAlign: 'center', fontSize: '1.4rem' }}>基本情報を教えてください</h1>
            </div>
            {image && <Image src={image} alt="uploaded" width={60} height={60} style={{ borderRadius: '50%', objectFit: 'cover', margin: '0 auto 1.5rem auto', display: 'block', border: '2px solid #d4a373' }} unoptimized />}
            <div className={styles.surveyContainer}>
                {/* Survey content same as before ... */}
                <div style={{ marginBottom: '1.5rem' }}>
                    <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '0.5rem' }}>1. 年齢層</label>
                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>{SURVEY_QUESTIONS.ageGroup.map(opt => (<button key={opt} onClick={() => handleSurveySelect('ageGroup', opt)} style={{ padding: '0.5rem 1rem', borderRadius: '20px', border: '1px solid #ddd', background: surveyData.ageGroup === opt ? '#333' : 'white', color: surveyData.ageGroup === opt ? 'white' : '#333' }}>{opt}</button>))}</div>
                </div>
                <div style={{ marginBottom: '1.5rem' }}>
                    <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '0.5rem' }}>2. 肌タイプ</label>
                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>{SURVEY_QUESTIONS.skinType.map(opt => (<button key={opt} onClick={() => handleSurveySelect('skinType', opt)} style={{ padding: '0.5rem 1rem', borderRadius: '20px', border: '1px solid #ddd', background: surveyData.skinType === opt ? '#333' : 'white', color: surveyData.skinType === opt ? 'white' : '#333' }}>{opt}</button>))}</div>
                </div>
                <div style={{ marginBottom: '1.5rem' }}>
                    <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '0.5rem' }}>3. 最も気になる悩み</label>
                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>{SURVEY_QUESTIONS.concerns.map(opt => (<button key={opt} onClick={() => handleSurveySelect('concerns', opt)} style={{ padding: '0.5rem 1rem', borderRadius: '20px', border: '1px solid #ddd', background: surveyData.concerns.includes(opt) ? '#333' : 'white', color: surveyData.concerns.includes(opt) ? 'white' : '#333' }}>{opt}</button>))}</div>
                </div>
                <div style={{ marginBottom: '1.5rem' }}>
                    <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '0.5rem' }}>4. 予算プラン</label>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>{SURVEY_QUESTIONS.budget.map(opt => (<button key={opt} onClick={() => handleSurveySelect('budget', opt)} style={{ padding: '0.8rem', borderRadius: '8px', border: '1px solid #ddd', textAlign: 'left', background: surveyData.budget === opt ? '#f8f9fa' : 'white', borderLeft: surveyData.budget === opt ? '4px solid #333' : '1px solid #ddd' }}>{opt}</button>))}</div>
                </div>
                <div style={{ marginBottom: '2rem' }}>
                    <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '0.5rem' }}>5. ダウンタイム許容度</label>
                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>{SURVEY_QUESTIONS.downtime.map(opt => (<button key={opt} onClick={() => handleSurveySelect('downtime', opt)} style={{ padding: '0.5rem 1rem', borderRadius: '20px', border: '1px solid #ddd', background: surveyData.downtime === opt ? '#333' : 'white', color: surveyData.downtime === opt ? 'white' : '#333' }}>{opt}</button>))}</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                    <button className={styles.analyzeBtn} onClick={startComprehensiveAnalysis} disabled={!surveyData.ageGroup || surveyData.concerns.length === 0} style={{ opacity: (!surveyData.ageGroup || surveyData.concerns.length === 0) ? 0.5 : 1 }}>次へ（診断開始） &rarr;</button>
                </div>
            </div>
        </div>
    );

    const renderLoading = () => (
        <div className={styles.container}>
            <div className={styles.loadingOverlay}>
                <div className={styles.spinner}></div>
                <p>AI総合分析中...</p>
                <p style={{ fontSize: '0.8rem', color: '#888', marginTop: '0.5rem' }}>5つの肌指標と顔バランスを計算しています</p>
            </div>
        </div>
    );

    return (
        <>
            {step === 'ENTRY' && renderEntry()}
            {step === 'UPLOAD' && renderUpload()}
            {step === 'SURVEY' && renderSurvey()}
            {step === 'ANALYZING' && renderLoading()}
            {step === 'RESULT' && renderResult()}
        </>
    );
}

