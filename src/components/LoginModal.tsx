'use client';

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import styles from './LoginModal.module.css';

interface LoginModalProps {
  onClose: () => void;
  message?: string;
}

export default function LoginModal({ onClose, message }: LoginModalProps) {
  const { signInWithEmail, signUpWithEmail, signInWithProvider } = useAuth();
  const [mode, setMode] = useState<'LOGIN' | 'SIGNUP'>('LOGIN');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    setSuccessMessage('');

    if (!email || !password) {
      setError('メールアドレスとパスワードを入力してください。');
      return;
    }

    if (password.length < 6) {
      setError('パスワードは6文字以上で入力してください。');
      return;
    }

    setLoading(true);
    try {
      if (mode === 'LOGIN') {
        const { error: authError } = await signInWithEmail(email, password);
        if (authError) {
          setError('ログインに失敗しました。メールアドレスまたはパスワードをご確認ください。');
        } else {
          onClose();
        }
      } else {
        const { error: signupError } = await signUpWithEmail(email, password);
        if (signupError) {
          setError(`新規登録に失敗しました: ${signupError}`);
        } else {
          setSuccessMessage('確認メールを送信しました。メールをご確認ください。');
        }
      }
    } catch {
      setError('エラーが発生しました。しばらくしてから再試行してください。');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(event) => event.stopPropagation()}>
        <button className={styles.closeBtn} onClick={onClose}>×</button>

        <div className={styles.header}>
          <div className={styles.logoArea}>AUREUM</div>
          <h2 className={styles.title}>{mode === 'LOGIN' ? 'ログイン' : '新規会員登録'}</h2>
          {message && <p className={styles.message}>{message}</p>}
        </div>

        <div className={styles.socialArea}>
          <button className={styles.socialBtn} style={{ background: '#fff', border: '1px solid #ddd', color: '#333' }} onClick={() => signInWithProvider('google')}>
            <span style={{ fontSize: '1.2rem' }}>G</span>
            Googleで続ける
          </button>
        </div>

        <div className={styles.divider}><span>または</span></div>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.inputGroup}>
            <label className={styles.label}>メールアドレス</label>
            <input type="email" className={styles.input} placeholder="you@example.com" value={email} onChange={(event) => setEmail(event.target.value)} autoComplete="email" />
          </div>

          <div className={styles.inputGroup}>
            <label className={styles.label}>パスワード</label>
            <input type="password" className={styles.input} placeholder="6文字以上" value={password} onChange={(event) => setPassword(event.target.value)} autoComplete={mode === 'LOGIN' ? 'current-password' : 'new-password'} />
          </div>

          {error && <p className={styles.error}>{error}</p>}
          {successMessage && <p className={styles.success}>{successMessage}</p>}

          <button type="submit" className={styles.submitBtn} disabled={loading}>
            {loading ? '処理中...' : mode === 'LOGIN' ? 'ログイン' : '会員登録'}
          </button>
        </form>

        <p className={styles.switchMode}>
          {mode === 'LOGIN' ? (
            <>アカウントをお持ちでない方は <button onClick={() => { setMode('SIGNUP'); setError(''); setSuccessMessage(''); }}>新規登録</button></>
          ) : (
            <>すでにアカウントをお持ちの方は <button onClick={() => { setMode('LOGIN'); setError(''); setSuccessMessage(''); }}>ログイン</button></>
          )}
        </p>
      </div>
    </div>
  );
}
