import React from 'react';
import Navbar from '../components/shared/Navbar';
import Footer from '../components/shared/Footer';
import styles from './InfoPage.module.css';
export default function PrivacyPage() {
  return (<><Navbar /><div className={styles.page}><div className={styles.container}>
    <h1 className={styles.title}>سياسة الخصوصية</h1>
    <p className={styles.updated}>آخر تحديث: مايو 2025</p>
    <div className={styles.content}>
      <h2>البيانات التي نجمعها</h2>
      <ul>
        <li>البريد الإلكتروني وكلمة المرور المشفرة عند إنشاء الحساب</li>
        <li>سجل عمليات توليد الفيديو (النوع والجودة والتاريخ)</li>
        <li>بيانات الجلسة الأساسية (Supabase Auth)</li>
      </ul>
      <h2>ما لا نجمعه</h2>
      <ul>
        <li>لا نجمع بيانات الفيديوهات التي تصدرها — تُحفظ على جهازك</li>
        <li>لا نبيع بياناتك لأي جهة</li>
        <li>لا نستخدم إعلانات تتبعية</li>
      </ul>
      <h2>كيف نستخدم البيانات</h2>
      <p>نستخدم بريدك للتواصل معك بشأن حسابك فقط. سجل التوليد يُستخدم لتطبيق حدود الخطط اليومية.</p>
      <h2>الاحتفاظ بالبيانات</h2>
      <p>يمكنك طلب حذف حسابك وكل بياناتك في أي وقت عبر صفحة التواصل.</p>
      <h2>ملفات تعريف الارتباط (Cookies)</h2>
      <p>نستخدم cookies أساسية لجلسة تسجيل الدخول فقط — لا cookies إعلانية.</p>
      <h2>تواصل معنا</h2>
      <p>لأي استفسار عن خصوصيتك، تواصل معنا عبر <a href="/contact">صفحة الاتصال</a>.</p>
    </div>
  </div></div><Footer /></>);
}
