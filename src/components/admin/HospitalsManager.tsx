'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import {
  Table,
  Button,
  Input,
  Select,
  Space,
  Tag,
  Modal,
  Form,
  InputNumber,
  Typography,
  Card,
  Popconfirm,
  Tooltip,
  App
} from 'antd';
import {
  PlusOutlined,
  SearchOutlined,
  EditOutlined,
  DeleteOutlined,
  SyncOutlined,
  PhoneOutlined,
  EnvironmentOutlined
} from '@ant-design/icons';

const { Text } = Typography;
const { TextArea } = Input;

type HospitalCategory = 'DERMATOLOGY' | 'PLASTIC' | 'DENTISTRY' | 'ORIENTAL';

interface HospitalRow {
  id: string;
  name: string;
  category: HospitalCategory;
  description: string | null;
  detail_description: string | null;
  address: string | null;
  phone: string | null;
  website: string | null;
  opening_hours: string | null;
  rank: number;
  image: string | null;
}

const CATEGORY_OPTIONS = [
  { value: 'DERMATOLOGY', label: '皮膚科' },
  { value: 'PLASTIC', label: '美容外科' },
  { value: 'DENTISTRY', label: '歯科' },
  { value: 'ORIENTAL', label: '韓方' },
];

const CATEGORY_MAP: Record<HospitalCategory, string> = {
  DERMATOLOGY: '皮膚科',
  PLASTIC: '美容外科',
  DENTISTRY: '歯科',
  ORIENTAL: '韓方',
};

