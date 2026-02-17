'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import {
  Tabs,
  Card,
  Typography,
  Tag,
  Button,
  Row,
  Col,
  Empty,
  Space
} from 'antd';
import {
  ArrowLeftOutlined,
  ArrowRightOutlined,
  StarOutlined,
  SafetyOutlined,
  GlobalOutlined
} from '@ant-design/icons';
import styles from '../hospitals.module.css';
import { CLINIC_CATEGORIES, INITIAL_CLINICS } from '@/data/clinics';

export default function HospitalsPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState(CLINIC_CATEGORIES[0].id);
  const [clinics] = useState(INITIAL_CLINICS);

  const filteredClinics = clinics.filter((clinic) => clinic.category === activeTab);

  const items = CLINIC_CATEGORIES.map(category => ({
    key: category.id,
    label: category.label,
  }));

  return (
    <div className={styles.container} style={{ maxWidth: '800px', margin: '0 auto', padding: '80px 20px 40px' }}>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '32px', position: 'relative' }}>
        <Button
          type="text"
          icon={<ArrowLeftOutlined />}
          onClick={() => router.back()}
          style={{ position: 'absolute', left: 0 }}
        />
        <Typography.Title level={2} style={{ margin: '0 auto' }}>おすすめクリニック</Typography.Title>
      </div>

      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        items={items}
        centered
        style={{ marginBottom: '32px' }}
      />

      <div className={styles.list}>
        {filteredClinics.length > 0 ? (
          <Row gutter={[24, 24]}>
            {filteredClinics.map((clinic) => (
              <Col xs={24} key={clinic.id}>
                <Card
                  hoverable
                  style={{ borderRadius: '16px', overflow: 'hidden', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}
                  styles={{ body: { padding: 0 } }}
                >
                  <Row>
                    <Col xs={24} sm={8}>
                      <div style={{ position: 'relative', height: '200px', width: '100%' }}>
                        <Image
                          src={clinic.image}
                          alt={clinic.name}
                          fill
                          style={{ objectFit: 'cover' }}
                          sizes="(max-width: 768px) 100vw, 300px"
                          unoptimized
                        />
                        <Tag
                          color="gold"
                          style={{
                            position: 'absolute',
                            top: '12px',
                            left: '12px',
                            margin: 0,
                            borderRadius: '4px',
                            fontWeight: 700
                          }}
                        >
                          No. {clinic.rank}
                        </Tag>
                      </div>
                    </Col>
                    <Col xs={24} sm={16}>
                      <div style={{ padding: '20px' }}>
                        <Typography.Title level={4} style={{ margin: '0 0 8px 0' }}>{clinic.name}</Typography.Title>
                        <Typography.Paragraph ellipsis={{ rows: 2 }} type="secondary" style={{ marginBottom: '16px' }}>
                          {clinic.description}
                        </Typography.Paragraph>
                        <Space size={[0, 8]} wrap style={{ marginBottom: '20px' }}>
                          <Tag icon={<StarOutlined />} color="processing">人気</Tag>
                          <Tag icon={<GlobalOutlined />} color="success">日本語対応</Tag>
                          <Tag icon={<SafetyOutlined />} color="warning">安全認証</Tag>
                        </Space>
                        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                          <Link href={`/hospitals/${clinic.id}`}>
                            <Button type="primary" icon={<ArrowRightOutlined />} iconPlacement="end">
                              詳細を見る
                            </Button>
                          </Link>
                        </div>
                      </div>
                    </Col>
                  </Row>
                </Card>
              </Col>
            ))}
          </Row>
        ) : (
          <Empty description="該当するクリニックがありません" style={{ padding: '60px 0' }} />
        )}
      </div>

      <div style={{ marginTop: '60px', textAlign: 'center' }}>
        <Link href="/admin/hospitals">
          <Typography.Text type="secondary" style={{ fontSize: '12px', cursor: 'pointer' }}>管理画面（開発用）</Typography.Text>
        </Link>
      </div>
    </div>
  );
}

