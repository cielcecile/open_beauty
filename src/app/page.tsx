'use client';

import Link from 'next/link';
import { Button, Typography, Card, Row, Col } from 'antd';
import { StarOutlined } from '@ant-design/icons';
import styles from './page.module.css';

const { Title, Paragraph, Text } = Typography;

export default function Home() {
  return (
    <div className={styles.container}>
      <section className={styles.hero} style={{ padding: '60px 20px', textAlign: 'center' }}>
        <Typography>
          <Title level={1} style={{ fontSize: '2.5rem', marginBottom: '1.5rem', fontWeight: 700 }}>
            AI美容分析で
            <br />
            あなたに合う施術を見つける
          </Title>
          <Paragraph style={{ fontSize: '1.1rem', color: '#666', marginBottom: '2.5rem' }}>
            写真一枚で肌状態を分析し、
            <br />
            おすすめ施術とクリニックを比較できます。
            <br />
            予約までスムーズに進められます。
          </Paragraph>
        </Typography>

        <Link href="/analysis">
          <Button
            type="primary"
            size="large"
            icon={<StarOutlined />}
            style={{
              height: 'auto',
              padding: '16px 40px',
              fontSize: '1.2rem',
              borderRadius: '50px',
              boxShadow: '0 4px 15px rgba(212, 175, 55, 0.3)',
              marginBottom: '40px'
            }}
          >
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <span>AI美容分析をはじめる</span>
              <Text style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.8)' }}>画像アップロードで結果を確認</Text>
            </div>
          </Button>
        </Link>

        <div className={styles.quizSection} style={{ marginTop: '20px' }}>
          <Row gutter={[24, 24]} justify="center">
            <Col xs={24} sm={12}>
              <Link href="/quiz/beauty-type" style={{ textDecoration: 'none' }}>
                <Card
                  hoverable
                  className={styles.quizCard}
                  style={{
                    borderRadius: '20px',
                    border: 'none',
                    background: 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)',
                    height: '100%'
                  }}
                  styles={{ body: { padding: '24px' } }}
                >
                  <div style={{ fontSize: '2rem', marginBottom: '12px' }}>💄</div>
                  <Title level={4} style={{ color: '#fff', margin: 0 }}>ビューティータイプ診断</Title>
                  <Text style={{ color: '#fff', opacity: 0.9 }}>5つの質問で肌タイプを簡単にチェック</Text>
                </Card>
              </Link>
            </Col>
            <Col xs={24} sm={12}>
              <Link href="/quiz/k-beauty" style={{ textDecoration: 'none' }}>
                <Card
                  hoverable
                  className={styles.quizCard}
                  style={{
                    borderRadius: '20px',
                    border: 'none',
                    background: 'linear-gradient(135deg, #84fab0 0%, #8fd3f4 100%)',
                    height: '100%'
                  }}
                  styles={{ body: { padding: '24px' } }}
                >
                  <div style={{ fontSize: '2rem', marginBottom: '12px' }}>🌸</div>
                  <Title level={4} style={{ color: '#fff', margin: 0 }}>K-Beautyスタイル診断</Title>
                  <Text style={{ color: '#fff', opacity: 0.9 }}>あなたに合うK-Beauty施術の方向性を提案</Text>
                </Card>
              </Link>
            </Col>
          </Row>
        </div>
      </section>
    </div>
  );
}
