'use client';

import { useEffect } from 'react';
import { Card, Row, Col, Statistic, Table, Tag, Typography } from 'antd';
import {
  UserOutlined,
  CalendarOutlined,
  DollarOutlined,
  RiseOutlined,
  ArrowUpOutlined
} from '@ant-design/icons';

const { Title, Text } = Typography;

const STATS = [
  { label: '本日の訪問数', value: 1284, change: 12, icon: <UserOutlined />, color: '#1890ff' },
  { label: '予約件数', value: 856, change: 8, icon: <CalendarOutlined />, color: '#52c41a' },
  { label: '売上合計', value: 12450000, change: 24, icon: <DollarOutlined />, color: '#faad14' },
  { label: '平均予約単価', value: 14500, change: 5, icon: <RiseOutlined />, color: '#722ed1' },
];

const RESERVATIONS = [
  { key: '1', hospital: 'Aureum Clinic', patient: 'Sato Yuki', date: '2026-02-14 14:00', service: 'Lifting 300shot', amount: '350,000 KRW', status: '予約確定' },
  { key: '2', hospital: 'Lienjang', patient: 'Tanaka Mei', date: '2026-02-15 10:30', service: 'Nose Filler', amount: '1,200,000 KRW', status: '保留中' },
  { key: '3', hospital: 'White Dental', patient: 'Ito Hana', date: '2026-02-15 16:00', service: 'Whitening', amount: '150,000 KRW', status: '完了' },
];

export default function AdminDashboard() {
  useEffect(() => {
    document.title = 'ダッシュボード | Open Beauty 管理者';
  }, []);

  const columns = [
    { title: 'ID', dataIndex: 'key', key: 'key', render: (text: string) => `#${text}` },
    { title: 'クリニック', dataIndex: 'hospital', key: 'hospital', render: (text: string) => <Text strong>{text}</Text> },
    { title: '患者', dataIndex: 'patient', key: 'patient' },
    { title: '日時', dataIndex: 'date', key: 'date' },
    { title: '施術', dataIndex: 'service', key: 'service' },
    { title: '金額', dataIndex: 'amount', key: 'amount' },
    {
      title: '状態',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        let color = 'default';
        if (status === '予約確定') color = 'processing';
        if (status === '完了') color = 'success';
        if (status === '保留中') color = 'warning';
        return <Tag color={color}>{status}</Tag>;
      }
    },
  ];

  return (
    <div>
      <Row gutter={[24, 24]} style={{ marginBottom: 24 }}>
        {STATS.map((stat) => (
          <Col xs={24} sm={12} lg={6} key={stat.label}>
            <Card variant="borderless" style={{ boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
              <Statistic
                title={stat.label}
                value={stat.value}
                prefix={<span style={{ marginRight: 8, color: stat.color }}>{stat.icon}</span>}
                styles={{ content: { fontWeight: 800 } }}
                formatter={(value) => value.toLocaleString()}
              />
              <div style={{ marginTop: 8 }}>
                <Text type="success" style={{ fontSize: '12px' }}>
                  <ArrowUpOutlined /> {stat.change}%
                </Text>
                <Text type="secondary" style={{ fontSize: '12px', marginLeft: 4 }}>
                  前週比
                </Text>
              </div>
            </Card>
          </Col>
        ))}
      </Row>

      <Card
        title={<Title level={4} style={{ margin: 0 }}>最新予約一覧</Title>}
        variant="borderless"
        style={{ boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}
      >
        <Table
          dataSource={RESERVATIONS}
          columns={columns}
          pagination={false}
          scroll={{ x: 'max-content' }}
        />
      </Card>
    </div>
  );
}
