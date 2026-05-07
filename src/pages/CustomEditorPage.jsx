import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import VideoEditor from '../components/editor/VideoEditor';
import styles from './EditorPage.module.css';
export default function CustomEditorPage() {
  useEffect(() => { document.title = 'محرر النص المخصص | منصة القرآن'; }, []);
  return (
    <div className={styles.editorPage}>
      <div className={styles.editorNav}>
        <Link to="/" className={styles.backBtn}>← الرئيسية</Link>
        <div className={styles.navTitle}><span className={styles.navIcon}>✍️</span><span>محرر مخصص</span></div>
        <div className={styles.navLinks}>
          <Link to="/editor/quran">📖 قرآن</Link>
          <Link to="/editor/sunnah">🌙 حديث</Link>
          <Link to="/dashboard">👤 حسابي</Link>
        </div>
      </div>
      <VideoEditor mode="custom" />
    </div>
  );
}
