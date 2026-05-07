import React from 'react';
import { Link } from 'react-router-dom';
import styles from './Footer.module.css';
export default function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <div className={styles.brand}>
          <Link to="/" className={styles.logo}>🕌 منصة القرآن للفيديو</Link>
          <p className={styles.tagline}>أنشئ فيديوهات قرآنية احترافية وشاركها مع العالم</p>
        </div>
        <div className={styles.links}>
          <div className={styles.col}>
            <h4>المحرر</h4>
            <Link to="/editor/quran">📖 القرآن الكريم</Link>
            <Link to="/editor/sunnah">🌙 الحديث النبوي</Link>
            <Link to="/editor/custom">✍️ نص مخصص</Link>
          </div>
          <div className={styles.col}>
            <h4>الحساب</h4>
            <Link to="/dashboard">لوحة التحكم</Link>
            <Link to="/pricing">الأسعار</Link>
            <Link to="/register">إنشاء حساب</Link>
            <Link to="/login">تسجيل الدخول</Link>
          </div>
          <div className={styles.col}>
            <h4>المنصة</h4>
            <Link to="/about">عن المنصة</Link>
            <Link to="/contact">تواصل معنا</Link>
            <Link to="/privacy">الخصوصية</Link>
            <Link to="/terms">الشروط</Link>
          </div>
        </div>
      </div>
      <div className={styles.bottom}>
        <p>© {year} منصة القرآن للفيديو — جميع الحقوق محفوظة</p>
        <p className={styles.credit}>تنبيه: راجع المحتوى دائماً قبل النشر</p>
      </div>
    </footer>
  );
}
