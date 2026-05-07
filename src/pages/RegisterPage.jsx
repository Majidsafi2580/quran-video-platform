import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { signUp } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import Navbar from '../components/shared/Navbar';
import styles from './AuthPage.module.css';

export default function RegisterPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();

  if (user) { navigate('/dashboard', { replace: true }); return null; }

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) { setError('يرجى ملء جميع الحقول'); return; }
    if (password.length < 6) { setError('كلمة المرور يجب أن تكون 6 أحرف على الأقل'); return; }
    if (password !== confirm) { setError('كلمتا المرور غير متطابقتين'); return; }
    setLoading(true);
    setError('');
    try {
      await signUp(email, password);
      setSuccess(true);
    } catch (err) {
      const msg = err.message || '';
      if (msg.includes('already registered')) setError('هذا البريد مسجّل مسبقاً');
      else if (msg.includes('valid email')) setError('البريد الإلكتروني غير صحيح');
      else setError(msg || 'حدث خطأ غير متوقع');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <>
        <Navbar />
        <div className={styles.page}>
          <div className={styles.card}>
            <div className={styles.successIcon}>✅</div>
            <h2 className={styles.title}>تم إنشاء الحساب!</h2>
            <p className={styles.subtitle}>
              تم إرسال رابط التأكيد إلى بريدك الإلكتروني.<br />
              يرجى التحقق من بريدك للتفعيل.
            </p>
            <Link to="/login" className={styles.submitBtn} style={{ display: 'block', textAlign: 'center', marginTop: '1.5rem' }}>
              🔑 الذهاب لتسجيل الدخول
            </Link>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className={styles.page}>
        <div className={styles.card}>
          <div className={styles.logo}>
            <span className={styles.logoIcon}>🕌</span>
            <h1>منصة القرآن للفيديو</h1>
          </div>
          <h2 className={styles.title}>إنشاء حساب جديد</h2>
          <p className={styles.subtitle}>انضم مجاناً وابدأ إنشاء فيديوهاتك 🎬</p>

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
                placeholder="6 أحرف على الأقل"
                autoComplete="new-password"
                disabled={loading}
              />
            </div>
            <div className={styles.field}>
              <label>تأكيد كلمة المرور</label>
              <input
                type="password"
                value={confirm}
                onChange={e => setConfirm(e.target.value)}
                placeholder="••••••••"
                autoComplete="new-password"
                disabled={loading}
              />
            </div>
            <p className={styles.terms}>
              بالتسجيل، أنت توافق على{' '}
              <Link to="/terms">الشروط والأحكام</Link>{' '}و{' '}
              <Link to="/privacy">سياسة الخصوصية</Link>
            </p>
            <button type="submit" className={styles.submitBtn} disabled={loading}>
              {loading ? <span className={styles.spinner} /> : '🚀 إنشاء الحساب'}
            </button>
          </form>

          <p className={styles.switchLink}>
            لديك حساب؟{' '}
            <Link to="/login">تسجيل الدخول</Link>
          </p>
        </div>
      </div>
    </>
  );
}
