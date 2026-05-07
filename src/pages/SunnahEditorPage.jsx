import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import VideoEditor from '../components/editor/VideoEditor';
import styles from './EditorPage.module.css';
export default function SunnahEditorPage() {
  useEffect(() => { document.title = 'محرر الحديث النبوي | منصة القرآن'; }, []);
  return (
    <div className={styles.editorPage}>
      <div className={styles.editorNav}>
        <Link to="/" className={styles.backBtn}>← الرئيسية</Link>
        <div className={styles.navTitle}><span className={styles.navIcon}>🌙</span><span>محرر الحديث</span></div>
        <div className={styles.navLinks}>
          <Link to="/editor/quran">📖 قرآن</Link>
          <Link to="/editor/custom">✍️ مخصص</Link>
          <Link to="/dashboard">👤 حسابي</Link>
        </div>
      </div>
      <VideoEditor mode="sunnah" />
    </div>
  );
}
