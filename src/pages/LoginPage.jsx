import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { signIn } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import Navbar from '../components/shared/Navbar';
import styles from './AuthPage.module.css';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  if (user) {
    navigate('/dashboard', { replace: true });
    return null;
  }

  const from = location.state?.from || '/dashboard';

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) { setError('يرجى إدخال البريد الإلكتروني وكلمة المرور'); return; }
    setLoading(true);
    setError('');
    try {
      await signIn(email, password);
      navigate(from, { replace: true });
    } catch (err) {
      setError(getArabicError(err.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <div className={styles.page}>
        <div className={styles.card}>
          <div className={styles.logo}>
            <span className={styles.logoIcon}>🕌</span>
            <h1>منصة القرآن للفيديو</h1>
          </div>
          <h2 className={styles.title}>تسجيل الدخول</h2>
          <p className={styles.subtitle}>أهلاً بعودتك 👋</p>

          {error && <div className={styles.error}>{error}</div>}

          <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.field}>
              <label>البريد الإلكتروني</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="example@email.com"
                autoComplete="email"
                disabled={loading}
              />
            </div>
            <div className={styles.field}>
              <label>كلمة المرور</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                autoComplete="current-password"
                disabled={loading}
              />
            </div>
            <button type="submit" className={styles.submitBtn} disabled={loading}>
              {loading ? <span className={styles.spinner} /> : '🔑 دخول'}
            </button>
          </form>

          <p className={styles.switchLink}>
            ليس لديك حساب؟{' '}
            <Link to="/register">إنشاء حساب جديد</Link>
          </p>
        </div>
      </div>
    </>
  );
}

function getArabicError(msg) {
  if (msg?.includes('Invalid login')) return 'البريد الإلكتروني أو كلمة المرور غير صحيحة';
  if (msg?.includes('Email not confirmed')) return 'يرجى تأكيد بريدك الإلكتروني أولاً';
  if (msg?.includes('Too many requests')) return 'محاولات كثيرة، انتظر قليلاً';
  if (msg?.includes('network')) return 'خطأ في الاتصال، تحقق من الإنترنت';
  return msg || 'حدث خطأ غير متوقع';
}
