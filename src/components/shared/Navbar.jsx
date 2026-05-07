import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { signOut } from '../../lib/supabase';
import styles from './Navbar.module.css';

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { user, isAdmin, isVIP } = useAuth();

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
    setMenuOpen(false);
  };

  const links = [
    { to: '/', label: 'الرئيسية' },
    { to: '/editor/quran', label: 'قرآن' },
    { to: '/editor/sunnah', label: 'حديث' },
    { to: '/editor/custom', label: 'مخصص' },
    { to: '/pricing', label: 'الأسعار' },
    { to: '/about', label: 'عن المنصة' },
  ];

  return (
    <nav className={styles.navbar}>
      <div className={styles.inner}>
        {/* Logo */}
        <Link to="/" className={styles.logo}>
          <span className={styles.logoIcon}>🕌</span>
          <span>القرآن فيديو</span>
        </Link>

        {/* Desktop nav */}
        <div className={styles.desktopLinks}>
          {links.map(l => (
            <Link
              key={l.to}
              to={l.to}
              className={`${styles.link} ${pathname === l.to ? styles.active : ''}`}
            >
              {l.label}
            </Link>
          ))}
        </div>

        {/* Auth buttons */}
        <div className={styles.authArea}>
          {user ? (
            <>
              {isAdmin && (
                <Link to="/admin" className={styles.adminBadge}>🛡️ إدارة</Link>
              )}
              <Link to="/dashboard" className={styles.dashBtn}>
                {isVIP ? '⭐' : '👤'} حسابي
              </Link>
              <button className={styles.outBtn} onClick={handleSignOut}>خروج</button>
            </>
          ) : (
            <>
              <Link to="/login"    className={styles.loginBtn}>دخول</Link>
              <Link to="/register" className={styles.registerBtn}>ابدأ مجاناً</Link>
            </>
          )}

          {/* Mobile menu toggle */}
          <button
            className={styles.menuToggle}
            onClick={() => setMenuOpen(o => !o)}
            aria-label="القائمة"
          >
            {menuOpen ? '✕' : '☰'}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className={styles.mobileMenu}>
          {links.map(l => (
            <Link
              key={l.to}
              to={l.to}
              className={`${styles.mobileLink} ${pathname === l.to ? styles.active : ''}`}
              onClick={() => setMenuOpen(false)}
            >
              {l.label}
            </Link>
          ))}
          <div className={styles.mobileDivider} />
          {user ? (
            <>
              <Link to="/dashboard" className={styles.mobileLink} onClick={() => setMenuOpen(false)}>
                👤 حسابي
              </Link>
              {isAdmin && (
                <Link to="/admin" className={styles.mobileLink} onClick={() => setMenuOpen(false)}>
                  🛡️ لوحة الإدارة
                </Link>
              )}
              <button className={`${styles.mobileLink} ${styles.mobileSignOut}`} onClick={handleSignOut}>
                خروج
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className={styles.mobileLink} onClick={() => setMenuOpen(false)}>دخول</Link>
              <Link to="/register" className={`${styles.mobileLink} ${styles.mobileRegister}`} onClick={() => setMenuOpen(false)}>
                ابدأ مجاناً
              </Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
}
