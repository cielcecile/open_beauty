'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import {
  Button,
  Card,
  Steps,
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
  FileSearchOutlined,
  LoadingOutlined,
  SwapLeftOutlined,
  CheckCircleOutlined,
  HeartOutlined,
  BulbOutlined,
  ShopOutlined,
  ReloadOutlined
} from '@ant-design/icons';
import type { UploadFile } from 'antd/es/upload/interface';
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

  const beforeUpload = (file: File) => {
    if (file.size > 8 * 1024 * 1024) {
      setError('画像サイズは8MB以下にしてください。');
      return false;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setImage(reader.result as string);
      setStep('SURVEY');
    };
    reader.readAsDataURL(file);
    return false; // Prevent auto upload
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
    <div style={{ padding: '20px' }}>
      <Row gutter={[24, 24]}>
        <Col xs={24} md={12}>
          <Card
            hoverable
            onClick={() => setStep('UPLOAD')}
            style={{ borderRadius: '16px', textAlign: 'center', height: '100%', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}
          >
            <div style={{ fontSize: '3rem', marginBottom: '16px' }}>✨</div>
            <Typography.Title level={4}>AI写真分析</Typography.Title>
            <Typography.Text type="secondary">写真をアップロードして詳細に分析します</Typography.Text>
          </Card>
        </Col>
        <Col xs={24} md={12}>
          <Card
            hoverable
            onClick={() => setStep('SURVEY')}
            style={{ borderRadius: '16px', textAlign: 'center', height: '100%', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}
          >
            <div style={{ fontSize: '3rem', marginBottom: '16px' }}>📝</div>
            <Typography.Title level={4}>簡単問診分析</Typography.Title>
            <Typography.Text type="secondary">写真なしで悩みからおすすめを提案します</Typography.Text>
          </Card>
        </Col>
      </Row>
    </div>
  );

  const renderUpload = () => (
    <div style={{ padding: '20px', textAlign: 'center' }}>
      <Card style={{ borderRadius: '16px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', padding: '40px 20px' }}>
        <Upload.Dragger
          multiple={false}
          showUploadList={false}
          beforeUpload={beforeUpload}
          style={{ background: '#fafafa', borderRadius: '12px', padding: '40px' }}
        >
          <p className="ant-upload-drag-icon">
            <CameraOutlined style={{ fontSize: '48px', color: '#D4AF37' }} />
          </p>
          <p className="ant-upload-text" style={{ fontSize: '1.2rem', fontWeight: 600 }}>分析する写真をアップロード</p>
          <p className="ant-upload-hint">正面을 향한 밝은 사진을 권장합니다</p>
        </Upload.Dragger>
        <Button
          type="text"
          icon={<SwapLeftOutlined />}
          onClick={() => setStep('ENTRY')}
          style={{ marginTop: '24px' }}
        >
          戻る
        </Button>
      </Card>
    </div>
  );

  const renderSurvey = () => (
    <div style={{ padding: '20px' }}>
      <Typography.Title level={4} style={{ textAlign: 'center', marginBottom: '24px' }}>気になる悩みを選択してください</Typography.Title>
      <Row gutter={[16, 16]}>
        {CONCERNS_OPTIONS.map(opt => (
          <Col xs={12} key={opt.id}>
            <Card
              hoverable
              onClick={() => toggleConcern(opt.label)}
              style={{
                borderRadius: '12px',
                textAlign: 'center',
                border: selectedConcerns.includes(opt.label) ? '2px solid #D4AF37' : '1px solid #f0f0f0',
                background: selectedConcerns.includes(opt.label) ? '#fffdf5' : '#fff'
              }}
              styles={{ body: { padding: '16px' } }}
            >
              <div style={{ fontSize: '1.5rem', marginBottom: '8px' }}>{opt.icon}</div>
              <Typography.Text strong={selectedConcerns.includes(opt.label)}>{opt.label}</Typography.Text>
            </Card>
          </Col>
        ))}
      </Row>

      <div style={{ marginTop: '40px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <Button
          type="primary"
          size="large"
          onClick={runAnalysis}
          disabled={!image && selectedConcerns.length === 0}
          style={{ height: '54px', borderRadius: '27px', fontSize: '1.1rem' }}
        >
          分析を開始する
        </Button>
        <Button
          type="text"
          onClick={() => setStep('ENTRY')}
          style={{ color: '#888' }}
        >
          キャンセル
        </Button>
      </div>
      {error && <Alert message={error} type="error" showIcon style={{ marginTop: '20px' }} />}
    </div>
  );

  const renderLoading = () => (
    <div style={{ padding: '100px 20px', textAlign: 'center' }}>
      <Spin indicator={<LoadingOutlined style={{ fontSize: 48, color: '#D4AF37' }} spin />} />
      <Typography.Title level={4} style={{ marginTop: '24px' }}>AI가 상태를 분석 중입니다...</Typography.Title>
      <Typography.Paragraph type="secondary">少々お待ちください</Typography.Paragraph>
    </div>
  );

  const renderResult = () => {
    if (!result) return null;
    return (
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ padding: '20px' }}>
        <Card style={{ borderRadius: '24px', overflow: 'hidden', border: 'none', boxShadow: '0 8px 24px rgba(0,0,0,0.08)' }}>
          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <Tag color="gold" style={{ fontSize: '14px', padding: '4px 16px', borderRadius: '20px', marginBottom: '16px' }}>
              {result.faceType}
            </Tag>
            <Typography.Title level={2} style={{ margin: 0 }}>肌分析レポート</Typography.Title>
          </div>

          <Row gutter={24} style={{ marginBottom: '32px' }}>
            <Col span={12}>
              <Statistic
                title={<Typography.Text type="secondary">推定肌年齢</Typography.Text>}
                value={result.skinAge}
                suffix={<Typography.Text style={{ fontSize: '14px' }}>才</Typography.Text>}
                styles={{ content: { color: '#D4AF37', fontWeight: 700 } }}
              />
            </Col>
            <Col span={12}>
              <Statistic
                title={<Typography.Text type="secondary">健康スコア</Typography.Text>}
                value={result.scores[0] || 85}
                suffix={<Typography.Text style={{ fontSize: '14px' }}>%</Typography.Text>}
                styles={{ content: { color: '#52c41a', fontWeight: 700 } }}
              />
            </Col>
          </Row>

          {image && (
            <div style={{ textAlign: 'center', marginBottom: '32px' }}>
              <Image
                src={image}
                alt="分析画像"
                width={200}
                height={200}
                style={{ borderRadius: '16px', objectFit: 'cover', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                unoptimized
              />
            </div>
          )}

          <div style={{ marginBottom: '32px' }}>
            <Typography.Title level={4}><BulbOutlined /> AIアドバイス</Typography.Title>
            <Typography.Paragraph style={{ background: '#f9f9f9', padding: '16px', borderRadius: '12px' }}>
              {result.message || '日々のケアに加えて、専門的な施術を組み合わせることでより高い効果가 기대됩니다.'}
            </Typography.Paragraph>
          </div>

          {result.recommendations && result.recommendations.length > 0 && (
            <div style={{ marginBottom: '32px' }}>
              <Typography.Title level={4}><HeartOutlined /> おすすめの施術</Typography.Title>
              <Space orientation="vertical" style={{ width: '100%' }} size="middle">
                {result.recommendations.map((rec, i) => (
                  <Card key={i} size="small" style={{ borderRadius: '12px', border: '1px solid #f0f0f0' }}>
                    <Typography.Title level={5} style={{ margin: 0, color: '#D4AF37' }}>{rec.name}</Typography.Title>
                    <Typography.Text type="secondary" style={{ fontSize: '13px' }}>{rec.description}</Typography.Text>
                    <Divider style={{ margin: '8px 0' }} />
                    <Typography.Text strong>{rec.price_range}</Typography.Text>
                  </Card>
                ))}
              </Space>
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <Button
              type="primary"
              size="large"
              icon={<ShopOutlined />}
              onClick={() => router.push('/hospitals')}
              style={{ height: '54px', borderRadius: '27px', fontSize: '1.1rem' }}
            >
              クリニックを探す
            </Button>
            <Button
              icon={<ReloadOutlined />}
              onClick={() => setStep('ENTRY')}
              style={{ height: '54px', borderRadius: '27px' }}
            >
              もう一度分析する
            </Button>
          </div>
        </Card>
      </motion.div>
    );
  };

  const getStepNumber = () => {
    switch (step) {
      case 'ENTRY': return 0;
      case 'UPLOAD': return 1;
      case 'SURVEY': return 2;
      case 'ANALYZING': return 2;
      case 'RESULT': return 3;
      default: return 0;
    }
  };

  return (
    <div className={styles.container} style={{ maxWidth: '600px', margin: '0 auto', paddingTop: '80px' }}>
      <div style={{ padding: '0 20px 40px' }}>
        <Steps
          size="small"
          current={getStepNumber()}
          items={[
            { title: '選択' },
            { title: '準備' },
            { title: '分析' },
            { title: '結果' },
          ]}
          style={{ marginBottom: '40px' }}
        />

        <Typography.Title level={2} style={{ textAlign: 'center', marginBottom: '32px' }}>AI肌分析</Typography.Title>

        {step === 'ENTRY' && renderEntry()}
        {step === 'UPLOAD' && renderUpload()}
        {step === 'SURVEY' && renderSurvey()}
        {step === 'ANALYZING' && renderLoading()}
        {step === 'RESULT' && renderResult()}
      </div>
    </div>
  );
}

export default function AnalysisPage() {
  return (
    <Suspense fallback={<div className={styles.container} style={{ textAlign: 'center', padding: '100px' }}><Spin size="large" /></div>}>
      <AnalysisContent />
    </Suspense>
  );
}
