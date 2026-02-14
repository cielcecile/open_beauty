'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import LoginModal from '@/components/LoginModal';
import styles from './Header.module.css';

export default function Header() {
    const { user, loading, signOut } = useAuth();
    const [showLogin, setShowLogin] = useState(false);
    const [showMenu, setShowMenu] = useState(false);

    return (
        <>
            <header className={styles.header}>
                <Link href="/" className={styles.logo} style={{ fontSize: '1.2rem', margin: '0 auto', display: 'flex', alignItems: 'center' }}>
                    <Image src="/logo.png" alt="AUREUM" width={28} height={28} style={{ marginRight: '10px' }} />
                    AUREUM BEAUTY
                </Link>

                {/* Auth Button — right side */}
                <div style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)' }}>
                    {loading ? null : user ? (
                        <div style={{ position: 'relative' }}>
                            <button
                                onClick={() => setShowMenu(!showMenu)}
                                style={{
                                    background: 'linear-gradient(135deg, #7e3af2, #6c2bd9)',
                                    color: '#fff',
                                    border: 'none',
                                    borderRadius: '50%',
                                    width: '34px',
                                    height: '34px',
                                    fontSize: '0.85rem',
                                    fontWeight: '700',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                }}
                                title={user.email || ''}
                            >
                                {(user.email?.[0] || 'U').toUpperCase()}
                            </button>
                            {showMenu && (
                                <div style={{
                                    position: 'absolute', right: 0, top: '42px',
                                    background: '#fff', borderRadius: '12px',
                                    boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
                                    padding: '0.5rem 0', minWidth: '160px', zIndex: 100,
                                }}>
                                    <div style={{ padding: '0.7rem 1rem', fontSize: '0.8rem', color: '#888', borderBottom: '1px solid #f0f0f0' }}>
                                        {user.email}
                                    </div>
                                    <button
                                        onClick={() => { signOut(); setShowMenu(false); }}
                                        style={{
                                            display: 'block', width: '100%', textAlign: 'left',
                                            padding: '0.7rem 1rem', background: 'none', border: 'none',
                                            cursor: 'pointer', fontSize: '0.9rem', color: '#e53e3e',
                                            fontFamily: 'inherit',
                                        }}
                                    >
                                        ログアウト
                                    </button>
                                </div>
                            )}
                        </div>
                    ) : (
                        <button
                            onClick={() => setShowLogin(true)}
                            style={{
                                background: 'none', border: '1.5px solid #7e3af2',
                                color: '#7e3af2', borderRadius: '8px',
                                padding: '0.35rem 0.8rem', fontSize: '0.8rem',
                                fontWeight: '600', cursor: 'pointer', fontFamily: 'inherit',
                            }}
                        >
                            ログイン
                        </button>
                    )}
                </div>
            </header>

            {showLogin && (
                <LoginModal onClose={() => setShowLogin(false)} />
            )}
        </>
    );
}
