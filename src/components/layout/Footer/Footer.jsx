import { Link } from 'react-router-dom';
import { useConfig } from 'context/ConfigContext';
import FooterLogo from 'components/layout/FooterLogo/FooterLogo';
import Container from 'components/common/Container/Container';
import styles from "./Footer.module.css";

function scrollToTop() {
  window.scrollTo(0, 0);
  document.documentElement.scrollTop = 0;
  document.body.scrollTop = 0;
}

function FooterRouteLink({ to, className, children }) {
  return (
    <Link to={to} className={className} onClick={scrollToTop}>
      {children}
    </Link>
  );
}

export default function Footer({ goToSection, goToPortal }) {
  const { siteName, navigation, footerColumns } = useConfig();

  const socialLinks = navigation.footer_socials || [];

  const getPageIdFromUrl = (url) => {
    if (url === '/') return 'portal';
    if (url === '/resources') return 'resources';
    if (url === '/tools') return 'tools';
    if (url === '/events') return 'events';
    if (url === '/screen-readers') return 'screen-readers';
    return '';
  };

  const goToPage = (url) => {
    const page = getPageIdFromUrl(url);
    if (page === "portal") {
      if (typeof goToPortal === "function") goToPortal();
      return;
    }
    if (page && typeof goToSection === "function") {
      goToSection(page);
    }
  };

  const renderLink = (l) => {
    if (l.isExternal) {
      return (
        <a
          href={l.url}
          className={styles.colLink}
          target="_blank"
          rel="noopener noreferrer"
        >
          {l.label}
        </a>
      );
    }

    const page = getPageIdFromUrl(l.url);
    if (page) {
      return (
        <button
          type="button"
          className={styles.colLink}
          onClick={() => {
            if (page === 'portal') {
              if (typeof goToPortal === 'function') goToPortal();
            } else if (typeof goToSection === 'function') {
              goToSection(page);
            }
          }}
        >
          {l.label}
        </button>
      );
    }

    return (
      <FooterRouteLink to={l.url} className={styles.colLink}>
        {l.label}
      </FooterRouteLink>
    );
  };

  return (
    <footer className={styles.footer} role="contentinfo">
      <Container className={styles.inner}>
        <div className={styles.top}>
          <div className={styles.brand}>
            <button
              type="button"
              className={styles.brandBtn}
              onClick={() => goToPage("/")}
            >
              <span className={styles.logo}>
                <FooterLogo className={styles.logoImg} width={200} height={60} />
              </span>
            </button>
            <p className={styles.brandDesc}>
               A community for accessibility practitioners, designers,
               developers, and advocates building a more inclusive web.
            </p>
            <nav className={styles.socials} aria-label="Social links">
              {socialLinks.map((s) =>
                s.isExternal ? (
                  <a
                    key={s.label}
                    href={s.url}
                    className={styles.social}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {s.label}
                  </a>
                ) : (
                  <FooterRouteLink key={s.label} to={s.url} className={styles.social}>
                    {s.label}
                  </FooterRouteLink>
                ),
              )}
            </nav>
          </div>

          {footerColumns.map((col) => {
            const colLinks = navigation[`footer_${col.key_name}`] || [];
            return (
              <nav key={col.key_name} className={styles.col} aria-label={col.title}>
                <p className={styles.colHeading}>{col.title}</p>
                <ul className={styles.colLinks}>
                  {colLinks.map((l) => (
                    <li key={l.label}>
                      {renderLink(l)}
                    </li>
                  ))}
                </ul>
              </nav>
            );
          })}
        </div>
        <div className={styles.bottom}>
          <p className={styles.copy}>
            © 2026 {siteName} · Built for the accessibility community
          </p>
          <div className={styles.bottomLinks}>
            <FooterRouteLink className={styles.bottomLink} to="/privacy">
              Privacy
            </FooterRouteLink>
            <FooterRouteLink className={styles.bottomLink} to="/terms">
              Terms
            </FooterRouteLink>
            <FooterRouteLink className={styles.bottomLink} to="/accessibility">
              Accessibility statement
            </FooterRouteLink>
          </div>
        </div>
      </Container>
    </footer>
  );
}
