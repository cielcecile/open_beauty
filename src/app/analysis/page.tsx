"use client";

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
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

import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import Image from 'next/image';
import Yuna from '@/components/Yuna';
import TreatmentModal from '@/components/TreatmentModal';
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
    { id: 'd1', name: 'アウルムクリニック', rating: 4.9, desc: 'ソウル大出身、プレミアム1:1管理', location: '江南・新沙', tags: ['リフトアップ', '肌管理'] },
    { id: 'p1', name: 'リエヌジャン美容外科', rating: 4.8, desc: 'リーズナブルで外国人対応も完璧', location: '江南・駅三', tags: ['ボトックス', 'フィラー'] }
];

// Mock History Data for Initial Demo (Matching MyPage)
const MOCK_HISTORY = [
    {
        id: 1,
        date: '2026-02-12',
        faceType: 'エレガントキャット',
        skinAge: { apparentAge: 25 },
        scores: [90, 85, 80, 85, 85], // High scores
        surveyData: {
            ageGroup: '20代',
            skinType: '混合肌 (Combi)',
            concerns: ['水分不足', '毛穴'],
            budget: '標準 (30~100万ウォン)',
            downtime: '2-3日可能'
        },
        analysisResult: { faceType: 'エレガントキャット', skinAge: { apparentAge: 25 } }
    },
    {
        id: 2,
        date: '2025-11-20',
        faceType: 'ナチュラル',
        skinAge: { apparentAge: 27 },
        scores: [70, 75, 70, 75, 70], // Average scores
        surveyData: {
            ageGroup: '20代',
            skinType: '乾燥肌 (Dry)',
            concerns: ['毛穴目立ち', 'くすみ'],
            budget: '標準 (30~100万ウォン)',
            downtime: '1週間可能'
        },
        analysisResult: { faceType: 'ナチュラル', skinAge: { apparentAge: 27 } }
    }
];

export default function AnalysisPage() {
    return (
        <Suspense fallback={<div style={{ padding: '2rem', textAlign: 'center' }}>読み込み中...</div>}>
            <AnalysisContent />
        </Suspense>
    );
}

function AnalysisContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { user } = useAuth(); // Auth context

    type Step = 'ENTRY' | 'UPLOAD' | 'SURVEY' | 'ANALYZING' | 'RESULT';
    type SurveyData = {
        ageGroup: string;
        skinType: string;
        concerns: string[];
        budget: string;
        downtime: string;
    };

    const [step, setStep] = useState<Step>('ENTRY');
    const [image, setImage] = useState<string | null>(null);
    type AnalysisResult = { faceType: string; skinAge?: { apparentAge: number } } | null;
    const [analysisResult, setAnalysisResult] = useState<AnalysisResult>(null);
    const [surveyData, setSurveyData] = useState<SurveyData>({
        ageGroup: '',
        skinType: '',
        concerns: [],
        budget: '',
        downtime: ''
    });
    const [scores, setScores] = useState([0, 0, 0, 0, 0]);
    const [showSaveModal, setShowSaveModal] = useState(false);
    const [showClinicModal, setShowClinicModal] = useState(false);
    const [savedClinicName, setSavedClinicName] = useState('');
    const [treatments, setTreatments] = useState<any[]>([]);
    const [recommendations, setRecommendations] = useState<any[]>([]); // AI Recommended Treatments
    const [showTreatmentModal, setShowTreatmentModal] = useState(false);
    const [selectedTreatment, setSelectedTreatment] = useState<any>(null);

    // Handlers
    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            // Check file size (limit to 5MB)
            if (file.size > 5 * 1024 * 1024) {
                alert('画像サイズが大きすぎます。5MB以下の画像を選択してください。');
                return;
            }

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

    const [aiMessage, setAiMessage] = useState<string>('');

    const startComprehensiveAnalysis = async () => {
        setStep('ANALYZING');

        try {
            // Real AI Analysis
            if (image) {
                const response = await fetch('/api/analyze', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ image }),
                });

                if (!response.ok) {
                    const errorText = await response.text();
                    let errorDetails = 'Analysis failed';
                    try {
                        const errorJson = JSON.parse(errorText);
                        errorDetails = errorJson.details || errorJson.error || errorText;
                    } catch (e) {
                        errorDetails = `Server Error: ${response.status} ${response.statusText}`;
                    }
                    throw new Error(errorDetails);
                }

                const text = await response.text();
                let data;
                try {
                    data = JSON.parse(text);
                } catch (e) {
                    console.error("Failed to parse API response:", text);
                    throw new Error("Invalid response from server");
                }

                setAnalysisResult({
                    faceType: data.faceType,
                    skinAge: { apparentAge: data.skinAge }
                });
                setScores(data.scores);
                setAiMessage(data.message);

                // Set AI Recommendations
                if (data.recommendations) {
                    setRecommendations(data.recommendations);
                }

                if (data.concerns && data.concerns.length > 0) {
                    setSurveyData(prev => ({
                        ...prev,
                        concerns: Array.from(new Set([...prev.concerns, ...data.concerns]))
                    }));
                }

                setStep('RESULT');
            } else {
                // Fallback for Survey-only mode (No Image)
                const baseScores = [50, 50, 50, 50, 50]; // Neural default
                setScores(baseScores);
                setTimeout(() => {
                    setAnalysisResult({ faceType: 'ナチュラル', skinAge: { apparentAge: 25 } });
                    setAiMessage('アンケート結果に基づいた診断です。写真はアップロードされていません。');
                    setStep('RESULT');
                }, 2000);
            }
        } catch (error: any) {
            console.error(error);
            const msg = error.message || String(error);
            if (msg.includes('Failed to fetch')) {
                alert('サーバーとの通信に失敗しました。画像サイズを小さくするか、しばらく経ってから再試行してください。');
            } else {
                alert(`AI分析エラー: ${msg}`);
            }
            setStep('UPLOAD'); // Go back
        }
    };

    const handleDownloadImage = async () => {
        const element = document.getElementById('result-content');
        if (!element) return;

        window.scrollTo(0, 0);

        try {
            const canvas = await html2canvas(element, {
                useCORS: true,
                scale: 2,
                scrollX: 0,
                scrollY: 0,
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
    // Load saved report if ID is present
    useEffect(() => {
        const id = searchParams.get('id');
        if (id) {
            const fetchReport = async () => {
                // Try fetching from Supabase first
                const { data, error } = await supabase
                    .from('analysis_results')
                    .select('*')
                    .eq('id', id)
                    .single();

                if (data) {
                    setAnalysisResult({ faceType: data.face_type, skinAge: { apparentAge: data.skin_age } });
                    setScores(data.scores);

                    // survey_data が文字列の場合はパース、そうでなければそのまま使用
                    const surveyDataProcessed = typeof data.survey_data === 'string'
                        ? JSON.parse(data.survey_data)
                        : data.survey_data;

                    // concerns 가 없으면 빈 배열로 세팅
                    const processedData = {
                        ...surveyDataProcessed,
                        concerns: surveyDataProcessed?.concerns || []
                    };

                    setSurveyData(processedData);
                    if (data.image_url) setImage(data.image_url);
                    setStep('RESULT');
                } else {
                    // Fallback to local/mock if not found in DB (e.g. legacy data)
                    const savedHistory = JSON.parse(localStorage.getItem('analysis_history') || '[]');
                    let report = savedHistory.find((item: any) => item.id === Number(id));
                    if (!report) {
                        report = MOCK_HISTORY.find((item: any) => item.id === Number(id));
                    }
                    if (report) {
                        setAnalysisResult(report.analysisResult);
                        setScores(report.scores);
                        setSurveyData(report.surveyData);
                        if (report.image) setImage(report.image);
                        setStep('RESULT');
                    }
                }
            };
            fetchReport();
        }
    }, [searchParams]);

    // Load treatments from Supabase
    useEffect(() => {
        const fetchTreatments = async () => {
            try {
                const { data, error } = await supabase
                    .from('treatments')
                    .select('*')
                    .order('created_at', { ascending: true });

                if (error) {
                    console.error('Error fetching treatments:', error);
                    return;
                }

                if (data) {
                    setTreatments(data);
                }
            } catch (err) {
                console.error('Unexpected error:', err);
            }
        };

        fetchTreatments();
    }, []);

    const handleAddToWishlist = async (clinic: any) => {
        if (!user) {
            alert('ログインが必要です。');
            return;
        }

        const { error } = await supabase
            .from('wishlist_clinics')
            .insert({
                user_id: user.id,
                hospital_id: clinic.id
            });

        if (error) {
            if (error.code === '23505') { // Unique violation
                alert('既に保存されています。');
            } else {
                console.error('Error saving wishlist:', error);
                alert('保存に失敗しました。');
            }
            return;
        }

        setSavedClinicName(clinic.name);
        setShowClinicModal(true);
    };

    const renderResult = () => (
        <div className={styles.container}>
            <div id="result-content" className={styles.resultArea} style={{ marginTop: 0, background: '#fff' }}>
                <h2 style={{ textAlign: 'center', fontSize: '1.4rem', marginBottom: '1.5rem', color: '#333' }}>
                    あなたは <span style={{ color: '#d4a373', fontSize: '1.6rem', borderBottom: '2px solid #d4a373' }}>{analysisResult?.faceType || 'ナチュラル'}</span> タイプのお顔です！
                </h2>

                <Yuna
                    message={aiMessage || `${analysisResult?.faceType}タイプですね！全体的に魅力的ですが、いくつかの数値を改善するとさらに美しくなります。`}
                    sideImage={image}
                />

                <div className={styles.chartContainer}>
                    <Radar
                        data={{
                            labels: ['バランス', '肌のキメ', '透明感', 'ハリ・弾力', '水分量'],
                            datasets: [
                                {
                                    label: 'あなたの分析結果',
                                    data: scores,
                                    backgroundColor: 'rgba(255, 99, 132, 0.2)',
                                    borderColor: 'rgba(255, 99, 132, 1)',
                                    borderWidth: 2,
                                },
                            ],
                        }}
                        options={{
                            scales: {
                                r: {
                                    angleLines: {
                                        color: 'rgba(0, 0, 0, 0.1)',
                                    },
                                    grid: {
                                        color: 'rgba(0, 0, 0, 0.1)',
                                    },
                                    pointLabels: {
                                        color: '#666',
                                        font: {
                                            size: 12,
                                        },
                                    },
                                    ticks: {
                                        display: false, // Hide numeric labels on the scale
                                        stepSize: 20,
                                    },
                                    suggestedMin: 0,
                                    suggestedMax: 100,
                                },
                            },
                            plugins: {
                                legend: {
                                    display: false,
                                },
                            },
                            maintainAspectRatio: false,
                        }}
                    />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '0.5rem', marginBottom: '2rem', textAlign: 'center' }}>
                    {['バランス', '肌のキメ', '透明感', 'ハリ・弾力', '水分量'].map((label, index) => (
                        <div key={label} style={{ background: '#f8f9fa', padding: '0.5rem', borderRadius: '8px', border: '1px solid #eee' }}>
                            <div style={{ fontSize: '0.7rem', color: '#666', marginBottom: '0.2rem' }}>{label}</div>
                            <div style={{ fontSize: '1.1rem', fontWeight: 'bold', color: '#333' }}>{scores[index]}</div>
                        </div>
                    ))}
                </div>




                <div className={styles.detailSection} style={{ background: '#fffaf0', border: '1px solid #eddcd2' }}>
                    <h3 className={styles.sectionTitle} style={{ color: '#d4a373' }}>💉 おすすめの施術ソリューション</h3>

                    {/* AI Recommendations Mode */}
                    {recommendations.length > 0 ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <div style={{ fontSize: '0.9rem', color: '#666', marginBottom: '0.5rem' }}>
                                AIがあなたの顔分析結果に基づいて厳選した施術です。
                            </div>
                            {recommendations.map((rec, idx) => (
                                <div key={idx} style={{ background: 'white', padding: '1rem', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', gap: '0.5rem', marginBottom: '0.5rem' }}>
                                        <div>
                                            <span style={{ fontSize: '0.75rem', background: '#d4a373', color: 'white', padding: '2px 6px', borderRadius: '4px', marginRight: '6px' }}>
                                                {rec.category || 'Recommned'}
                                            </span>
                                            <strong style={{ color: '#333', fontSize: '0.95rem' }}>{rec.name}</strong>
                                        </div>
                                    </div>
                                    <p style={{ fontSize: '0.85rem', color: '#666', lineHeight: 1.5, marginBottom: '0.5rem' }}>{rec.description}</p>
                                    <div style={{ fontSize: '0.9rem', fontWeight: 'bold', color: '#e53e3e', textAlign: 'right' }}>
                                        {rec.price_range}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        /* Fallback DB/Local Mode */
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {surveyData?.concerns?.length > 0 ? surveyData.concerns.map(c => {
                                // Fix: Check if t.concerns array includes c (for DB data) vs t.concern_type (for Mock)
                                const matchingTreatments = treatments.filter(t =>
                                    t.concerns ? t.concerns.includes(c) : t.concern_type === c
                                );

                                if (matchingTreatments.length === 0) return null;

                                return (
                                    <div key={c}>
                                        <strong style={{ color: '#e53e3e', fontSize: '0.9rem', display: 'block', marginBottom: '0.8rem' }}>悩み: {c}</strong>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                                            {matchingTreatments.length > 0 ? matchingTreatments.map(treatment => (
                                                <div key={treatment.id} style={{ background: 'white', padding: '1rem', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', gap: '0.5rem', marginBottom: '0.5rem' }}>
                                                        <div style={{ flex: 1 }}>
                                                            <strong style={{ color: '#333', fontSize: '0.95rem', display: 'block' }}>{treatment.name}</strong>
                                                            {treatment.name_en && (
                                                                <span style={{ fontSize: '0.8rem', color: '#999', fontStyle: 'italic' }}>{treatment.name_en}</span>
                                                            )}
                                                        </div>
                                                        <button
                                                            onClick={() => {
                                                                setSelectedTreatment(treatment);
                                                                setShowTreatmentModal(true);
                                                            }}
                                                            style={{
                                                                background: 'none',
                                                                border: 'none',
                                                                cursor: 'pointer',
                                                                fontSize: '1.5rem',
                                                                lineHeight: 1,
                                                                padding: 0,
                                                                transition: 'transform 0.2s'
                                                            }}
                                                            title="関心施術を見る"
                                                        >
                                                            🤍
                                                        </button>
                                                    </div>
                                                    <p style={{ fontSize: '0.85rem', color: '#555', lineHeight: 1.6, margin: '0.5rem 0' }}>
                                                        {treatment.description || treatment.effect}
                                                    </p>
                                                    {(treatment.price || treatment.time || treatment.downtime) && (
                                                        <div style={{ fontSize: '0.8rem', color: '#999', marginTop: '0.5rem', borderTop: '1px solid #eee', paddingTop: '0.5rem' }}>
                                                            {treatment.price && <span>💰 {treatment.price} </span>}
                                                            {treatment.time && <span>⏱ {treatment.time} </span>}
                                                            {treatment.downtime && <span>✨ {treatment.downtime}</span>}
                                                        </div>
                                                    )}
                                                </div>
                                            )) : (
                                                <p style={{ fontSize: '0.85rem', color: '#999' }}>専門医との相談をおすすめします。</p>
                                            )}
                                        </div>
                                    </div>
                                );
                            }) : (
                                <p>特に悩みがなくても、定期的なアクアピーリングなどのスキンケアをお勧めします。</p>
                            )}
                        </div>
                    )}
                </div>

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
                                    onClick={() => handleAddToWishlist(clinic)}
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

            <div style={{ marginTop: '2rem', display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
                <button
                    onClick={async () => {
                        if (!user) {
                            alert('ログインが必要です。');
                            return;
                        }

                        let imageUrl = null;
                        if (image) {
                            try {
                                const base64Response = await fetch(image);
                                const blob = await base64Response.blob();
                                const fileExt = image.substring("data:image/".length, image.indexOf(";base64"));
                                const fileName = `${user.id}/${Date.now()}.${fileExt}`;

                                const { error: uploadError } = await supabase.storage
                                    .from('analysis-images')
                                    .upload(fileName, blob, {
                                        contentType: `image/${fileExt}`,
                                        upsert: true
                                    });

                                if (uploadError) {
                                    console.error('Error uploading image:', uploadError);
                                } else {
                                    const { data: { publicUrl } } = supabase.storage
                                        .from('analysis-images')
                                        .getPublicUrl(fileName);
                                    imageUrl = publicUrl;
                                }
                            } catch (e) {
                                console.error('Error processing image:', e);
                            }
                        }

                        const newReport = {
                            user_id: user.id,
                            face_type: analysisResult?.faceType || 'ナチュラル',
                            skin_age: analysisResult?.skinAge?.apparentAge || 25,
                            scores: scores,
                            survey_data: surveyData,
                            image_url: imageUrl
                        };

                        const { error: deleteError } = await supabase
                            .from('analysis_results')
                            .delete()
                            .eq('user_id', user.id);

                        if (deleteError) {
                            console.error('Error deleting old report:', deleteError);
                        }

                        const { error: insertError } = await supabase
                            .from('analysis_results')
                            .insert(newReport);

                        if (insertError) {
                            console.error('Error saving report:', insertError);
                            alert('レポートの保存に失敗しました。');
                        } else {
                            setShowSaveModal(true);
                        }
                    }}
                    className={styles.primaryButton}
                    style={{
                        padding: '1.2rem 2rem',
                        background: 'linear-gradient(135deg, #7e3af2, #6c2bd9)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '12px',
                        fontWeight: '700',
                        fontSize: '1.1rem',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        boxShadow: '0 4px 15px rgba(126, 58, 242, 0.3)'
                    }}
                >
                    <span style={{ fontSize: '1.4rem', marginRight: '0.5rem' }}>💾</span>レポート保存
                </button>
                <div style={{ textAlign: 'center', marginTop: '0.5rem', fontSize: '0.8rem', color: '#666' }}>
                    ※ 画像の保存には少し時間がかかる場合があります。
                </div>
                <button
                    onClick={handleDownloadImage}
                    style={{
                        background: 'none',
                        border: 'none',
                        color: '#7e3af2',
                        cursor: 'pointer',
                        fontSize: '0.95rem',
                        fontWeight: '600',
                        textDecoration: 'none',
                        padding: '0.5rem'
                    }}
                >
                    📥 画像として保存
                </button>
            </div>
        </div >
    );

    const renderEntry = () => (
        <div className={styles.container}>
            <h1 className={styles.title}>AI総合ビューティー診断</h1>
            <p style={{ textAlign: 'center', marginBottom: '2rem', color: '#666' }}>
                あなたの写真を分析するか、<br />アンケートのみで診断するか選んでください。
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', width: '100%', alignItems: 'center' }}>
                <button className={styles.entryOption} onClick={() => setStep('UPLOAD')}>
                    <span style={{ fontSize: '2rem', display: 'block', marginBottom: '0.5rem' }}>📸</span>
                    <strong>写真をアップロードして精密診断</strong>
                    <div style={{ fontSize: '0.8rem', opacity: 0.8, marginTop: '0.5rem' }}>AIが肌状態と顔のバランスを分析します</div>
                </button>
                <button className={styles.entryOption} onClick={handleNoPhoto}>
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
                <h1 className={styles.title} style={{ margin: 0, flex: 1, textAlign: 'center', fontSize: '1.4rem' }}>写真アップロード</h1>
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

    const SaveSuccessModal = () => (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 1000
        }} onClick={() => setShowSaveModal(false)}>
            <div style={{
                background: 'white',
                padding: '2rem',
                borderRadius: '16px',
                textAlign: 'center',
                maxWidth: '90%',
                width: '320px',
                boxShadow: '0 4px 20px rgba(0,0,0,0.15)'
            }} onClick={e => e.stopPropagation()}>
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>💾</div>
                <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem', color: '#333' }}>保存完了</h3>
                <p style={{ color: '#666', marginBottom: '1.5rem', fontSize: '0.95rem' }}>
                    診断レポートが保存されました。<br />
                    マイページでいつでも確認できます。
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                    <Link href="/mypage" style={{
                        display: 'block',
                        padding: '0.8rem',
                        background: '#333',
                        color: 'white',
                        textDecoration: 'none',
                        borderRadius: '8px',
                        fontWeight: 'bold',
                        fontSize: '0.95rem'
                    }}>
                        マイページへ移動
                    </Link>
                    <button onClick={() => setShowSaveModal(false)} style={{
                        padding: '0.8rem',
                        background: '#f0f0f0',
                        color: '#666',
                        border: 'none',
                        borderRadius: '8px',
                        fontWeight: 'bold',
                        cursor: 'pointer',
                        fontSize: '0.95rem'
                    }}>
                        閉じる
                    </button>
                </div>
            </div>
        </div>
    );

    const ClinicSaveModal = () => (
        <div style={{
            position: 'fixed',
            top: 20,
            left: '50%',
            transform: 'translateX(-50%)',
            width: '90%',
            maxWidth: '400px',
            backgroundColor: '#333',
            color: 'white',
            padding: '1rem 1.5rem',
            borderRadius: '12px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.5rem',
            zIndex: 2000
        }} onClick={() => setShowClinicModal(false)}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                <span style={{ fontSize: '1.5rem' }}>💖</span>
                <div>
                    <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 'bold' }}>保存しました！</h4>
                    <p style={{ margin: 0, fontSize: '0.8rem', opacity: 0.9 }}>
                        「{savedClinicName}」をマイ病院リストに追加しました。
                    </p>
                </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '0.5rem' }}>
                <Link href="/mypage" style={{ color: '#d4a373', fontSize: '0.85rem', fontWeight: 'bold', textDecoration: 'none' }}>
                    確認する &rarr;
                </Link>
                <button onClick={(e) => { e.stopPropagation(); setShowClinicModal(false); }} style={{ background: 'none', border: 'none', color: 'white', fontSize: '0.85rem', cursor: 'pointer', opacity: 0.7 }}>
                    閉じる
                </button>
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
            {showSaveModal && <SaveSuccessModal />}
            {showClinicModal && <ClinicSaveModal />}
            {showTreatmentModal && selectedTreatment && (
                <TreatmentModal
                    treatment={selectedTreatment}
                    onClose={() => setShowTreatmentModal(false)}
                />
            )}
        </>
    );
}