export default function HospitalsManager() {
  const { message: messageApi, notification: notificationApi } = App.useApp();
  const { session } = useAuth();
  const [hospitals, setHospitals] = useState<HospitalRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [ingesting, setIngesting] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<'ALL' | HospitalCategory>('ALL');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form] = Form.useForm();
  const [editingId, setEditingId] = useState<string | null>(null);

  const loadHospitals = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('hospitals')
      .select('*')
      .order('category', { ascending: true })
      .order('rank', { ascending: true })
      .returns<HospitalRow[]>();

    if (error) {
      messageApi.error('病院データの読み込みに失敗しました');
      setLoading(false);
      return;
    }

    setHospitals(data || []);
    setLoading(false);
  }, [messageApi]);

  useEffect(() => {
    void loadHospitals();
  }, [loadHospitals]);

  const filtered = useMemo(() => {
    return hospitals.filter((hospital) => {
      const matchesQuery =
        hospital.name.toLowerCase().includes(query.toLowerCase()) ||
        (hospital.description || '').toLowerCase().includes(query.toLowerCase());
      const matchesCategory = category === 'ALL' || hospital.category === category;
      return matchesQuery && matchesCategory;
    });
  }, [category, hospitals, query]);

  const handleOpenModal = (hospital?: HospitalRow) => {
    if (hospital) {
      setEditingId(hospital.id);
      form.setFieldsValue(hospital);
    } else {
      setEditingId(null);
      form.resetFields();
      form.setFieldsValue({ rank: 1, category: 'DERMATOLOGY' });
    }
    setIsModalOpen(true);
  };

  const onSave = async () => {
    try {
      const values = await form.validateFields();
      setSaving(true);

      const payload = {
        ...values,
        rank: Number(values.rank || 1),
      };

      if (editingId) {
        const { error } = await supabase.from('hospitals').update(payload).eq('id', editingId);
        if (error) throw error;
        messageApi.success('病院情報を更新しました');
      } else {
        const { error } = await supabase.from('hospitals').insert({
          id: crypto.randomUUID(),
          ...payload,
        });
        if (error) throw error;
        messageApi.success('新しい病院を登録しました');
      }

      setIsModalOpen(false);
      void loadHospitals();
    } catch (error) {
      console.error(error);
      messageApi.error('保存中にエラーが発生しました');
    } finally {
      setSaving(false);
    }
  };

  const handleIngest = async (hospitalId: string) => {
    setIngesting(hospitalId);
    try {
      const response = await fetch('/api/admin/ingest', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token}`
        },
        body: JSON.stringify({ hospitalId })
      });
      const res = await response.json();
      if (res.success) {
        notificationApi.success({
          message: 'AI 知識同期完了',
          description: `${res.chunksProcessed}個のデータを学習しました。`,
          placement: 'topRight'
        });
      } else {
        throw new Error(res.error || '更新失敗');
      }
    } catch (err) {
      messageApi.error('AI同期中にエラーが発生しました: ' + (err instanceof Error ? err.message : String(err)));
    } finally {
      setIngesting(null);
    }
  };

  const onDelete = async (id: string) => {
    const { error } = await supabase.from('hospitals').delete().eq('id', id);
    if (error) {
      messageApi.error('削除に失敗しました');
    } else {
      messageApi.success('病院を削除しました');
      void loadHospitals();
    }
  };

  const columns = [
    {
      title: '順位',
      dataIndex: 'rank',
      key: 'rank',
      width: 80,
      render: (rank: number) => <Text strong>{rank}位</Text>
    },
    {
      title: '病院名 / カテゴリ',
      key: 'name',
      render: (_: any, record: HospitalRow) => (
        <Space orientation="vertical" size={0}>
          <Text strong style={{ color: '#D4AF37', fontSize: '15px' }}>{record.name}</Text>
          <Tag color="gold">{CATEGORY_MAP[record.category]}</Tag>
        </Space>
      )
    },
    {
      title: '連絡先 / 住所',
      key: 'contact',
      render: (_: any, record: HospitalRow) => (
        <Space orientation="vertical" size={4}>
          <Text style={{ fontSize: '12px' }} type="secondary"><EnvironmentOutlined /> {record.address || '-'}</Text>
          <Text style={{ fontSize: '12px' }} type="secondary"><PhoneOutlined /> {record.phone || '-'}</Text>
        </Space>
      )
    },
    {
      title: '操作',
      key: 'action',
      width: 250,
      render: (_: any, record: HospitalRow) => (
        <Space size="middle">
          <Tooltip title="編集">
            <Button icon={<EditOutlined />} onClick={() => handleOpenModal(record)} />
          </Tooltip>
          <Tooltip title="AI知識同期">
            <Button
              icon={<SyncOutlined spin={ingesting === record.id} />}
              onClick={() => handleIngest(record.id)}
              disabled={ingesting === record.id}
              loading={ingesting === record.id}
            />
          </Tooltip>
          <Popconfirm title="本当に削除しますか？" onConfirm={() => onDelete(record.id)} okText="はい" cancelText="いいえ">
            <Button danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      )
    },
  ];

  return (
    <div>
      <Card variant="borderless" style={{ marginBottom: 24, boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
        <Space wrap size="middle" style={{ width: '100%', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', flex: 1 }}>
            <Input
              placeholder="病院名で検索"
              prefix={<SearchOutlined />}
              value={query}
              onChange={e => setQuery(e.target.value)}
              style={{ minWidth: '200px', flex: 1 }}
            />
            <Select
              value={category}
              onChange={setCategory}
              style={{ minWidth: '160px', flex: 1 }}
              options={[
                { value: 'ALL', label: 'すべてのカテゴリ' },
                ...CATEGORY_OPTIONS
              ]}
            />
          </div>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => handleOpenModal()}
            style={{ minWidth: 'fit-content' }}
          >
            新規登録
          </Button>
        </Space>
      </Card>

      <div className="admin-table-wrapper">
        <Table
          columns={columns}
          dataSource={filtered}
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 10, size: 'small' }}
          scroll={{ x: 800 }}
          style={{ boxShadow: '0 4px 12px rgba(0,0,0,0.05)', borderRadius: '12px', overflow: 'hidden' }}
        />
      </div>

      <style jsx global>{`
        @media (max-width: 768px) {
          .admin-modal-grid {
            grid-template-columns: 1fr !important;
          }
          .ant-table-pagination-right {
            justify-content: center !important;
            float: none !important;
            display: flex !important;
          }
        }
      `}</style>

      <Modal
        title={editingId ? 'クリニック編集' : 'クリニック登録'}
        open={isModalOpen}
        onOk={onSave}
        onCancel={() => setIsModalOpen(false)}
        confirmLoading={saving}
        width={800}
        okText="保存"
        cancelText="キャンセル"
        style={{ top: 20 }}
        mask={{ closable: false }}
      >
        <Form
          form={form}
          layout="vertical"
          style={{ marginTop: 20 }}
        >
          <div className="admin-modal-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 24px' }}>
            <Form.Item label="クリニック名" name="name" rules={[{ required: true, message: '病院名を入力してください' }]}>
              <Input />
            </Form.Item>
            <Form.Item label="カテゴリ" name="category" rules={[{ required: true }]}>
              <Select options={CATEGORY_OPTIONS} />
            </Form.Item>
            <Form.Item label="住所" name="address">
              <Input />
            </Form.Item>
            <Form.Item label="電話番号" name="phone">
              <Input />
            </Form.Item>
            <Form.Item label="ウェブサイト" name="website">
              <Input />
            </Form.Item>
            <Form.Item label="営業案内" name="opening_hours">
              <Input />
            </Form.Item>
            <Form.Item label="画像URL" name="image">
              <Input placeholder="Unsplash等のURL" />
            </Form.Item>
            <Form.Item label="表示順位" name="rank">
              <InputNumber min={1} style={{ width: '100%' }} />
            </Form.Item>
          </div>
          <Form.Item label="短い紹介文" name="description">
            <Input />
          </Form.Item>
          <Form.Item label="詳細な説明 (AI学習に使用)" name="detail_description" extra="この内容はAIチャットボット의 답변 생성에 사용됩니다.">
            <TextArea rows={6} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
