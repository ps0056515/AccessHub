import styles from './Footer.module.css';

export default function Footer() {
  const cols = [
    { heading: 'Community', links: ['Discussions', 'Resources', 'Tools', 'Events', 'NVDA Guide'] },
    { heading: 'Standards', links: ['WCAG 2.2', 'ARIA Patterns', 'Section 508', 'EN 301 549', 'EAA 2025'] },
    { heading: 'Organisation', links: ['About AccessHub', 'Newsletter', 'Blog', 'Contribute', 'Contact'] },
  ];

  return (
    <footer className={styles.footer} role="contentinfo">
      <div className={styles.inner}>
        <div className={styles.top}>
          <div className={styles.brand}>
            <div className={styles.logo}>
              <span className={styles.logoMark} aria-hidden="true">A</span>
              <span className={styles.logoText}>AccessHub</span>
            </div>
            <p className={styles.brandDesc}>
              A community for accessibility practitioners, designers, developers, and advocates building a more inclusive web.
            </p>
            <div className={styles.socials} aria-label="Social links">
              {['LinkedIn', 'X', 'GitHub', 'RSS'].map(s => (
                <a key={s} href="#" className={styles.social} aria-label={s}>{s}</a>
              ))}
            </div>
          </div>
          {cols.map(col => (
            <nav key={col.heading} className={styles.col} aria-label={col.heading}>
              <p className={styles.colHeading}>{col.heading}</p>
              <ul className={styles.colLinks}>
                {col.links.map(l => (
                  <li key={l}><a href="#" className={styles.colLink}>{l}</a></li>
                ))}
              </ul>
            </nav>
          ))}
        </div>
        <div className={styles.bottom}>
          <p className={styles.copy}>© 2025 AccessHub · Built for the accessibility community · Not affiliated with IAAP or WebAIM</p>
          <div className={styles.bottomLinks}>
            <a href="#" className={styles.bottomLink}>Privacy</a>
            <a href="#" className={styles.bottomLink}>Terms</a>
            <a href="#" className={styles.bottomLink}>Accessibility statement</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
