'use client';

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import styles from './Auth.module.css';

interface AuthProps {
    onLoginSuccess?: () => void;
}

export default function Auth({ onLoginSuccess }: AuthProps) {
    const { signInWithEmail, signUpWithEmail, signInWithProvider } = useAuth();
    const [mode, setMode] = useState<'LOGIN' | 'SIGNUP'>('LOGIN');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccessMessage('');

        if (!email || !password) {
            setError('メールアドレスとパスワードを入力してください。');
            return;
        }
        if (password.length < 6) {
            setError('パスワードは6文字以上必要です。');
            return;
        }

        setLoading(true);
        try {
            if (mode === 'LOGIN') {
                const { error: err } = await signInWithEmail(email, password);
                if (err) {
                    setError('ログイン失敗: メールアドレスまたはパスワードが正しくありません。');
                } else {
                    if (onLoginSuccess) onLoginSuccess();
                }
            } else {
                const { error: err } = await signUpWithEmail(email, password);
                if (err) {
                    setError(`登録失敗: ${err}`);
                } else {
                    setSuccessMessage('確認メールを送信しました。メールをご確認ください。');
                }
            }
        } catch {
            setError('エラーが発生しました。もう一度お試しください。');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <div className={styles.logoArea}>✨</div>
                <h2 className={styles.title}>
                    {mode === 'LOGIN' ? 'ログイン' : '新規会員登録'}
                </h2>
                <p className={styles.message}>
                    {mode === 'LOGIN' ? 'AUREUM BEAUTYへようこそ' : 'AUREUM BEAUTYに参加する'}
                </p>
            </div>

            {/* Social Login */}
            <div className={styles.socialArea}>
                <button
                    className={styles.socialBtn}
                    style={{ background: '#fff', border: '1px solid #ddd', color: '#333' }}
                    onClick={() => signInWithProvider('google')}
                >
                    <span style={{ fontSize: '1.2rem' }}>G</span>
                    Googleで続ける
                </button>
            </div>

            <div className={styles.divider}>
                <span>または</span>
            </div>

            {/* Email Form */}
            <form onSubmit={handleSubmit} className={styles.form}>
                <div className={styles.inputGroup}>
                    <label className={styles.label}>メールアドレス</label>
                    <input
                        type="email"
                        className={styles.input}
                        placeholder="you@example.com"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        autoComplete="email"
                    />
                </div>
                <div className={styles.inputGroup}>
                    <label className={styles.label}>パスワード</label>
                    <input
                        type="password"
                        className={styles.input}
                        placeholder="6文字以上"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        autoComplete={mode === 'LOGIN' ? 'current-password' : 'new-password'}
                    />
                </div>

                {error && <p className={styles.error}>{error}</p>}
                {successMessage && <p className={styles.success}>{successMessage}</p>}

                <button
                    type="submit"
                    className={styles.submitBtn}
                    disabled={loading}
                >
                    {loading ? '処理中...' : mode === 'LOGIN' ? 'ログイン' : '会員登録'}
                </button>
            </form>

            <p className={styles.switchMode}>
                {mode === 'LOGIN' ? (
                    <>アカウントをお持ちでない方？ <button onClick={() => { setMode('SIGNUP'); setError(''); setSuccessMessage(''); }}>新規登録</button></>
                ) : (
                    <>既にアカウントをお持ちの方？ <button onClick={() => { setMode('LOGIN'); setError(''); setSuccessMessage(''); }}>ログイン</button></>
                )}
            </p>
        </div>
    );
}
