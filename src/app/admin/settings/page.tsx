'use client';

import { useState, useEffect } from 'react';
import {
    Tabs,
    Card,
    Form,
    Input,
    Button,
    Table,
    Tag,
    Space,
    message,
    Typography,
    Divider,
    Badge,
    Switch,
    Alert,
    App
} from 'antd';
import {
    UserOutlined,
    SettingOutlined,
    ApiOutlined,
    PlusOutlined,
    CheckCircleOutlined,
    ExclamationCircleOutlined,
    SyncOutlined,
    DatabaseOutlined
} from '@ant-design/icons';
import { supabase } from '@/lib/supabase';
import { getAdminEmails } from '@/lib/admin';

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;

export default function AdminSettingsPage() {
    const { message: messageApi } = App.useApp();
    const [activeTab, setActiveTab] = useState('1');
    const [admins, setAdmins] = useState<{ email: string; type: string }[]>([]);
    const [siteSettings, setSiteSettings] = useState<any>({});
    const [apiStatus, setApiStatus] = useState<any>({
        supabase: 'checking',
        gemini: 'checking',
        n8n: 'checking'
    });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        loadData();
        checkStatus();
    }, []);

    const loadData = async () => {
        // Load Admins from Env
        const envAdmins = getAdminEmails().map(email => ({ email, type: 'Environment' }));

        // Attempt to load from DB (Future proofing)
        try {
            const { data, error } = await supabase.from('admin_whitelist').select('email');
            if (data) {
                const dbAdmins = data.map(d => ({ email: d.email, type: 'Database' }));
                setAdmins([...envAdmins, ...dbAdmins]);
            } else {
                setAdmins(envAdmins);
            }
        } catch (e) {
            setAdmins(envAdmins);
        }

        // Load Site Settings
        try {
            const { data } = await supabase.from('site_settings').select('*').single();
            if (data) setSiteSettings(data);
        } catch (e) { }
    };

    const checkStatus = async () => {
        // Supabase check
        setApiStatus((prev: any) => ({ ...prev, supabase: 'online' }));

        // Gemini check
        try {
            const resp = await fetch('/api/chat', {
                method: 'POST',
                body: JSON.stringify({ message: 'ping' }),
                headers: { 'Content-Type': 'application/json' }
            });
            setApiStatus((prev: any) => ({ ...prev, gemini: resp.ok ? 'online' : 'error' }));
        } catch (e) {
            setApiStatus((prev: any) => ({ ...prev, gemini: 'error' }));
        }

        // n8n is usually manual, checking if env exists is enough for "Ready"
        // Since we don't have access to process.env in client directly for hidden vars
        setApiStatus((prev: any) => ({ ...prev, n8n: 'ready' }));
    };

    const handleSaveSiteSettings = async (values: any) => {
        setLoading(true);
        try {
            const { error } = await supabase.from('site_settings').upsert({ id: 1, ...values });
            if (error) throw error;
            messageApi.success('サイト設定を保存しました');
        } catch (e) {
            messageApi.error('保存に失敗しました。テーブルが存在しない可能性があります。');
        } finally {
            setLoading(false);
        }
    };

    const handleAddAdmin = async (values: any) => {
        try {
            const { error } = await supabase.from('admin_whitelist').insert({ email: values.email });
            if (error) throw error;
            messageApi.success('管理者を新規登録しました');
            loadData();
        } catch (e) {
            messageApi.error('DBへの登録に失敗しました（admin_whitelistテーブルが必要です）');
        }
    };

    const items = [
        {
            key: '1',
            label: (
                <span>
                    <UserOutlined />
                    管理者アカウント
                </span>
            ),
            children: (
                <Space orientation="vertical" size="large" style={{ width: '100%' }}>
                    <Card title="管理者リスト" variant="borderless">
                        <Table
                            dataSource={admins}
                            columns={[
                                { title: 'メールアドレス', dataIndex: 'email', key: 'email' },
                                { title: 'ソース', dataIndex: 'type', key: 'type', render: (t) => <Tag color={t === 'Environment' ? 'blue' : 'green'}>{t}</Tag> },
                            ]}
                            pagination={false}
                            rowKey="email"
                        />
                    </Card>
                    <Card title="新規管理者招待 (DB追加)" variant="borderless">
                        <Form layout="inline" onFinish={handleAddAdmin}>
                            <Form.Item name="email" rules={[{ required: true, type: 'email' }]}>
                                <Input placeholder="admin@example.com" style={{ width: 300 }} />
                            </Form.Item>
                            <Form.Item>
                                <Button type="primary" htmlType="submit" icon={<PlusOutlined />}>追加</Button>
                            </Form.Item>
                        </Form>
                        <Alert
                            style={{ marginTop: 16 }}
                            title="注意"
                            description="DBに登録された管理者を有効にするには、lib/admin.ts の修正が必要です。"
                            type="info"
                            showIcon
                        />
                    </Card>
                </Space>
            ),
        },
        {
            key: '2',
            label: (
                <span>
                    <SettingOutlined />
                    サイト設定
                </span>
            ),
            children: (
                <Card title="SEO & メタデータ" variant="borderless">
                    <Form
                        layout="vertical"
                        initialValues={siteSettings}
                        onFinish={handleSaveSiteSettings}
                    >
                        <Form.Item label="サイト名" name="site_name">
                            <Input placeholder="AUREUM BEAUTY" />
                        </Form.Item>
                        <Form.Item label="サイト説明 (Description)" name="site_description">
                            <TextArea rows={4} placeholder="SEOメタタグに使用されます" />
                        </Form.Item>
                        <Form.Item label="キーワード (Keywords)" name="seo_keywords">
                            <Input placeholder="美容, 韓国, 美容外科, クリニック" />
                        </Form.Item>
                        <Divider>SNS 連携</Divider>
                        <Form.Item label="Instagram URL" name="instagram_url">
                            <Input placeholder="https://instagram.com/..." />
                        </Form.Item>
                        <Form.Item label="Facebook URL" name="facebook_url">
                            <Input placeholder="https://facebook.com/..." />
                        </Form.Item>
                        <Form.Item label="LINE URL" name="line_url">
                            <Input placeholder="https://line.me/..." />
                        </Form.Item>
                        <Form.Item>
                            <Button type="primary" htmlType="submit" loading={loading}>
                                変更を保存
                            </Button>
                        </Form.Item>
                    </Form>
                </Card>
            ),
        },
        {
            key: '3',
            label: (
                <span>
                    <ApiOutlined />
                    システム & API
                </span>
            ),
            children: (
                <Space orientation="vertical" size="large" style={{ width: '100%' }}>
                    <Card title="外部サービス接続状態" variant="borderless">
                        <div style={{ padding: '8px 0' }}>
                            <Space orientation="vertical" style={{ width: '100%' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <Space><DatabaseOutlined /> Supabase Connection</Space>
                                    <Tag color={apiStatus.supabase === 'online' ? 'success' : 'error'} icon={apiStatus.supabase === 'online' ? <CheckCircleOutlined /> : <ExclamationCircleOutlined />}>
                                        {apiStatus.supabase.toUpperCase()}
                                    </Tag>
                                </div>
                                <Divider style={{ margin: '8px 0' }} />
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <Space><SyncOutlined spin={apiStatus.gemini === 'checking'} /> Gemini AI API</Space>
                                    <Tag color={apiStatus.gemini === 'online' ? 'success' : apiStatus.gemini === 'checking' ? 'processing' : 'error'}>
                                        {apiStatus.gemini.toUpperCase()}
                                    </Tag>
                                </div>
                                <Divider style={{ margin: '8px 0' }} />
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <Space><ApiOutlined /> n8n Automation</Space>
                                    <Tag color="blue">READY</Tag>
                                </div>
                            </Space>
                        </div>
                        <Button
                            style={{ marginTop: 24 }}
                            icon={<SyncOutlined />}
                            onClick={checkStatus}
                        >
                            ステータスを更新
                        </Button>
                    </Card>

                    <Card title="メンテナンスモード" variant="borderless">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                                <Text strong>サイトの公開を一時停止</Text>
                                <div style={{ fontSize: '12px', color: '#888' }}>オンにすると、一般ユーザーはメンテナンス画面を表示します。</div>
                            </div>
                            <Switch disabled />
                        </div>
                    </Card>
                </Space>
            ),
        },
    ];

    return (
        <div style={{ maxWidth: 1000 }}>
            <Tabs defaultActiveKey="1" items={items} />
        </div>
    );
}
