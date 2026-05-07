import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  getAllUsers, getAdminStats, getRecentGenerations,
  setUserRole, setUserVIP, updateAdminSetting, getAdminSettings, updateProfile
} from '../lib/supabase';
import Navbar from '../components/shared/Navbar';
import styles from './AdminPage.module.css';

export default function AdminPage() {
  const { user, isAdmin, loading } = useAuth();
  const navigate = useNavigate();

  const [tab, setTab] = useState('overview'); // overview | users | settings | generations
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [generations, setGenerations] = useState([]);
  const [settings, setSettings] = useState({});
  const [loadingData, setLoadingData] = useState(true);
  const [savingSettings, setSavingSettings] = useState(false);
  const [actionMsg, setActionMsg] = useState('');

  useEffect(() => {
    if (!loading && (!user || !isAdmin)) navigate('/', { replace: true });
  }, [user, isAdmin, loading, navigate]);

  const loadData = useCallback(async () => {
    if (!isAdmin) return;
    setLoadingData(true);
    try {
      const [s, u, g, cfg] = await Promise.all([
        getAdminStats(), getAllUsers(), getRecentGenerations(30), getAdminSettings()
      ]);
      setStats(s);
      setUsers(u);
      setGenerations(g);
      setSettings(cfg || {
        free_daily_limit: '5',
        vip_daily_limit: '50',
        watermark_enabled: 'true',
        maintenance_mode: 'false',
      });
    } finally {
      setLoadingData(false);
    }
  }, [isAdmin]);

  useEffect(() => { loadData(); }, [loadData]);

  if (loading) return <div className={styles.center}><div className={styles.spinner} /></div>;
  if (!isAdmin) return null;

  const handleRoleChange = async (userId, role) => {
    try {
      await setUserRole(userId, role);
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, role } : u));
      setActionMsg(`✅ تم تغيير الدور`);
      setTimeout(() => setActionMsg(''), 3000);
    } catch { setActionMsg('❌ فشل تغيير الدور'); }
  };

  const handleVIPActivate = async (userId) => {
    const months = 1;
    const expiresAt = new Date();
    expiresAt.setMonth(expiresAt.getMonth() + months);
    try {
      await setUserVIP(userId, expiresAt.toISOString());
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, role: 'vip', vip_expires_at: expiresAt.toISOString() } : u));
      setActionMsg('✅ تم تفعيل VIP لمدة شهر');
      setTimeout(() => setActionMsg(''), 3000);
    } catch { setActionMsg('❌ فشل تفعيل VIP'); }
  };

  const handleLimitChange = async (userId, limit) => {
    try {
      await updateProfile(userId, { daily_limit: parseInt(limit) });
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, daily_limit: parseInt(limit) } : u));
      setActionMsg('✅ تم تحديث الحد');
      setTimeout(() => setActionMsg(''), 3000);
    } catch { setActionMsg('❌ فشل تحديث الحد'); }
  };

  const saveSettings = async () => {
    setSavingSettings(true);
    try {
      await Promise.all(
        Object.entries(settings).map(([k, v]) => updateAdminSetting(k, v))
      );
      setActionMsg('✅ تم حفظ الإعدادات');
    } catch { setActionMsg('❌ فشل حفظ الإعدادات'); }
    finally {
      setSavingSettings(false);
      setTimeout(() => setActionMsg(''), 3000);
    }
  };

  const TABS = [
    { id: 'overview', label: '📊 نظرة عامة' },
    { id: 'users', label: '👥 المستخدمون' },
    { id: 'settings', label: '⚙️ الإعدادات' },
    { id: 'generations', label: '🎬 التوليدات' },
  ];

  return (
    <>
      <Navbar />
      <div className={styles.page}>
        <div className={styles.container}>
          <div className={styles.pageTitle}>
            <h1>🛡️ لوحة الإدارة</h1>
            <button className={styles.refreshBtn} onClick={loadData}>🔄 تحديث</button>
          </div>

          {actionMsg && <div className={styles.actionMsg}>{actionMsg}</div>}

          {/* Tab Nav */}
          <div className={styles.tabNav}>
            {TABS.map(t => (
              <button
                key={t.id}
                className={`${styles.tabBtn} ${tab === t.id ? styles.activeTab : ''}`}
                onClick={() => setTab(t.id)}
              >
                {t.label}
              </button>
            ))}
          </div>

          {loadingData ? (
            <div className={styles.loading}><div className={styles.spinner} /> جاري التحميل...</div>
          ) : (
            <>
              {/* Overview Tab */}
              {tab === 'overview' && (
                <div className={styles.overviewGrid}>
                  <div className={styles.statCard}>
                    <div className={styles.statIcon}>👥</div>
                    <div className={styles.statVal}>{stats?.totalUsers || 0}</div>
                    <div className={styles.statLabel}>إجمالي المستخدمين</div>
                  </div>
                  <div className={styles.statCard}>
                    <div className={styles.statIcon}>🎬</div>
                    <div className={styles.statVal}>{stats?.todayGenerations || 0}</div>
                    <div className={styles.statLabel}>فيديوهات اليوم</div>
                  </div>
                  <div className={styles.statCard}>
                    <div className={styles.statIcon}>⭐</div>
                    <div className={styles.statVal}>{stats?.vipUsers || 0}</div>
                    <div className={styles.statLabel}>مستخدمو VIP</div>
                  </div>
                  <div className={styles.statCard}>
                    <div className={styles.statIcon}>🆓</div>
                    <div className={styles.statVal}>{(stats?.totalUsers || 0) - (stats?.vipUsers || 0)}</div>
                    <div className={styles.statLabel}>مستخدمو المجاني</div>
                  </div>
                </div>
              )}

              {/* Users Tab */}
              {tab === 'users' && (
                <div className={styles.usersSection}>
                  <p className={styles.count}>{users.length} مستخدم</p>
                  <div className={styles.usersTable}>
                    {users.map(u => (
                      <div key={u.id} className={styles.userRow}>
                        <div className={styles.userEmail}>{u.email}</div>
                        <span className={`${styles.roleBadge} ${styles[`role_${u.role}`]}`}>
                          {u.role === 'free' ? 'مجاني' : u.role === 'vip' ? 'VIP' : 'مدير'}
                        </span>
                        <div className={styles.userActions}>
                          {u.role !== 'vip' && (
                            <button className={styles.actionBtn} onClick={() => handleVIPActivate(u.id)}>
                              ⭐ VIP شهر
                            </button>
                          )}
                          {u.role !== 'admin' && (
                            <button className={styles.actionBtn} onClick={() => handleRoleChange(u.id, 'admin')}>
                              🛡️ مدير
                            </button>
                          )}
                          {u.role !== 'free' && (
                            <button className={`${styles.actionBtn} ${styles.dangerBtn}`} onClick={() => handleRoleChange(u.id, 'free')}>
                              إلغاء
                            </button>
                          )}
                          <input
                            type="number"
                            className={styles.limitInput}
                            defaultValue={u.daily_limit || 5}
                            min={1} max={9999}
                            title="الحد اليومي"
                            onBlur={e => handleLimitChange(u.id, e.target.value)}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Settings Tab */}
              {tab === 'settings' && (
                <div className={styles.settingsSection}>
                  <div className={styles.settingsGrid}>
                    {[
                      { key: 'free_daily_limit', label: 'الحد اليومي - مجاني', type: 'number' },
                      { key: 'vip_daily_limit', label: 'الحد اليومي - VIP', type: 'number' },
                      { key: 'watermark_enabled', label: 'تفعيل العلامة المائية', type: 'boolean' },
                      { key: 'maintenance_mode', label: 'وضع الصيانة', type: 'boolean' },
                    ].map(({ key, label, type }) => (
                      <div key={key} className={styles.settingRow}>
                        <label>{label}</label>
                        {type === 'boolean' ? (
                          <select
                            value={settings[key] || 'false'}
                            onChange={e => setSettings(p => ({ ...p, [key]: e.target.value }))}
                            className={styles.settingInput}
                          >
                            <option value="true">مفعّل</option>
                            <option value="false">معطّل</option>
                          </select>
                        ) : (
                          <input
                            type="number"
                            value={settings[key] || ''}
                            onChange={e => setSettings(p => ({ ...p, [key]: e.target.value }))}
                            className={styles.settingInput}
                          />
                        )}
                      </div>
                    ))}
                  </div>
                  <button className={styles.saveBtn} onClick={saveSettings} disabled={savingSettings}>
                    {savingSettings ? 'جاري الحفظ...' : '💾 حفظ الإعدادات'}
                  </button>
                </div>
              )}

              {/* Generations Tab */}
              {tab === 'generations' && (
                <div className={styles.genSection}>
                  <p className={styles.count}>{generations.length} عملية حديثة</p>
                  <div className={styles.genTable}>
                    {generations.map(g => (
                      <div key={g.id} className={styles.genRow}>
                        <span className={styles.genUser}>{g.profiles?.email || 'مجهول'}</span>
                        <span className={styles.genType}>{g.generation_type}</span>
                        <span className={styles.genQuality}>{g.quality || '—'}</span>
                        <span className={`${styles.genStatus} ${g.status === 'success' ? styles.success : styles.failed}`}>
                          {g.status}
                        </span>
                        <span className={styles.genDate}>
                          {new Date(g.created_at).toLocaleString('ar-SA')}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
}
