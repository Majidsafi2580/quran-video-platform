import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Navbar from '../components/shared/Navbar';
import Footer from '../components/shared/Footer';
import styles from './HomePage.module.css';

const FEATURES = [
  { icon:'📖', title:'القرآن الكريم كاملاً',   desc:'جميع السور والآيات مع خطوط قرآنية رسمية معتمدة' },
  { icon:'🎙️', title:'قراء مميزون',              desc:'اختر من 13+ قارئاً عالمياً أو ارفع صوتك الخاص' },
  { icon:'🎬', title:'تصدير فيديو احترافي',      desc:'فيديو عمودي 9:16 بجودة 720p-1080p مناسب للريلز والشورتس' },
  { icon:'🖼️', title:'خلفيات متنوعة',           desc:'صور وتدرجات لونية متعددة مع إمكانية رفع خلفيتك الخاصة' },
  { icon:'✍️', title:'خطوط قرآنية رسمية',       desc:'حفص العثماني، أميري قرآن، مي قرآن، سليم وغيرها' },
  { icon:'📜', title:'الأحاديث النبوية',         desc:'أنشئ فيديوهات للأحاديث مع ذكر المصدر' },
  { icon:'✍️', title:'نصوص مخصصة',              desc:'أي نص إسلامي أو دعوي بتصميم احترافي' },
  { icon:'📱', title:'مُحسَّن للهاتف',          desc:'يعمل بسلاسة على الجوال ويمكن تثبيته كتطبيق PWA' },
];

const STEPS = [
  { num:'1', title:'اختر المحتوى', desc:'قرآن أو حديث أو نص مخصص' },
  { num:'2', title:'صمّم وخصّص', desc:'اختر الخط والألوان والخلفية' },
  { num:'3', title:'أضف الصوت', desc:'اختر قارئاً أو ارفع تلاوتك' },
  { num:'4', title:'صدّر وشارك', desc:'MP4 مباشر للريلز والشورتس' },
];

export default function HomePage() {
  const { user } = useAuth();

  return (
    <>
      <Navbar />
      <div className={styles.page}>
        {/* Hero */}
        <section className={styles.hero}>
          <div className={styles.heroGlow} />
          <div className={styles.heroBadge}>✨ منصة إسلامية مجانية</div>
          <h1 className={styles.heroTitle}>
            أنشئ فيديوهات قرآنية<br />
            <span className={styles.heroGold}>احترافية في دقائق</span>
          </h1>
          <p className={styles.heroDesc}>
            منصة متكاملة لإنشاء فيديوهات قرآنية وإسلامية — مع تلاوة حقيقية، خطوط قرآنية رسمية،
            وتصدير مباشر بجودة مناسبة للريلز وتيك توك ويوتيوب شورتس.
          </p>
          <div className={styles.heroActions}>
            <Link to="/editor/quran" className={styles.heroCTA}>
              🎬 ابدأ الإنشاء مجاناً
            </Link>
            {!user && (
              <Link to="/register" className={styles.heroSecondary}>
                📋 إنشاء حساب
              </Link>
            )}
            {user && (
              <Link to="/admin" className={styles.heroSecondary}>
                   👤 لوحة التحكم
              </Link>
            )}
          </div>
          <div className={styles.heroBadges}>
            <span>📖 114 سورة</span>
            <span>🎙️ 13 قارئ</span>
            <span>🎨 10 قوالب</span>
            <span>📱 PWA</span>
          </div>
        </section>

        {/* Editor type cards */}
        <section className={styles.editorsSection}>
          <h2 className={styles.sectionTitle}>اختر نوع المحتوى</h2>
          <div className={styles.editorsGrid}>
            <Link to="/editor/quran" className={styles.editorCard}>
              <span className={styles.editorIcon}>📖</span>
              <h3>القرآن الكريم</h3>
              <p>اختر السورة والآيات واجمع تلاوة احترافية مع تصميم مميز</p>
              <div className={styles.editorCTA}>ابدأ الآن ←</div>
            </Link>
            <Link to="/editor/sunnah" className={styles.editorCard}>
              <span className={styles.editorIcon}>🌙</span>
              <h3>الحديث النبوي</h3>
              <p>أدخل الحديث ومصدره وأنشئ فيديو بتصميم موثوق ومحترم</p>
              <div className={styles.editorCTA}>ابدأ الآن ←</div>
            </Link>
            <Link to="/editor/custom" className={styles.editorCard}>
              <span className={styles.editorIcon}>✍️</span>
              <h3>نص مخصص</h3>
              <p>أي نص إسلامي أو دعوي أو حكمة بتصميم احترافي</p>
              <div className={styles.editorCTA}>ابدأ الآن ←</div>
            </Link>
          </div>
        </section>

        {/* How it works */}
        <section className={styles.stepsSection}>
          <h2 className={styles.sectionTitle}>كيف يعمل؟</h2>
          <div className={styles.stepsGrid}>
            {STEPS.map(s => (
              <div key={s.num} className={styles.step}>
                <div className={styles.stepNum}>{s.num}</div>
                <h4>{s.title}</h4>
                <p>{s.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Features */}
        <section className={styles.featuresSection}>
          <h2 className={styles.sectionTitle}>كل ما تحتاجه</h2>
          <div className={styles.featuresGrid}>
            {FEATURES.map((f, i) => (
              <div key={i} className={styles.featureCard}>
                <span className={styles.featureIcon}>{f.icon}</span>
                <h4>{f.title}</h4>
                <p>{f.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Religious notice */}
        <section className={styles.noticeSection}>
          <div className={styles.noticeCard}>
            <span className={styles.noticeIcon}>⚠️</span>
            <div>
              <h4>تنبيه مهم</h4>
              <p>يرجى دائماً مراجعة النص والتوقيت قبل نشر أي فيديو. تحقق من صحة الآيات، وتأكد من مصادر الأحاديث، واحرص على احترام القرآن الكريم في كل ما تنشر.</p>
            </div>
          </div>
        </section>

        {/* CTA */}
        {!user && (
          <section className={styles.ctaSection}>
            <h2>ابدأ مجاناً اليوم</h2>
            <p>5 فيديوهات يومياً مجاناً — لا يلزم بطاقة ائتمان</p>
            <div className={styles.ctaActions}>
              <Link to="/register" className={styles.heroCTA}>إنشاء حساب مجاني</Link>
              <Link to="/pricing"  className={styles.heroSecondary}>عرض الأسعار</Link>
            </div>
          </section>
        )}
      </div>
      <Footer />
    </>
  );
}
