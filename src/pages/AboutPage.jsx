import React from 'react';
import Navbar from '../components/shared/Navbar';
import Footer from '../components/shared/Footer';
import styles from './InfoPage.module.css';
export default function AboutPage() {
  return (<><Navbar /><div className={styles.page}><div className={styles.container}>
    <h1 className={styles.title}>عن منصة القرآن للفيديو</h1>
    <div className={styles.content}>
      <p>منصة القرآن للفيديو هي مبادرة تطوعية تهدف إلى تيسير نشر كتاب الله عز وجل والسنة النبوية المطهرة عبر وسائل التواصل الاجتماعي الحديثة بصورة احترافية وموثوقة.</p>
      <h2>رسالتنا</h2>
      <p>نؤمن بأن التكنولوجيا يجب أن تكون في خدمة الدين، لذلك بنينا أداة تساعد المسلمين على مشاركة آيات القرآن الكريم والأحاديث النبوية بشكل جذاب واحترافي يلائم منصات التواصل الاجتماعي.</p>
      <h2>التزاماتنا</h2>
      <ul>
        <li>دقة النص القرآني من مصادر موثوقة ومعتمدة</li>
        <li>تنبيه المستخدمين دائماً بضرورة مراجعة المحتوى قبل النشر</li>
        <li>عدم عرض أحاديث بدون ذكر مصدرها</li>
        <li>احترام الخصوصية وعدم بيع بيانات المستخدمين</li>
        <li>المحتوى إسلامي أصيل بدون إضافات مسيئة</li>
      </ul>
      <h2>المصادر</h2>
      <p>نصوص القرآن الكريم مجلوبة من واجهة برمجية <strong>alquran.cloud</strong> الموثوقة بالرواية العثمانية. الأصوات من <strong>EveryAyah.com</strong> بتلاوات قراء معتمدين.</p>
      <h2>تواصل معنا</h2>
      <p>لأي اقتراح أو ملاحظة أو طلب تفعيل VIP، يرجى التواصل عبر صفحة <a href="/contact">الاتصال</a>.</p>
    </div>
  </div></div><Footer /></>);
}
