import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/shared/Navbar';
import styles from './NotFoundPage.module.css';
export default function NotFoundPage() {
  return (<><Navbar /><div className={styles.page}>
    <div className={styles.content}>
      <div className={styles.icon}>🕌</div>
      <h1 className={styles.code}>404</h1>
      <h2 className={styles.title}>الصفحة غير موجودة</h2>
      <p className={styles.desc}>يبدو أن هذه الصفحة ليست موجودة أو تم نقلها.</p>
      <div className={styles.actions}>
        <Link to="/" className={styles.homeBtn}>🏠 الرئيسية</Link>
        <Link to="/editor/quran" className={styles.editorBtn}>🎬 المحرر</Link>
      </div>
    </div>
  </div></>);
}
