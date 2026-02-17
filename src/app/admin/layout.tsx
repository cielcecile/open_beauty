'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Layout,
  Menu,
  Avatar,
  Typography,
  ConfigProvider,
  theme,
  Button,
  Dropdown,
  Space,
  App
} from 'antd';
import {
  DashboardOutlined,
  BankOutlined,
  ExperimentOutlined,
  SettingOutlined,
  UserOutlined,
  LogoutOutlined,
  MenuUnfoldOutlined,
  MenuFoldOutlined,
  HomeOutlined,
} from '@ant-design/icons';
import { useAuth } from '@/context/AuthContext';
import { checkIsAdmin } from '@/lib/admin';
import { supabase } from '@/lib/supabase';
import Image from 'next/image';

const { Header, Sider, Content } = Layout;
const { Text, Title } = Typography;

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, loading, signOut } = useAuth();
  const [collapsed, setCollapsed] = useState(false);
  const [isAllowed, setIsAllowed] = useState<boolean | null>(null);

  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    async function verify() {
      if (!loading) {
        if (!user) {
          setIsAllowed(false);
          return;
        }
        const allowed = await checkIsAdmin(user.email, supabase);
        setIsAllowed(allowed);
      }
    }
    verify();
  }, [user, loading]);

  useEffect(() => {
    if (isAllowed === false) {
      router.replace('/');
    }
  }, [isAllowed, router]);

  if (loading || isAllowed === null) {
    return (
      <Layout style={{ minHeight: '100vh', justifyContent: 'center', alignItems: 'center', background: '#f5f5f5' }}>
        <Title level={4}>管理者権限を確認中...</Title>
      </Layout>
    );
  }

  const menuItems = [
    {
      key: '/admin',
      icon: <DashboardOutlined />,
      label: <Link href="/admin">ダッシュボード</Link>,
    },
    {
      key: '/admin/hospitals',
      icon: <BankOutlined />,
      label: <Link href="/admin/hospitals">病院管理</Link>,
    },
    {
      key: '/admin/treatments',
      icon: <ExperimentOutlined />,
      label: <Link href="/admin/treatments">施術管理</Link>,
    },
    {
      key: '/admin/settings',
      icon: <SettingOutlined />,
      label: <Link href="/admin/settings">設定</Link>,
    },
  ];

  const userMenuItems = [
    {
      key: 'home',
      label: <Link href="/">サービスに戻る</Link>,
      icon: <HomeOutlined />,
    },
    {
      key: 'profile',
      label: 'プロフィール',
      icon: <UserOutlined />,
    },
    {
      type: 'divider' as const,
    },
    {
      key: 'logout',
      label: 'ログアウト',
      icon: <LogoutOutlined />,
      danger: true,
      onClick: async () => {
        await signOut();
        router.push('/');
      },
    },
  ];

  const siderWidth = 240;
  const collapsedWidth = isMobile ? 0 : 80;

  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: '#D4AF37',
          borderRadius: 8,
          fontSize: 16,
        },
        components: {
          Layout: {
            headerBg: '#fff',
            siderBg: '#001529',
          },
        },
      }}
    >
      <App>
        <style jsx global>{`
          @media (max-width: 768px) {
            .ant-layout-content {
              padding: 16px !important;
              margin: 16px 8px !important;
            }
            .admin-header-title {
              display: none;
            }
          }
        `}</style>
        <Layout style={{ minHeight: '100vh' }}>
          <Sider
            trigger={null}
            collapsible
            collapsed={collapsed}
            breakpoint="lg"
            collapsedWidth={collapsedWidth}
            onBreakpoint={(broken) => {
              setIsMobile(broken);
              if (broken) setCollapsed(true);
            }}
            width={siderWidth}
            style={{
              overflow: 'auto',
              height: '100vh',
              position: 'fixed',
              left: 0,
              top: 0,
              bottom: 0,
              zIndex: 1001, // Higher than header
            }}
          >
            <div style={{
              height: 64,
              display: 'flex',
              alignItems: 'center',
              padding: '0 24px',
              background: 'rgba(255, 255, 255, 0.05)',
              marginBottom: 16
            }}>
              <Image src="/logo.png" alt="AUREUM" width={32} height={32} />
              {(!collapsed || (isMobile && !collapsed)) && (
                <Title level={5} style={{ color: '#fff', margin: '0 0 0 12px', fontSize: '14px', whiteSpace: 'nowrap' }}>
                  AUREUM ADMIN
                </Title>
              )}
            </div>
            <Menu
              theme="dark"
              mode="inline"
              selectedKeys={[pathname]}
              items={menuItems}
              style={{ borderRight: 0 }}
              onClick={() => {
                if (isMobile) setCollapsed(true);
              }}
            />
          </Sider>
          <Layout style={{
            marginLeft: isMobile ? 0 : (collapsed ? 80 : 240),
            transition: 'all 0.2s',
            minHeight: '100vh'
          }}>
            <Header style={{
              padding: '0 16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              position: 'sticky',
              top: 0,
              zIndex: 1000,
              width: '100%',
              background: '#fff',
              boxShadow: '0 1px 4px rgba(0,21,41,.08)'
            }}>
              <Space>
                <Button
                  type="text"
                  icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
                  onClick={() => setCollapsed(!collapsed)}
                  style={{ fontSize: '16px', width: 48, height: 48 }}
                />
                <Text strong className="admin-header-title" style={{ fontSize: '16px' }}>
                  {pathname === '/admin' && 'ダッシュボード'}
                  {pathname === '/admin/hospitals' && '病院管理'}
                  {pathname === '/admin/treatments' && '施術管理'}
                  {pathname === '/admin/settings' && '設定'}
                </Text>
              </Space>

              <Space size="middle">
                <Dropdown menu={{ items: userMenuItems }} placement="bottomRight" arrow>
                  <Space style={{ cursor: 'pointer' }}>
                    <div style={{ textAlign: 'right', display: isMobile ? 'none' : 'block' }}>
                      <Text strong style={{ display: 'block', fontSize: '12px', lineHeight: '1.2' }}>{user?.email?.split('@')[0]}</Text>
                      <Text type="secondary" style={{ fontSize: '10px' }}>管理者</Text>
                    </div>
                    <Avatar
                      src={`https://ui-avatars.com/api/?name=${user?.email}&background=D4AF37&color=fff`}
                      icon={<UserOutlined />}
                    />
                  </Space>
                </Dropdown>
              </Space>
            </Header>
            <Content style={{ margin: '24px 16px', padding: 24, background: '#fff', borderRadius: 12, minHeight: '100%' }}>
              <div style={{ marginBottom: 24, display: isMobile ? 'block' : 'none' }}>
                <Title level={3} style={{ margin: 0 }}>
                  {pathname === '/admin' && 'ダッシュボード'}
                  {pathname === '/admin/hospitals' && '病院管理'}
                  {pathname === '/admin/treatments' && '施術管理'}
                  {pathname === '/admin/settings' && '設定'}
                </Title>
              </div>
              {children}
            </Content>
            <Layout.Footer style={{ textAlign: 'center', background: '#f5f5f5', padding: '16px 8px' }}>
              AUREUM BEAUTY ADMIN ©2026
            </Layout.Footer>
          </Layout>
          {isMobile && !collapsed && (
            <div
              style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: 'rgba(0,0,0,0.45)',
                zIndex: 1000,
              }}
              onClick={() => setCollapsed(true)}
            />
          )}
        </Layout>
      </App>
    </ConfigProvider>
  );
}
