import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getUserGenerations, signOut } from '../lib/supabase';
import Navbar from '../components/shared/Navbar';
import Footer from '../components/shared/Footer';
import styles from './DashboardPage.module.css';

const TYPE_LABELS = { quran: 'قرآن', sunnah: 'حديث', custom: 'مخصص' };
const STATUS_LABELS = { success: '✅ ناجح', failed: '❌ فشل', pending: '⏳ جارٍ' };

export default function DashboardPage() {
  const { user, profile, loading, todayCount, dailyLimit, remaining, canGenerate, isVIP, isAdmin } = useAuth();
  const [generations, setGenerations] = useState([]);
  const [loadingGen, setLoadingGen] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) navigate('/login', { replace: true });
  }, [user, loading, navigate]);

  useEffect(() => {
    if (user) {
      getUserGenerations(user.id, 10)
        .then(setGenerations)
        .finally(() => setLoadingGen(false));
    }
  }, [user]);

  if (loading) return <div className={styles.pageLoader}><div className={styles.spinner} /></div>;
  if (!user) return null;

  const role = profile?.role || 'free';
  const email = user.email || '';
  const usagePercent = Math.min(100, Math.round((todayCount / dailyLimit) * 100));

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <>
      <Navbar />
      <div className={styles.page}>
        <div className={styles.container}>

          {/* Welcome header */}
          <div className={styles.welcome}>
            <div className={styles.welcomeText}>
              <h1>أهلاً وسهلاً 👋</h1>
              <p>{email}</p>
            </div>
            <div className={styles.welcomeActions}>
              <span className={`${styles.roleBadge} ${styles[`role_${role}`]}`}>
                {role === 'free' ? '🆓 مجاني' : role === 'vip' ? '⭐ VIP' : '🛡️ مدير'}
              </span>
              {isAdmin && (
                <Link to="/admin" className={styles.adminBtn}>لوحة الإدارة</Link>
              )}
              <button className={styles.signOutBtn} onClick={handleSignOut}>
                خروج
              </button>
            </div>
          </div>

          {/* Stats cards */}
          <div className={styles.statsGrid}>
            <div className={styles.statCard}>
              <div className={styles.statIcon}>📊</div>
              <div className={styles.statInfo}>
                <span className={styles.statValue}>{todayCount}</span>
                <span className={styles.statLabel}>فيديو اليوم</span>
              </div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statIcon}>⏳</div>
              <div className={styles.statInfo}>
                <span className={styles.statValue}>{remaining}</span>
                <span className={styles.statLabel}>متبقٍ اليوم</span>
              </div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statIcon}>🎬</div>
              <div className={styles.statInfo}>
                <span className={styles.statValue}>{generations.length}</span>
                <span className={styles.statLabel}>إجمالي الفيديوهات</span>
              </div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statIcon}>{isVIP ? '⭐' : '🆓'}</div>
              <div className={styles.statInfo}>
                <span className={styles.statValue}>{isVIP ? '1080p' : '720p'}</span>
                <span className={styles.statLabel}>جودة التصدير</span>
              </div>
            </div>
          </div>

          {/* Usage bar */}
          <div className={styles.usageCard}>
            <div className={styles.usageHeader}>
              <span>الاستخدام اليومي</span>
              <span>{todayCount} / {dailyLimit} فيديو</span>
            </div>
            <div className={styles.usageBar}>
              <div
                className={`${styles.usageFill} ${usagePercent >= 80 ? styles.usageWarning : ''}`}
                style={{ width: `${usagePercent}%` }}
              />
            </div>
            {!canGenerate && (
              <p className={styles.limitWarning}>
                ⚠️ وصلت إلى الحد اليومي. يتجدد الحد كل يوم عند منتصف الليل.
                {!isVIP && ' قم بالترقية إلى VIP للحصول على 50 فيديو يومياً!'}
              </p>
            )}
          </div>

          {/* Quick Actions */}
          <div className={styles.actionsGrid}>
            <Link
              to="/editor/quran"
              className={`${styles.actionCard} ${!canGenerate ? styles.disabledAction : ''}`}
              onClick={e => !canGenerate && e.preventDefault()}
            >
              <span className={styles.actionIcon}>📖</span>
              <span className={styles.actionLabel}>فيديو قرآني</span>
              <span className={styles.actionDesc}>اختر السورة والآيات</span>
            </Link>
            <Link
              to="/editor/sunnah"
              className={`${styles.actionCard} ${!canGenerate ? styles.disabledAction : ''}`}
              onClick={e => !canGenerate && e.preventDefault()}
            >
              <span className={styles.actionIcon}>🌙</span>
              <span className={styles.actionLabel}>حديث نبوي</span>
              <span className={styles.actionDesc}>أدخل الحديث ومصدره</span>
            </Link>
            <Link
              to="/editor/custom"
              className={`${styles.actionCard} ${!canGenerate ? styles.disabledAction : ''}`}
              onClick={e => !canGenerate && e.preventDefault()}
            >
              <span className={styles.actionIcon}>✍️</span>
              <span className={styles.actionLabel}>نص مخصص</span>
              <span className={styles.actionDesc}>أي نص إسلامي أو دعوي</span>
            </Link>
          </div>

          {/* VIP Upgrade Banner */}
          {!isVIP && (
            <div className={styles.vipBanner}>
              <div className={styles.vipBannerText}>
                <h3>⭐ ترقية إلى VIP</h3>
                <p>استمتع بـ 50 فيديو يومياً، جودة 1080p، بدون علامة مائية، وخلفيات حصرية</p>
              </div>
              <Link to="/pricing" className={styles.vipBtn}>ترقية الآن</Link>
            </div>
          )}

          {/* VIP expiry notice */}
          {isVIP && profile?.vip_expires_at && (
            <div className={styles.vipActive}>
              ⭐ اشتراك VIP نشط — ينتهي في {new Date(profile.vip_expires_at).toLocaleDateString('ar-SA')}
            </div>
          )}

          {/* Recent generations */}
          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>آخر الفيديوهات</h2>
            {loadingGen ? (
              <div className={styles.loadingRows}>
                {[1,2,3].map(i => <div key={i} className={styles.skeletonRow} />)}
              </div>
            ) : generations.length === 0 ? (
              <div className={styles.empty}>
                <span>🎬</span>
                <p>لم تقم بإنشاء أي فيديو بعد. ابدأ الآن!</p>
              </div>
            ) : (
              <div className={styles.genTable}>
                {generations.map(g => (
                  <div key={g.id} className={styles.genRow}>
                    <span className={styles.genType}>{TYPE_LABELS[g.generation_type] || g.generation_type}</span>
                    <span className={styles.genQuality}>{g.quality || '—'}</span>
                    <span className={styles.genStatus}>{STATUS_LABELS[g.status] || g.status}</span>
                    <span className={styles.genDate}>
                      {new Date(g.created_at).toLocaleDateString('ar-SA')}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      </div>
      <Footer />
    </>
  );
}
