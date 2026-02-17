'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import {
    Table,
    Button,
    Input,
    Space,
    Tag,
    Modal,
    Form,
    Typography,
    Card,
    Popconfirm,
    Tooltip,
    Upload,
    Select,
    App
} from 'antd';
import {
    PlusOutlined,
    SearchOutlined,
    EditOutlined,
    DeleteOutlined,
    DownloadOutlined,
    UploadOutlined
} from '@ant-design/icons';
import * as XLSX from 'xlsx';

const { Text } = Typography;
const { TextArea } = Input;

interface Treatment {
    id: string;
    name: string;
    name_en?: string;
    description: string;
    image_url?: string;
    price?: string;
    price_range?: string;
    time?: string;
    downtime?: string;
    concerns: string[];
    category?: string;
}

const CONCERN_OPTIONS = ['たるみ/弾력', '시와', '모아나/나비', '시미/간반', '니키비', '칸조', '아카미'];

export default function TreatmentsPage() {
    const { message: messageApi } = App.useApp();
    const { user } = useAuth();
    const [treatments, setTreatments] = useState<Treatment[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [query, setQuery] = useState('');
    const [form] = Form.useForm();
    const [editingId, setEditingId] = useState<string | null>(null);

    const fetchTreatments = useCallback(async () => {
        setIsLoading(true);
        try {
            const { data, error } = await supabase
                .from('treatments')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setTreatments(data || []);
        } catch (err) {
            messageApi.error('施術データの読み込みに失敗しました');
        } finally {
            setIsLoading(false);
        }
    }, [messageApi]);

    useEffect(() => {
        if (user) {
            fetchTreatments();
        }
    }, [user, fetchTreatments]);

    const filtered = useMemo(() => {
        return treatments.filter(t =>
            t.name.toLowerCase().includes(query.toLowerCase()) ||
            (t.name_en || '').toLowerCase().includes(query.toLowerCase()) ||
            (t.category || '').toLowerCase().includes(query.toLowerCase())
        );
    }, [treatments, query]);

    const handleOpenModal = (treatment?: Treatment) => {
        if (treatment) {
            setEditingId(treatment.id);
            form.setFieldsValue(treatment);
        } else {
            setEditingId(null);
            form.resetFields();
            form.setFieldsValue({ concerns: [], category: 'General' });
        }
        setIsModalOpen(true);
    };

    const onSave = async () => {
        try {
            const values = await form.validateFields();
            setIsLoading(true);

            const payload = {
                ...values,
                price_range: values.price_range || values.price || null,
            };

            if (editingId) {
                const { error } = await supabase.from('treatments').update(payload).eq('id', editingId);
                if (error) throw error;
                messageApi.success('施術情報を更新しました');
            } else {
                const { error } = await supabase.from('treatments').insert({
                    id: crypto.randomUUID(),
                    ...payload,
                });
                if (error) throw error;
                messageApi.success('新しい施術を追加しました');
            }

            setIsModalOpen(false);
            fetchTreatments();
        } catch (error) {
            console.error(error);
            messageApi.error('保存中にエラーが発生しました');
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        try {
            const { error } = await supabase.from('treatments').delete().eq('id', id);
            if (error) throw error;
            messageApi.success('施術を削除しました');
            fetchTreatments();
        } catch (err) {
            messageApi.error('削除に失敗しました');
        }
    };

    const handleExport = () => {
        const data = treatments.map(t => ({
            id: t.id,
            category: t.category,
            name: t.name,
            name_en: t.name_en,
            description: t.description,
            price_range: t.price_range,
            concerns: t.concerns ? t.concerns.join(', ') : ''
        }));

        const ws = XLSX.utils.json_to_sheet(data);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Treatments");
        XLSX.writeFile(wb, "treatments_list.xlsx");
        messageApi.success('Excelファイルを出力しました');
    };

    const handleImport = async (options: any) => {
        const { file } = options;
        const reader = new FileReader();
        reader.onload = async (evt) => {
            try {
                const bstr = evt.target?.result;
                const wb = XLSX.read(bstr, { type: 'binary' });
                const wsname = wb.SheetNames[0];
                const ws = wb.Sheets[wsname];
                const data = XLSX.utils.sheet_to_json(ws);

                setIsLoading(true);
                let count = 0;
                for (const row of data as any[]) {
                    const getVal = (key: string) => {
                        const foundKey = Object.keys(row).find(k => k.toLowerCase() === key.toLowerCase());
                        return foundKey ? row[foundKey] : undefined;
                    };

                    const payload = {
                        name: getVal('name') || '',
                        name_en: getVal('name_en') || '',
                        category: getVal('category') || 'General',
                        description: getVal('description') || '',
                        price_range: getVal('price_range') || null,
                        concerns: getVal('concerns')?.split(',').map((c: string) => c.trim()) || []
                    };

                    const id = getVal('id');
                    if (id) {
                        await supabase.from('treatments').upsert({ id, ...payload });
                    } else {
                        await supabase.from('treatments').insert({ id: crypto.randomUUID(), ...payload });
                    }
                    count++;
                }
                messageApi.success(`${count}건의 시술을 임포트했습니다`);
                fetchTreatments();
            } catch (err) {
                messageApi.error('인포트 중 에러가 발생했습니다');
            } finally {
                setIsLoading(false);
            }
        };
        reader.readAsBinaryString(file as any);
    };

    const columns = [
        {
            title: '施術名 / カテゴリ',
            key: 'name',
            render: (_: any, record: Treatment) => (
                <Space orientation="vertical" size={0}>
                    <Text strong style={{ fontSize: '15px' }}>{record.name}</Text>
                    <Text type="secondary" style={{ fontSize: '12px' }}>{record.name_en || '-'}</Text>
                    <Tag color="blue" style={{ marginTop: 4 }}>{record.category || '未分類'}</Tag>
                </Space>
            )
        },
        {
            title: '説明',
            dataIndex: 'description',
            key: 'description',
            ellipsis: true,
            width: 300
        },
        {
            title: '対応する悩み',
            dataIndex: 'concerns',
            key: 'concerns',
            render: (concerns: string[]) => (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                    {concerns?.map(c => <Tag key={c} color="gold" bordered={false}>{c}</Tag>)}
                </div>
            )
        },
        {
            title: '価格帯',
            dataIndex: 'price_range',
            key: 'price_range',
            render: (text: string) => <Text strong color="#D4AF37">{text || '-'}</Text>
        },
        {
            title: '操作',
            key: 'action',
            width: 150,
            render: (_: any, record: Treatment) => (
                <Space size="middle">
                    <Tooltip title="編集">
                        <Button icon={<EditOutlined />} onClick={() => handleOpenModal(record)} />
                    </Tooltip>
                    <Popconfirm title="本当に削除しますか？" onConfirm={() => handleDelete(record.id)} okText="はい" cancelText="いいえ">
                        <Button danger icon={<DeleteOutlined />} />
                    </Popconfirm>
                </Space>
            )
        },
    ];

    if (!user) {
        return (
            <div style={{ minHeight: '400px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <Text>ログインが必要です。</Text>
            </div>
        );
    }

    return (
        <div>
            <Card variant="borderless" style={{ marginBottom: 24, boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
                    <Input
                        placeholder="施術名、カテゴリで検索"
                        prefix={<SearchOutlined />}
                        value={query}
                        onChange={e => setQuery(e.target.value)}
                        style={{ minWidth: '200px', flex: 1 }}
                    />
                    <Space size="middle" wrap style={{ width: '100%', justifyContent: 'flex-end' }}>
                        <Button icon={<DownloadOutlined />} onClick={handleExport}>Excel出力</Button>
                        <Upload customRequest={handleImport} showUploadList={false}>
                            <Button icon={<UploadOutlined />}>Excel入力</Button>
                        </Upload>
                        <Button type="primary" icon={<PlusOutlined />} onClick={() => handleOpenModal()}>
                            新規追加
                        </Button>
                    </Space>
                </div>
            </Card>

            <div className="admin-table-wrapper">
                <Table
                    columns={columns}
                    dataSource={filtered}
                    rowKey="id"
                    loading={isLoading}
                    pagination={{ pageSize: 12, size: 'small' }}
                    scroll={{ x: 1000 }}
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
                title={editingId ? '施術情報編集' : '新規施術追加'}
                open={isModalOpen}
                onOk={onSave}
                onCancel={() => setIsModalOpen(false)}
                confirmLoading={isLoading}
                width={700}
                okText="保存"
                cancelText="キャンセル"
                style={{ top: 20 }}
                mask={{ closable: false }}
            >
                <Form form={form} layout="vertical" style={{ marginTop: 20 }}>
                    <div className="admin-modal-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 24px' }}>
                        <Form.Item label="施術名 (日本語)" name="name" rules={[{ required: true, message: '施術名を入力してください' }]}>
                            <Input />
                        </Form.Item>
                        <Form.Item label="施術名 (英語)" name="name_en">
                            <Input />
                        </Form.Item>
                        <Form.Item label="カテゴリー" name="category">
                            <Input placeholder="例: リフトアップ" />
                        </Form.Item>
                        <Form.Item label="価格帯" name="price_range">
                            <Input placeholder="例: 400~600만ウォン" />
                        </Form.Item>
                    </div>
                    <Form.Item label="悩み" name="concerns">
                        <Select mode="multiple" placeholder="悩みを選択してください" options={CONCERN_OPTIONS.map(c => ({ value: c, label: c }))} />
                    </Form.Item>
                    <Form.Item label="説明" name="description">
                        <TextArea rows={4} />
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
}
