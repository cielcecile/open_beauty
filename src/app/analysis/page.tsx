'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Image from 'next/image';
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

type AnalysisRecord = {
  id: string;
  face_type: string;
  skin_age: number;
  scores: number[];
  image_url: string | null;
};

function AnalysisContent() {
  const searchParams = useSearchParams();
  const { user } = useAuth();

  const [image, setImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AnalysisApiResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const id = searchParams.get('id');
    if (!id) return;

    const loadSaved = async () => {
      const { data } = await supabase
        .from('analysis_results')
        .select('id,face_type,skin_age,scores,image_url')
        .eq('id', id)
        .single<AnalysisRecord>();

      if (!data) return;

      setResult({
        faceType: data.face_type,
        skinAge: data.skin_age,
        scores: data.scores,
        concerns: [],
      });
      setImage(data.image_url);
    };

    void loadSaved();
  }, [searchParams]);

  const onFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setError('画像サイズは5MB以下にしてください。');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => setImage(reader.result as string);
    reader.readAsDataURL(file);
  };

  const runAnalysis = async () => {
    if (!image) {
      setError('先に画像をアップロードしてください。');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image }),
      });

      const payload = (await response.json()) as AnalysisApiResponse | { error?: string };

      if (!response.ok || 'error' in payload) {
        setError(('error' in payload && payload.error) || '分析に失敗しました。');
        return;
      }

      setResult(payload as AnalysisApiResponse);
    } catch {
      setError('ネットワークエラーが発生しました。');
    } finally {
      setLoading(false);
    }
  };

  const saveResult = async () => {
    if (!user || !result) return;

    const { error: saveError } = await supabase.from('analysis_results').insert({
      user_id: user.id,
      face_type: result.faceType,
      skin_age: result.skinAge,
      scores: result.scores,
      survey_data: { concerns: result.concerns },
      image_url: image,
    });

    if (saveError) {
      setError('結果の保存に失敗しました。');
      return;
    }

    alert('結果を保存しました。');
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>AI肌分析</h1>

      <div className={styles.uploadBox}>
        <input type="file" accept="image/*" onChange={onFileChange} />
      </div>

      {image && (
        <div style={{ margin: '1rem 0' }}>
          <Image src={image} alt="アップロード画像" width={220} height={220} unoptimized />
        </div>
      )}

      <button className={styles.analyzeBtn} onClick={runAnalysis} disabled={loading}>
        {loading ? '分析中...' : '分析する'}
      </button>

      {error && <p style={{ color: '#c00', marginTop: '1rem' }}>{error}</p>}

      {result && (
        <div className={styles.resultArea} style={{ marginTop: '1.5rem' }}>
          <p><strong>顔タイプ:</strong> {result.faceType}</p>
          <p><strong>肌年齢:</strong> {result.skinAge}</p>
          <p><strong>スコア:</strong> {result.scores.join(', ')}</p>
          <p><strong>悩み:</strong> {result.concerns.join(', ') || 'なし'}</p>
          {result.message && <p><strong>アドバイス:</strong> {result.message}</p>}
          {result.recommendations && result.recommendations.length > 0 && (
            <div>
              <strong>おすすめ施術:</strong>
              <ul>
                {result.recommendations.map((rec) => (
                  <li key={rec.name}>{rec.name} {rec.price_range ? `(${rec.price_range})` : ''}</li>
                ))}
              </ul>
            </div>
          )}

          <button className={styles.primaryButton} onClick={saveResult} disabled={!user}>
            結果を保存
          </button>
        </div>
      )}
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
