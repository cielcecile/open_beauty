'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import LoginModal from '@/components/LoginModal';
import { Button, Avatar, Dropdown, Space, Typography } from 'antd';
import { UserOutlined, LogoutOutlined, ProfileOutlined, LoginOutlined, SettingOutlined } from '@ant-design/icons';
import type { MenuProps } from 'antd';
import styles from './Header.module.css';
import { checkIsAdmin } from '@/lib/admin';
import { supabase } from '@/lib/supabase';

export default function Header() {
  const { user, loading, signOut } = useAuth();
  const [showLogin, setShowLogin] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    async function verify() {
      if (user?.email) {
        const allowed = await checkIsAdmin(user.email, supabase);
        setIsAdmin(allowed);
      } else {
        setIsAdmin(false);
      }
    }
    verify();
  }, [user]);

  const menuItems: MenuProps['items'] = [
    {
      key: 'email',
      label: <Typography.Text type="secondary" style={{ fontSize: '12px' }}>{user?.email}</Typography.Text>,
      disabled: true,
    },
    {
      type: 'divider',
    },
    {
      key: 'mypage',
      label: <Link href="/mypage" style={{ textDecoration: 'none', color: 'inherit' }}>マイページ</Link>,
      icon: <ProfileOutlined />,
    },
    ...(isAdmin ? [
      {
        key: 'admin',
        label: <Link href="/admin" style={{ textDecoration: 'none', color: 'inherit' }}>管理者ページ</Link>,
        icon: <SettingOutlined />,
      }
    ] : []),
    {
      key: 'logout',
      label: 'ログアウト',
      icon: <LogoutOutlined />,
      danger: true,
      onClick: () => signOut(),
    },
  ];

  return (
    <>
      <header className={styles.header} style={{
        height: '64px',
        padding: '0 20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#fff',
        boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 1000
      }}>
        <Link href="/" className={styles.logo} style={{ fontSize: '1.2rem', display: 'flex', alignItems: 'center', textDecoration: 'none', color: '#D4AF37', fontWeight: 700 }}>
          <Image src="/logo.png" alt="AUREUM" width={28} height={28} style={{ marginRight: '10px' }} />
          AUREUM BEAUTY
        </Link>

        <div style={{ position: 'absolute', right: '20px' }}>
          {loading ? null : user ? (
            <Dropdown menu={{ items: menuItems }} placement="bottomRight" arrow>
              <Avatar
                style={{
                  backgroundColor: '#D4AF37',
                  cursor: 'pointer',
                  border: '2px solid #fff',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                }}
                icon={<UserOutlined />}
              >
                {(user.email?.[0] || 'U').toUpperCase()}
              </Avatar>
            </Dropdown>
          ) : (
            <Button
              type="primary"
              ghost
              icon={<LoginOutlined />}
              onClick={() => setShowLogin(true)}
              style={{ borderRadius: '8px' }}
            >
              ログイン
            </Button>
          )}
        </div>
      </header>

      {showLogin && <LoginModal onClose={() => setShowLogin(false)} />}
    </>
  );
}
