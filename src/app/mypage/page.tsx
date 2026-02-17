'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import Auth from '@/components/Auth';
import { supabase } from '@/lib/supabase';
import {
  Card,
  Avatar,
  Typography,
  Tabs,
  List,
  Button,
  Tag,
  Space,
  Empty,
  Spin,
  Popconfirm
} from 'antd';
import {
  UserOutlined,
  HistoryOutlined,
  HeartOutlined,
  CalendarOutlined,
  ArrowRightOutlined,
  DeleteOutlined,
  MailOutlined
} from '@ant-design/icons';
import styles from './mypage.module.css';

const { Title, Text, Paragraph } = Typography;

interface HistoryItem {
  id: string;
  date: string;
  faceType: string;
  skinAge: number;
  highlight: string;
  score: number;
  imageUrl: string | null;
}

interface SavedTreatment {
  id: string;
  treatment_name: string;
  treatment_price: string;
  created_at: string;
}

type TabKey = 'HISTORY' | 'WISHLIST' | 'RESERVATIONS';

export default function MyPage() {
  const { user, loading } = useAuth();
  const [activeTab, setActiveTab] = useState<TabKey>('HISTORY');
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [wishlist, setWishlist] = useState<SavedTreatment[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    if (!user) return;
    const fetchData = async () => {
      setLoadingData(true);
      try {
        // 1. Fetch History
        const { data: historyData } = await supabase
          .from('analysis_results')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        setHistory((historyData || []).map(row => ({
          id: String(row.id),
          date: new Date(row.created_at).toLocaleDateString('ja-JP'),
          faceType: row.face_type || '不明',
          skinAge: Number(row.skin_age || 0),
          highlight: row.survey_data?.concerns?.[0] || '一般',
          score: row.scores ? Math.round(row.scores.reduce((a: number, b: number) => a + b, 0) / row.scores.length) : 0,
          imageUrl: row.image_url || null
        })));

        // 2. Fetch Wishlist
        const { data: wishlistData } = await supabase
          .from('saved_treatments')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        setWishlist(wishlistData || []);
      } catch (err) {
        console.error('Error fetching data:', err);
      } finally {
        setLoadingData(false);
      }
    };
    void fetchData();
  }, [user]);

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
      <Spin size="large" />
    </div>
  );

  if (!user) return <Auth />;

  const items = [
    {
      key: 'HISTORY',
      label: (
        <span>
          <HistoryOutlined />
          分析履歴
        </span>
      ),
      children: (
        <div style={{ marginTop: '16px' }}>
          {loadingData ? <div style={{ textAlign: 'center', padding: '40px' }}><Spin /></div> : history.length === 0 ? (
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description="まだ分析履歴がありません"
            >
              <Link href="/analysis">
                <Button type="primary" shape="round">AI分析をはじめる</Button>
              </Link>
            </Empty>
          ) : (
            <List
              grid={{ gutter: 16, xs: 1, sm: 2 }}
              dataSource={history}
              renderItem={item => (
                <List.Item>
                  <Card
                    hoverable
                    style={{ borderRadius: '12px', border: 'none', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}
                    actions={[
                      <Link key="view" href={`/analysis?id=${item.id}`} style={{ textDecoration: 'none' }}>
                        <Button type="link" icon={<ArrowRightOutlined />} iconPlacement="end">詳細を見る</Button>
                      </Link>
                    ]}
                  >
                    <Card.Meta
                      avatar={
                        item.imageUrl ? (
                          <Avatar shape="square" size={64} src={item.imageUrl} />
                        ) : (
                          <Avatar shape="square" size={64} icon={<HistoryOutlined />} style={{ backgroundColor: '#f0f0f0', color: '#ccc' }} />
                        )
                      }
                      title={item.faceType}
                      description={
                        <Space orientation="vertical" size={0}>
                          <Typography.Text type="secondary" style={{ fontSize: '12px' }}>{item.date}</Typography.Text>
                          <Typography.Text strong style={{ fontSize: '13px' }}>肌年齢: {item.skinAge}歳</Typography.Text>
                          <Tag color="gold" style={{ marginTop: '4px' }}>スコア: {item.score}</Tag>
                        </Space>
                      }
                    />
                  </Card>
                </List.Item>
              )}
            />
          )}
        </div>
      ),
    },
    {
      key: 'WISHLIST',
      label: (
        <span>
          <HeartOutlined />
          保存リスト
        </span>
      ),
      children: (
        <div style={{ marginTop: '16px' }}>
          {loadingData ? <div style={{ textAlign: 'center', padding: '40px' }}><Spin /></div> : wishlist.length === 0 ? (
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description="保存された施術はありません"
            >
              <Link href="/hospitals">
                <Button type="primary" shape="round">クリニックを探す</Button>
              </Link>
            </Empty>
          ) : (
            <List
              dataSource={wishlist}
              renderItem={item => (
                <List.Item
                  extra={
                    <Popconfirm
                      title="削除しますか？"
                      onConfirm={async () => {
                        await supabase.from('saved_treatments').delete().eq('id', item.id);
                        setWishlist(prev => prev.filter(i => i.id !== item.id));
                      }}
                      okText="はい"
                      cancelText="いいえ"
                    >
                      <Button type="text" danger icon={<DeleteOutlined />} />
                    </Popconfirm>
                  }
                >
                  <List.Item.Meta
                    title={<Typography.Text strong>{item.treatment_name}</Typography.Text>}
                    description={item.treatment_price}
                  />
                </List.Item>
              )}
            />
          )}
        </div>
      ),
    },
    {
      key: 'RESERVATIONS',
      label: (
        <span>
          <CalendarOutlined />
          予約管理
        </span>
      ),
      children: (
        <div style={{ padding: '60px 0' }}>
          <Empty
            image={<CalendarOutlined style={{ fontSize: '48px', color: '#f0f0f0' }} />}
            description={
              <Space orientation="vertical" align="center">
                <Typography.Text>現在、確定した予約はありません</Typography.Text>
                <Typography.Text type="secondary" style={{ fontSize: '12px' }}>予約履歴は各クリニックページから確認できます</Typography.Text>
              </Space>
            }
          />
        </div>
      ),
    },
  ];

  return (
    <div className={styles.container} style={{ maxWidth: '800px', margin: '0 auto', padding: '100px 20px 40px' }}>
      <Card variant="borderless" style={{ borderRadius: '20px', background: 'linear-gradient(135deg, #fff 0%, #fffdf5 100%)', boxShadow: '0 8px 32px rgba(212, 175, 55, 0.08)', marginBottom: '40px' }}>
        <div style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
          <Avatar
            size={80}
            style={{ backgroundColor: '#D4AF37', border: '4px solid #fff', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
            icon={<UserOutlined />}
          >
            {(user.email?.[0] || 'U').toUpperCase()}
          </Avatar>
          <div>
            <Typography.Title level={3} style={{ margin: 0 }}>{user.user_metadata?.full_name || user.email?.split('@')[0]}</Typography.Title>
            <Space orientation="vertical" size={2}>
              <Typography.Text type="secondary"><MailOutlined style={{ marginRight: '8px' }} />{user.email}</Typography.Text>
              <Tag color="gold" style={{ borderRadius: '10px' }}>プレミアム会員</Tag>
            </Space>
          </div>
        </div>
      </Card>

      <Tabs
        activeKey={activeTab}
        onChange={(key) => setActiveTab(key as TabKey)}
        items={items}
        size="large"
      />
    </div>
  );
}
