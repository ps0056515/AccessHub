import { useState } from 'react';
import styles from './Navbar.module.css';

export default function Navbar({ activePage, setActivePage }) {
  const [menuOpen, setMenuOpen] = useState(false);

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
          className={styles.logo}
          onClick={() => setActivePage('portal')}
          aria-label="AccessHub home"
        >
          <span className={styles.logoMark} aria-hidden="true">A</span>
          <span className={styles.logoText}>AccessHub</span>
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
          <button className={styles.searchBtn} aria-label="Search">
            <svg width="15" height="15" viewBox="0 0 15 15" fill="none" aria-hidden="true">
              <circle cx="6.5" cy="6.5" r="4.5" stroke="currentColor" strokeWidth="1.4"/>
              <path d="M10 10L13.5 13.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
            </svg>
          </button>
          <button className={styles.joinBtn} onClick={() => setActivePage('portal')}>
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
          <button className={styles.mobileJoin} onClick={() => { setActivePage('portal'); setMenuOpen(false); }}>
            Join community
          </button>
        </nav>
      )}
    </header>
  );
}
