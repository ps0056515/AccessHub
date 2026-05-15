import { logoUrl, SITE_NAME } from '../brand';
import styles from './Footer.module.css';

const COMMUNITY_NAV = [
  { label: 'Discussions', page: 'portal' },
  { label: 'Resources', page: 'resources' },
  { label: 'Tools', page: 'tools' },
  { label: 'Events', page: 'events' },
  { label: 'NVDA Guide', page: 'guide' },
];

const STANDARDS_LINKS = [
  { label: 'WCAG 2.2', href: 'https://www.w3.org/TR/WCAG22/' },
  { label: 'ARIA Patterns', href: 'https://www.w3.org/WAI/ARIA/apg/' },
  { label: 'Section 508', href: 'https://www.section508.gov/' },
  { label: 'EN 301 549', href: 'https://www.etsi.org/deliver/etsi_en/301500_301599/301549/' },
  { label: 'EAA 2025', href: 'https://digital-strategy.ec.europa.eu/en/policies/web-accessibility' },
];

const ORG_LINKS = [
  { label: `About ${SITE_NAME}`, type: 'app' },
  {
    label: 'Newsletter',
    type: 'external',
    href: 'https://www.w3.org/WAI/subscribe/',
  },
  { label: 'Blog', type: 'external', href: 'https://www.w3.org/WAI/news/' },
  { label: 'Contribute', type: 'contribute' },
  { label: 'Contact', type: 'external', href: 'https://www.w3.org/WAI/about/contacting-orgs/' },
];

const SOCIAL_LINKS = [
  { label: 'LinkedIn', href: 'https://www.linkedin.com/company/w3c/' },
  { label: 'X', href: 'https://x.com/w3c/' },
  { label: 'GitHub', href: 'https://github.com/w3c/wai' },
  { label: 'RSS', href: 'https://www.w3.org/blog/news/feed/' },
];

export default function Footer({ goToSection, goToPortal }) {
  const goToPage = page => {
    if (page === 'portal') {
      if (typeof goToPortal === 'function') goToPortal();
      return;
    }
    if (typeof goToSection === 'function') goToSection(page);
  };

  const contribute = () => {
    if (typeof goToPortal === 'function') goToPortal();
    queueMicrotask(() => window.dispatchEvent(new CustomEvent('allcanaccess:focus-ask')));
  };

  return (
    <footer className={styles.footer} role="contentinfo">
      <div className={styles.inner}>
        <div className={styles.top}>
          <div className={styles.brand}>
            <button type="button" className={styles.brandBtn} onClick={() => goToPage('portal')}>
              <span className={styles.logo}>
                <img src={logoUrl()} alt="" className={styles.logoImg} width={136} height={40} />
                <span className="sr-only">{SITE_NAME}</span>
              </span>
            </button>
            <p className={styles.brandDesc}>
              A community for accessibility practitioners, designers, developers, and advocates building a more inclusive web.
            </p>
            <div className={styles.socials} aria-label="Social links">
              {SOCIAL_LINKS.map(s => (
                <a
                  key={s.label}
                  href={s.href}
                  className={styles.social}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {s.label}
                </a>
              ))}
            </div>
          </div>

          <nav className={styles.col} aria-label="Community">
            <p className={styles.colHeading}>Community</p>
            <ul className={styles.colLinks}>
              {COMMUNITY_NAV.map(({ label, page }) => (
                <li key={label}>
                  <button type="button" className={styles.colLink} onClick={() => goToPage(page)}>
                    {label}
                  </button>
                </li>
              ))}
            </ul>
          </nav>

          <nav className={styles.col} aria-label="Standards">
            <p className={styles.colHeading}>Standards</p>
            <ul className={styles.colLinks}>
              {STANDARDS_LINKS.map(l => (
                <li key={l.label}>
                  <a href={l.href} className={styles.colLink} target="_blank" rel="noopener noreferrer">
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <nav className={styles.col} aria-label="Organisation">
            <p className={styles.colHeading}>Organisation</p>
            <ul className={styles.colLinks}>
              {ORG_LINKS.map(item => (
                <li key={item.label}>
                  {item.type === 'contribute' ? (
                    <button type="button" className={styles.colLink} onClick={contribute}>
                      {item.label}
                    </button>
                  ) : item.type === 'external' ? (
                    <a href={item.href} className={styles.colLink} target="_blank" rel="noopener noreferrer">
                      {item.label}
                    </a>
                  ) : (
                    <button type="button" className={styles.colLink} onClick={() => goToPortal?.()}>
                      {item.label}
                    </button>
                  )}
                </li>
              ))}
            </ul>
          </nav>
        </div>
        <div className={styles.bottom}>
          <p className={styles.copy}>© 2026 {SITE_NAME} · Built for the accessibility community · Not affiliated with IAAP or WebAIM</p>
          <div className={styles.bottomLinks}>
            <a className={styles.bottomLink} href="https://www.w3.org/policies/privacy/" target="_blank" rel="noopener noreferrer">
              Privacy
            </a>
            <a className={styles.bottomLink} href="https://www.w3.org/policies/" target="_blank" rel="noopener noreferrer">
              Terms
            </a>
            <a className={styles.bottomLink} href="https://www.w3.org/WAI/" target="_blank" rel="noopener noreferrer">
              Accessibility statement
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
