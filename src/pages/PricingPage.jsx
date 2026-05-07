import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Navbar from '../components/shared/Navbar';
import Footer from '../components/shared/Footer';
import styles from './PricingPage.module.css';

const FREE_FEATURES = [
  { icon: '🎬', text: '5 فيديوهات يومياً' },
  { icon: '📺', text: 'جودة 720p HD' },
  { icon: '💧', text: 'علامة مائية على الفيديو' },
  { icon: '🖼️', text: 'خلفيات مجانية محدودة' },
  { icon: '🔤', text: 'خطوط قرآنية أساسية' },
  { icon: '📱', text: 'صيغة MP4 قابلة للمشاركة' },
  { icon: '📖', text: 'كل سور القرآن الكريم' },
  { icon: '🎙️', text: 'قراء متاحون مجاناً' },
];

const VIP_FEATURES = [
  { icon: '🎬', text: '50 فيديو يومياً' },
  { icon: '🎥', text: 'جودة 1080p Full HD' },
  { icon: '✨', text: 'بدون علامة مائية' },
  { icon: '🖼️', text: 'خلفيات حصرية وخلفيات فيديو' },
  { icon: '🔤', text: 'مكتبة خطوط كاملة' },
  { icon: '⏱️', text: 'فيديوهات أطول مدة' },
  { icon: '🎨', text: 'قوالب تصميم حصرية' },
  { icon: '💾', text: 'حفظ المشاريع وإعادة تحريرها' },
  { icon: '🎙️', text: 'جميع القراء المتاحين' },
  { icon: '⚡', text: 'أولوية في المعالجة' },
  { icon: '📞', text: 'دعم فني مباشر' },
  { icon: '🔄', text: 'تحديثات مجانية مستمرة' },
];

const FAQS = [
  { q: 'هل يمكنني تجربة المنصة مجاناً؟', a: 'نعم! الخطة المجانية تتيح لك إنشاء 5 فيديوهات يومياً بجودة 720p بشكل مجاني تماماً.' },
  { q: 'كيف يتم تفعيل VIP؟', a: 'بعد التواصل معنا وإتمام عملية الدفع، يتم تفعيل حسابك VIP يدوياً في غضون ساعات.' },
  { q: 'هل يتجدد الحد اليومي تلقائياً؟', a: 'نعم، يتجدد عداد الفيديوهات اليومية عند منتصف الليل تلقائياً.' },
  { q: 'هل الفيديوهات تبقى بعد انتهاء الاشتراك؟', a: 'الفيديوهات التي قمت بتحميلها تبقى عندك. لا يتم حذف أي شيء.' },
  { q: 'ما صيغة الفيديو المصدّر؟', a: 'يتم التصدير بصيغة MP4 القياسية المتوافقة مع تيك توك وإنستجرام وغيرها.' },
];

export default function PricingPage() {
  const { isVIP, user } = useAuth();

  return (
    <>
      <Navbar />
      <div className={styles.page}>

        {/* Hero */}
        <div className={styles.hero}>
          <h1>خطط بسيطة وشفافة</h1>
          <p>ابدأ مجاناً، وارتقِ عند الحاجة</p>
        </div>

        {/* Plans */}
        <div className={styles.plansContainer}>
          {/* Free */}
          <div className={styles.planCard}>
            <div className={styles.planHeader}>
              <div className={styles.planName}>مجاني</div>
              <div className={styles.planPrice}>
                <span className={styles.priceNum}>0</span>
                <span className={styles.priceCurrency}>ريال</span>
              </div>
              <div className={styles.planPeriod}>للأبد</div>
            </div>
            <ul className={styles.featureList}>
              {FREE_FEATURES.map((f, i) => (
                <li key={i} className={styles.featureItem}>
                  <span className={styles.featureIcon}>{f.icon}</span>
                  <span>{f.text}</span>
                </li>
              ))}
            </ul>
            <div className={styles.planAction}>
              {user ? (
                isVIP ? (
                  <div className={styles.currentPlan}>خطتك الحالية أعلى ✓</div>
                ) : (
                  <div className={styles.currentPlan}>خطتك الحالية ✓</div>
                )
              ) : (
                <Link to="/register" className={styles.freeBtn}>ابدأ مجاناً</Link>
              )}
            </div>
          </div>

          {/* VIP */}
          <div className={`${styles.planCard} ${styles.vipCard}`}>
            <div className={styles.vipBadge}>⭐ الأكثر شيوعاً</div>
            <div className={styles.planHeader}>
              <div className={styles.planName}>VIP</div>
              <div className={styles.planPrice}>
                <span className={styles.priceNum}>تواصل</span>
              </div>
              <div className={styles.planPeriod}>معنا للتفعيل</div>
            </div>
            <ul className={styles.featureList}>
              {VIP_FEATURES.map((f, i) => (
                <li key={i} className={styles.featureItem}>
                  <span className={styles.featureIcon}>{f.icon}</span>
                  <span>{f.text}</span>
                </li>
              ))}
            </ul>
            <div className={styles.planAction}>
              {isVIP ? (
                <div className={styles.currentPlan}>اشتراكك نشط ✓</div>
              ) : (
                <Link to="/contact" className={styles.vipBtn}>
                  ✨ ترقية إلى VIP
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* Comparison note */}
        <div className={styles.note}>
          <p>
            💡 التفعيل يدوي — تواصل معنا عبر صفحة{' '}
            <Link to="/contact">التواصل</Link>{' '}
            وسيتم تفعيل حسابك خلال ساعات.
          </p>
        </div>

        {/* FAQ */}
        <div className={styles.faqSection}>
          <h2>الأسئلة الشائعة</h2>
          <div className={styles.faqList}>
            {FAQS.map((item, i) => (
              <details key={i} className={styles.faqItem}>
                <summary className={styles.faqQ}>{item.q}</summary>
                <p className={styles.faqA}>{item.a}</p>
              </details>
            ))}
          </div>
        </div>

      </div>
      <Footer />
    </>
  );
}
