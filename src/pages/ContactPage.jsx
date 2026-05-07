import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import Navbar from '../components/shared/Navbar';
import Footer from '../components/shared/Footer';
import styles from './InfoPage.module.css';
import cStyles from './ContactPage.module.css';

export default function ContactPage() {
  const { user } = useAuth();
  const [form, setForm] = useState({ name:'', email: user?.email || '', subject:'', message:'' });
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);
  const [err, setErr] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) { setErr('يرجى ملء جميع الحقول المطلوبة'); return; }
    setSending(true); setErr('');
    // Simulate send (replace with EmailJS or Supabase edge function)
    await new Promise(r => setTimeout(r, 1000));
    setSent(true); setSending(false);
  };

  return (<><Navbar /><div className={styles.page}><div className={styles.container}>
    <h1 className={styles.title}>تواصل معنا</h1>
    <p className={styles.updated}>نرد خلال 24–48 ساعة</p>
    {sent ? (
      <div className={cStyles.success}>
        <span>✅</span>
        <div>
          <h3>تم الإرسال!</h3>
          <p>سنتواصل معك قريباً على بريدك الإلكتروني.</p>
          <button className={cStyles.resetBtn} onClick={() => { setSent(false); setForm({name:'',email:'',subject:'',message:''}); }}>إرسال رسالة أخرى</button>
        </div>
      </div>
    ) : (
      <form className={cStyles.form} onSubmit={handleSubmit}>
        {err && <div className={cStyles.error}>{err}</div>}
        <div className={cStyles.row}>
          <div className={cStyles.field}>
            <label>الاسم *</label>
            <input value={form.name} onChange={e=>setForm(p=>({...p,name:e.target.value}))} placeholder="اسمك الكريم" disabled={sending} />
          </div>
          <div className={cStyles.field}>
            <label>البريد الإلكتروني *</label>
            <input type="email" value={form.email} onChange={e=>setForm(p=>({...p,email:e.target.value}))} placeholder="email@example.com" disabled={sending} />
          </div>
        </div>
        <div className={cStyles.field}>
          <label>الموضوع</label>
          <select value={form.subject} onChange={e=>setForm(p=>({...p,subject:e.target.value}))} disabled={sending}>
            <option value="">اختر الموضوع</option>
            <option value="vip">طلب تفعيل VIP</option>
            <option value="bug">الإبلاغ عن مشكلة</option>
            <option value="suggestion">اقتراح</option>
            <option value="other">أخرى</option>
          </select>
        </div>
        <div className={cStyles.field}>
          <label>الرسالة *</label>
          <textarea rows={6} value={form.message} onChange={e=>setForm(p=>({...p,message:e.target.value}))} placeholder="اكتب رسالتك هنا..." disabled={sending} />
        </div>
        <button type="submit" className={cStyles.submitBtn} disabled={sending}>
          {sending ? <span className={cStyles.spinner}/> : '📨 إرسال الرسالة'}
        </button>
      </form>
    )}
    <div className={cStyles.altContact}>
      <p>يمكنك أيضاً التواصل عبر:</p>
      <div className={cStyles.contactLinks}>
        <span>📧 البريد: <strong>contact@quranvideo.app</strong></span>
      </div>
    </div>
  </div></div><Footer /></>);
}
