import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import VideoEditor from '../components/editor/VideoEditor';
import styles from './EditorPage.module.css';
export default function QuranEditorPage() {
  useEffect(() => { document.title = 'محرر الفيديو القرآني | منصة القرآن'; }, []);
  return (
    <div className={styles.editorPage}>
      <div className={styles.editorNav}>
        <Link to="/" className={styles.backBtn}>← الرئيسية</Link>
        <div className={styles.navTitle}><span className={styles.navIcon}>📖</span><span>محرر قرآني</span></div>
        <div className={styles.navLinks}>
          <Link to="/editor/sunnah">🌙 حديث</Link>
          <Link to="/editor/custom">✍️ مخصص</Link>
          <Link to="/dashboard">👤 حسابي</Link>
        </div>
      </div>
      <VideoEditor mode="quran" />
    </div>
  );
}
