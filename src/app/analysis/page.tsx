'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import styles from './analysis.module.css';

type AnalysisApiResponse = {
  faceType: string;
  skinAge: number;
  scores: number[];
  concerns: string[];
  message?: string;
  recommendations?: Array<{
    name: string;
    category?: string;
    description?: string;
    price_range?: string;
  }>;
};

type Step = 'ENTRY' | 'UPLOAD' | 'SURVEY' | 'ANALYZING' | 'RESULT';

const CONCERNS_OPTIONS = [
  { id: 'sagging', label: 'たるみ・弾力', icon: '💆' },
  { id: 'wrinkles', label: 'シワ', icon: '👵' },
  { id: 'pores', label: '毛穴', icon: '🫧' },
  { id: 'pigment', label: 'シミ・くすみ', icon: '✨' },
  { id: 'acne', label: 'ニキビ・肌荒れ', icon: '🔴' },
  { id: 'dryness', label: '乾燥', icon: '💧' },
];

function AnalysisContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user } = useAuth();

  const [step, setStep] = useState<Step>('ENTRY');
  const [image, setImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AnalysisApiResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedConcerns, setSelectedConcerns] = useState<string[]>([]);

  useEffect(() => {
    const id = searchParams.get('id');
    if (id) {
      void loadSaved(id);
    }
  }, [searchParams]);

  const loadSaved = async (id: string) => {
    setLoading(true);
    const { data, error } = await supabase
      .from('analysis_results')
      .select('*')
      .eq('id', id)
      .single();

    if (data && !error) {
      setResult({
        faceType: data.face_type,
        skinAge: data.skin_age,
        scores: data.scores,
        concerns: data.survey_data?.concerns || [],
      });
      setImage(data.image_url);
      setStep('RESULT');
    }
    setLoading(false);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 8 * 1024 * 1024) {
      setError('画像サイズは8MB以下にしてください。');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setImage(reader.result as string);
      setStep('SURVEY');
    };
    reader.readAsDataURL(file);
  };

  const runAnalysis = async () => {
    setStep('ANALYZING');
    setError(null);

    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          image,
          concerns: selectedConcerns
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || '分析に失敗しました。');

      setResult(data);
      setStep('RESULT');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'エラーが発生しました。');
      setStep('SURVEY');
    }
  };

  const toggleConcern = (label: string) => {
    setSelectedConcerns(prev =>
      prev.includes(label) ? prev.filter(c => c !== label) : [...prev, label]
    );
  };

  const renderEntry = () => (
    <div className={styles.surveyContainer}>
      <button className={styles.entryOption} onClick={() => setStep('UPLOAD')}>
        <span>✨</span>
        <strong>AI写真分析</strong>
        <div>写真をアップロードして詳細に分析</div>
      </button>
      <button className={styles.entryOption} onClick={() => setStep('SURVEY')}>
        <span>📝</span>
        <strong>簡単問診分析</strong>
        <div>写真なしで悩みを相談する</div>
      </button>
    </div>
  );

  const renderUpload = () => (
    <div className={styles.surveyContainer}>
      <div className={styles.uploadBox} onClick={() => document.getElementById('fileInput')?.click()}>
        <span className={styles.icon}>📸</span>
        <p className={styles.uploadText}>分析する写真をアップロード</p>
        <p className={styles.hintText}>正面を向いた明るい写真がおすすめです</p>
        <input
          id="fileInput"
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          style={{ display: 'none' }}
        />
      </div>
      <button className={styles.analyzeBtn} style={{ background: '#f5f5f5', color: '#666' }} onClick={() => setStep('ENTRY')}>
        戻る
      </button>
    </div>
  );

  const renderSurvey = () => (
    <div className={styles.surveyContainer}>
      <h2 className={styles.sectionTitle}>気になる悩みを選択してください（複数可）</h2>
      <div className={styles.scoreCardGrid} style={{ gridTemplateColumns: 'repeat(2, 1fr)' }}>
        {CONCERNS_OPTIONS.map(opt => (
          <div
            key={opt.id}
            className={`${styles.scoreCard} ${selectedConcerns.includes(opt.label) ? styles.activeScore : ''}`}
            onClick={() => toggleConcern(opt.label)}
            style={{ cursor: 'pointer', border: selectedConcerns.includes(opt.label) ? '2px solid var(--c-accent)' : '1px solid #eee' }}
          >
            <span style={{ fontSize: '1.5rem', display: 'block' }}>{opt.icon}</span>
            <span className={styles.scoreLabel} style={{ color: '#333', fontSize: '0.9rem' }}>{opt.label}</span>
          </div>
        ))}
      </div>

      <button
        className={styles.analyzeBtn}
        onClick={runAnalysis}
        disabled={!image && selectedConcerns.length === 0}
      >
        分析を開始する
      </button>
      <button className={styles.analyzeBtn} style={{ background: 'none', color: '#888', marginTop: '1rem' }} onClick={() => setStep('ENTRY')}>
        キャンセル
      </button>
      {error && <p style={{ color: '#c00', textAlign: 'center', marginTop: '1rem' }}>{error}</p>}
    </div>
  );

  const renderLoading = () => (
    <div className={styles.loadingOverlay}>
      <div className={styles.spinner}></div>
      <p>AIが状態を分析しています...<br />少々お待ちください</p>
    </div>
  );

  const renderResult = () => {
    if (!result) return null;
    return (
      <motion.div className={styles.resultArea} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className={styles.resultHeader}>
          <span className={styles.faceTypeBadge}>{result.faceType}</span>
          <h2 className={styles.resultTitle}>肌分析結果レポート</h2>
        </div>

        <div className={styles.scoreCardGrid}>
          <div className={styles.scoreCard}>
            <span className={styles.scoreValue}>{result.skinAge}</span>
            <span className={styles.scoreLabel}>推定肌年齢</span>
          </div>
          <div className={styles.scoreCard}>
            <span className={styles.scoreValue}>{result.scores[0] || 85}</span>
            <span className={styles.scoreLabel}>健康スコア</span>
          </div>
        </div>

        {image && (
          <div className={styles.detailSection} style={{ textAlign: 'center' }}>
            <Image src={image} alt="分析画像" width={200} height={200} className={styles.resultImage} style={{ borderRadius: '12px', objectFit: 'cover' }} unoptimized />
          </div>
        )}

        <div className={styles.detailSection}>
          <h3 className={styles.sectionTitle}>💡 AIアドバイス</h3>
          <p style={{ fontSize: '0.95rem', lineHeight: '1.6', color: '#444' }}>{result.message || '日々のケアに加えて、専門的な施術を組み合わせることでより高い効果が期待できます。'}</p>
        </div>

        {result.recommendations && result.recommendations.length > 0 && (
          <div className={styles.detailSection}>
            <h3 className={styles.sectionTitle}>💎 おすすめの施術</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
              {result.recommendations.map((rec, i) => (
                <div key={i} style={{ padding: '1rem', background: 'white', borderRadius: '8px', border: '1px solid #eee' }}>
                  <strong style={{ fontSize: '1rem', color: 'var(--c-accent)' }}>{rec.name}</strong>
                  <p style={{ fontSize: '0.8rem', color: '#666', marginTop: '4px' }}>{rec.description}</p>
                  <div style={{ marginTop: '8px', fontSize: '0.85rem', fontWeight: 'bold' }}>{rec.price_range}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div style={{ marginTop: '2rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <button className={styles.analyzeBtn} onClick={() => router.push('/hospitals')}>
            クリニックを探す
          </button>
          <button className={styles.analyzeBtn} style={{ background: '#f5f5f5', color: '#666' }} onClick={() => setStep('ENTRY')}>
            もう一度分析する
          </button>
        </div>
      </motion.div>
    );
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>AI肌分析</h1>

      {step === 'ENTRY' && renderEntry()}
      {step === 'UPLOAD' && renderUpload()}
      {step === 'SURVEY' && renderSurvey()}
      {step === 'ANALYZING' && renderLoading()}
      {step === 'RESULT' && renderResult()}
    </div>
  );
}

export default function AnalysisPage() {
  return (
    <Suspense fallback={<div className={styles.container}>読み込み中...</div>}>
      <AnalysisContent />
    </Suspense>
  );
}
