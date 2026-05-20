import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { logoUrl, SITE_NAME } from '../brand';
import { useAuth } from '../context/AuthContext';
import styles from './Navbar.module.css';

export default function Navbar({ activePage, setActivePage, goToPortal, onSearch }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();
  const { user, signOut, loading: authLoading, isAdmin } = useAuth();

  const visitPortal =
    typeof goToPortal === 'function' ? goToPortal : () => setActivePage('portal');

  const goToJoin = () => {
    if (user) {
      navigate('/join');
      return;
    }
    navigate('/sign-in', { state: { from: '/join' } });
  };

  const links = [
    { id: 'portal',    label: 'Community' },
    { id: 'resources', label: 'Resources' },
    { id: 'tools',     label: 'Tools' },
    { id: 'events',    label: 'Events' },
    { id: 'guide',     label: 'NVDA Guide' },
  ];

  return (
    <header className={styles.header} role="banner">
      <div className={styles.inner}>
        <button
          type="button"
          className={styles.logo}
          onClick={() => visitPortal()}
          aria-label={`${SITE_NAME} home`}
        >
          <img src={logoUrl()} alt="" className={styles.logoImg} width={128} height={40} />
          <span className="sr-only">{SITE_NAME}</span>
          <span className={styles.logoBadge}>Beta</span>
        </button>

        <nav className={styles.nav} aria-label="Main navigation">
          {links.map(l => (
            <button
              key={l.id}
              className={`${styles.navLink} ${activePage === l.id ? styles.active : ''}`}
              onClick={() => setActivePage(l.id)}
              aria-current={activePage === l.id ? 'page' : undefined}
            >
              {l.label}
            </button>
          ))}
        </nav>

        <div className={styles.actions}>
          <button
            type="button"
            className={styles.searchBtn}
            aria-label="Search discussions"
            onClick={() => onSearch?.()}
          >
            <svg width="15" height="15" viewBox="0 0 15 15" fill="none" aria-hidden="true">
              <circle cx="6.5" cy="6.5" r="4.5" stroke="currentColor" strokeWidth="1.4"/>
              <path d="M10 10L13.5 13.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
            </svg>
          </button>
          {!authLoading && !user && (
            <>
              <button
                className={styles.signInBtn}
                type="button"
                onClick={() => navigate('/sign-in')}
              >
                Sign in
              </button>
              <button
                className={styles.joinBtn}
                type="button"
                onClick={() => navigate('/sign-up')}
              >
                Sign up
              </button>
            </>
          )}
          {!authLoading && user && (
            <>
              {isAdmin && (
                <button
                  className={styles.adminBtn}
                  type="button"
                  onClick={() => navigate('/admin')}
                >
                  Admin
                </button>
              )}
              <span className={styles.userLabel} title={user.email}>
                {user.displayName}
              </span>
              <button
                className={styles.signOutBtn}
                type="button"
                onClick={() => signOut()}
              >
                Sign out
              </button>
            </>
          )}
          <button
            className={styles.communityBtn}
            type="button"
            onClick={goToJoin}
          >
            Join community
          </button>
          <button
            className={styles.menuBtn}
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen(o => !o)}
          >
            <span className={`${styles.bar} ${menuOpen ? styles.barOpen1 : ''}`} />
            <span className={`${styles.bar} ${menuOpen ? styles.barOpen2 : ''}`} />
          </button>
        </div>
      </div>

      {menuOpen && (
        <nav className={styles.mobileNav} aria-label="Mobile navigation">
          {links.map(l => (
            <button
              key={l.id}
              className={`${styles.mobileLink} ${activePage === l.id ? styles.mobileActive : ''}`}
              onClick={() => { setActivePage(l.id); setMenuOpen(false); }}
            >
              {l.label}
            </button>
          ))}
          {!authLoading && !user && (
            <>
              <button
                type="button"
                className={styles.mobileLink}
                onClick={() => {
                  navigate('/sign-in');
                  setMenuOpen(false);
                }}
              >
                Sign in
              </button>
              <button
                type="button"
                className={styles.mobileJoin}
                onClick={() => {
                  navigate('/sign-up');
                  setMenuOpen(false);
                }}
              >
                Sign up
              </button>
            </>
          )}
          {!authLoading && user && (
            <>
              {isAdmin && (
                <button
                  type="button"
                  className={styles.mobileLink}
                  onClick={() => {
                    navigate('/admin');
                    setMenuOpen(false);
                  }}
                >
                  Admin dashboard
                </button>
              )}
              <span className={styles.mobileUser}>{user.displayName}</span>
              <button
                type="button"
                className={styles.mobileLink}
                onClick={() => {
                  signOut();
                  setMenuOpen(false);
                }}
              >
                Sign out
              </button>
            </>
          )}
          <button
            type="button"
            className={styles.mobileJoinGhost}
            onClick={() => {
              goToJoin();
              setMenuOpen(false);
            }}
          >
            Join community
          </button>
        </nav>
      )}
    </header>
  );
}
