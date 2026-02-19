'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import {
  Button,
  Card,
  Upload,
  Typography,
  Row,
  Col,
  Tag,
  Statistic,
  Spin,
  Alert,
  Space,
  Divider
} from 'antd';
import {
  CameraOutlined,
  LoadingOutlined,
  SwapLeftOutlined,
  HeartOutlined,
  BulbOutlined,
  ShopOutlined,
  ReloadOutlined
} from '@ant-design/icons';
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
  code?: string;
  error?: string;
};

type StepName = 'ENTRY' | 'UPLOAD' | 'SURVEY' | 'ANALYZING' | 'RESULT';

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

  const [step, setStep] = useState<StepName>('ENTRY');
  const [image, setImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AnalysisApiResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedConcerns, setSelectedConcerns] = useState<string[]>([]);

  useEffect(() => {
    const id = searchParams.get('id');
    if (id) void loadSaved(id);
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

  const resizeImage = (base64Str: string): Promise<string> => {
    return new Promise((resolve) => {
      const img = new window.Image();
      img.src = base64Str;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX = 1024;
        let w = img.width, h = img.height;
        if (w > h) { if (w > MAX) { h *= MAX / w; w = MAX; } }
        else { if (h > MAX) { w *= MAX / h; h = MAX; } }
        canvas.width = w; canvas.height = h;
        canvas.getContext('2d')?.drawImage(img, 0, 0, w, h);
        resolve(canvas.toDataURL('image/jpeg', 0.8));
      };
    });
  };

  const beforeUpload = (file: File) => {
    const reader = new FileReader();
    reader.onloadend = async () => {
      const resized = await resizeImage(reader.result as string);
      setImage(resized);
      setStep('SURVEY');
    };
    reader.readAsDataURL(file);
    return false;
  };

  const runAnalysis = async () => {
    setStep('ANALYZING');
    setError(null);

    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image, concerns: selectedConcerns }),
      });

      const data: AnalysisApiResponse = await response.json();
      if (!response.ok) {
        if (data.code === 'APP_RATE_LIMIT') throw new Error('リクエストが多すぎます。少し時間を置いてから再度お試しください。');
        if (data.code === 'GEMINI_QUOTA_EXCEEDED') throw new Error('現在アクセスが集中しています。2〜3分後に再度お試しください。');
        if (data.code === 'AI_FAILED' || data.code === 'AI_RESPONSE_PARSE_ERROR') {
          throw new Error(image ? 'AIが写真をうまく読み取れませんでした。明るい場所で正面から撮り直してみてください。' : 'AIが悩みの分析に失敗しました。内容を変えて再度お試しください。');
        }
        if (data.code === 'AI_MODEL_ERROR') {
          throw new Error('AIモデルの接続に失敗しました。(404)');
        }
        if (data.code === 'AI_SAFETY_BLOCK') {
          throw new Error('安全性フィルタによりブロックされました。別の写真で再度お試しください。');
        }
        if (data.code === 'GEMINI_KEY_MISSING') {
          throw new Error('サーバー側のAPIキー設定が未完了です。');
        }
        throw new Error(data.error || '分析に失敗しました。');
      }
      setResult(data);
      setStep('RESULT');
    } catch (err) {
      console.error('Analysis error:', err);
      setError(err instanceof Error ? err.message : '予期せぬエラーが発生しました。');
      setStep('SURVEY');
    }
  };

  const stepVariants = {
    hidden: { opacity: 0, x: 20 },
    visible: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20 }
  };

  const renderEntry = () => (
    <motion.div initial="hidden" animate="visible" exit="exit" variants={stepVariants} style={{ padding: '20px' }}>
      <Row gutter={[24, 24]}>
        <Col xs={24} md={12}>
          <Card hoverable onClick={() => setStep('UPLOAD')} className="glass" style={{ borderRadius: '24px', textAlign: 'center', height: '100%', border: 'none' }}>
            <div style={{ fontSize: '3.5rem', marginBottom: '16px' }}>✨</div>
            <Typography.Title level={4}>AI写真分析</Typography.Title>
            <Typography.Text type="secondary">写真をアップロードして詳細に分析します</Typography.Text>
          </Card>
        </Col>
        <Col xs={24} md={12}>
          <Card hoverable onClick={() => { setImage(null); setStep('SURVEY'); }} className="glass" style={{ borderRadius: '24px', textAlign: 'center', height: '100%', border: 'none' }}>
            <div style={{ fontSize: '3.5rem', marginBottom: '16px' }}>📝</div>
            <Typography.Title level={4}>簡単問診分析</Typography.Title>
            <Typography.Text type="secondary">写真なしで悩みからおすすめを提案します</Typography.Text>
          </Card>
        </Col>
      </Row>
    </motion.div>
  );

  const renderUpload = () => (
    <motion.div initial="hidden" animate="visible" exit="exit" variants={stepVariants} style={{ padding: '20px', textAlign: 'center' }}>
      <Card className="glass" style={{ borderRadius: '24px', border: 'none', padding: '40px 20px' }}>
        <Upload.Dragger multiple={false} showUploadList={false} beforeUpload={beforeUpload} style={{ background: 'rgba(255,255,255,0.5)', borderRadius: '16px', padding: '40px', border: '2px dashed var(--c-accent)' }}>
          <p><CameraOutlined style={{ fontSize: '48px', color: 'var(--c-accent)' }} /></p>
          <p style={{ fontSize: '1.2rem', fontWeight: 600, marginTop: '16px' }}>分析する写真をアップロード</p>
          <p style={{ color: 'var(--c-text-secondary)' }}>明るい場所で正面を向いた写真がおすすめです</p>
        </Upload.Dragger>
        <Button type="text" icon={<SwapLeftOutlined />} onClick={() => setStep('ENTRY')} style={{ marginTop: '24px' }}>戻る</Button>
      </Card>
    </motion.div>
  );

  const renderSurvey = () => (
    <motion.div initial="hidden" animate="visible" exit="exit" variants={stepVariants} style={{ padding: '20px' }}>
      <Typography.Title level={4} style={{ textAlign: 'center', marginBottom: '24px' }}>気になる悩みを選択してください</Typography.Title>
      <Row gutter={[16, 16]}>
        {CONCERNS_OPTIONS.map(opt => (
          <Col xs={12} key={opt.id}>
            <Card
              hoverable
              onClick={() => setSelectedConcerns(p => p.includes(opt.label) ? p.filter(c => c !== opt.label) : [...p, opt.label])}
              style={{
                borderRadius: '16px',
                textAlign: 'center',
                border: selectedConcerns.includes(opt.label) ? '2px solid var(--c-accent)' : '1px solid transparent',
                background: selectedConcerns.includes(opt.label) ? '#fffdf5' : 'rgba(255,255,255,0.8)',
                transition: 'all 0.3s ease'
              }}
              styles={{ body: { padding: '20px' } }}
            >
              <div style={{ fontSize: '2rem', marginBottom: '8px' }}>{opt.icon}</div>
              <Typography.Text strong={selectedConcerns.includes(opt.label)}>{opt.label}</Typography.Text>
            </Card>
          </Col>
        ))}
      </Row>
      <div style={{ marginTop: '40px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <button
          onClick={runAnalysis}
          disabled={!image && selectedConcerns.length === 0}
          className="btn btn-primary"
          style={{ width: '100%', fontSize: '1.1rem', opacity: (!image && selectedConcerns.length === 0) ? 0.5 : 1 }}
        >
          分析を開始する
        </button>
        <Button type="text" onClick={() => setStep('ENTRY')}>キャンセル</Button>
      </div>
      {error && <Alert title={error} type="error" showIcon style={{ marginTop: '20px', borderRadius: '12px' }} />}
    </motion.div>
  );

  const renderLoading = () => (
    <div style={{ padding: '100px 20px', textAlign: 'center' }}>
      <Spin indicator={<LoadingOutlined style={{ fontSize: 48, color: 'var(--c-accent)' }} spin />} />
      <Typography.Title level={4} style={{ marginTop: '32px' }}>{image ? 'AIが写真を分析中...' : 'AIが悩みを分析中...'}</Typography.Title>
      <Typography.Paragraph type="secondary">あなたに最適なプランを生成しています</Typography.Paragraph>
    </div>
  );

  const renderResult = () => result && (
    <motion.div initial="hidden" animate="visible" variants={stepVariants} style={{ padding: '20px' }}>
      <Card className="glass" style={{ borderRadius: '32px', overflow: 'hidden', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.05)' }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <Tag color="#D4AF37" style={{ fontSize: '14px', padding: '6px 20px', borderRadius: '20px', marginBottom: '16px', border: 'none', color: '#fff' }}>{result.faceType}</Tag>
          <Typography.Title level={2} style={{ margin: 0, fontFamily: 'var(--font-heading)' }}>肌分析レポート</Typography.Title>
        </div>
        <Row gutter={24} style={{ marginBottom: '32px' }}>
          <Col span={12}><Statistic title="推定肌年齢" value={result.skinAge} suffix="才" /></Col>
          <Col span={12}><Statistic title="健康スコア" value={result.scores?.[0] || 85} suffix="%" /></Col>
        </Row>
        {image && <div style={{ textAlign: 'center', marginBottom: '32px' }}><Image src={image} alt="分析" width={200} height={200} style={{ borderRadius: '24px', objectFit: 'cover', boxShadow: '0 8px 16px rgba(0,0,0,0.1)' }} unoptimized /></div>}
        <div style={{ marginBottom: '32px' }}>
          <Typography.Title level={4}><BulbOutlined style={{ color: 'var(--c-accent)' }} /> AIアドバイス</Typography.Title>
          <Typography.Paragraph style={{ background: 'rgba(255,255,255,0.6)', padding: '20px', borderRadius: '16px', fontSize: '1rem', lineHeight: '1.8' }}>{result.message || 'おすすめのケアを続けましょう。'}</Typography.Paragraph>
        </div>
        {result.recommendations && result.recommendations.length > 0 && (
          <div style={{ marginBottom: '32px' }}>
            <Typography.Title level={4}><HeartOutlined style={{ color: 'var(--c-accent)' }} /> おすすめの施術</Typography.Title>
            <Space orientation="vertical" style={{ width: '100%' }} size="middle">
              {result.recommendations.map((rec, i) => (
                <Card key={i} size="small" style={{ borderRadius: '16px', border: '1px solid rgba(0,0,0,0.05)', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
                  <Typography.Title level={5} style={{ margin: 0, color: 'var(--c-accent-dark)' }}>{rec.name}</Typography.Title>
                  <Typography.Text type="secondary">{rec.description}</Typography.Text>
                  <Divider style={{ margin: '12px 0' }} />
                  <Typography.Text strong>{rec.price_range}</Typography.Text>
                </Card>
              ))}
            </Space>
          </div>
        )}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <button onClick={() => router.push('/hospitals')} className="btn btn-primary" style={{ width: '100%' }}>
            <ShopOutlined style={{ marginRight: '8px' }} /> クリニックを探す
          </button>
          <Button icon={<ReloadOutlined />} onClick={() => setStep('ENTRY')} style={{ height: '50px', borderRadius: '25px' }}>もう一度分析する</Button>
        </div>
      </Card>
    </motion.div>
  );

  return (
    <div className={styles.container} style={{ maxWidth: '600px', margin: '0 auto', paddingTop: '80px', minHeight: '100vh' }}>
      <div style={{ padding: '0 20px 40px' }}>
        <AnimatePresence mode="wait">
          {step === 'ENTRY' && <motion.div key="entry">{renderEntry()}</motion.div>}
          {step === 'UPLOAD' && <motion.div key="upload">{renderUpload()}</motion.div>}
          {step === 'SURVEY' && <motion.div key="survey">{renderSurvey()}</motion.div>}
          {step === 'ANALYZING' && <motion.div key="analyzing">{renderLoading()}</motion.div>}
          {step === 'RESULT' && <motion.div key="result">{renderResult()}</motion.div>}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default function AnalysisPage() {
  return <Suspense fallback={<div style={{ textAlign: 'center', padding: '100px' }}><Spin size="large" /></div>}><AnalysisContent /></Suspense>;
}

