import { Link } from 'react-router-dom';
import { SITE_NAME } from "../brand";
import FooterLogo from "./FooterLogo";
import styles from "./Footer.module.css";

const COMMUNITY_NAV = [
  { label: "Discussions", page: "portal" },
  { label: "Resources", page: "resources" },
  { label: "Tools", page: "tools" },
  { label: "Events", page: "events" },
  { label: "NVDA Guide", page: "guide" },
];

const STANDARDS_LINKS = [
  { label: "WCAG 2.2", href: "https://www.w3.org/TR/WCAG22/" },
  { label: "ARIA Patterns", href: "https://www.w3.org/WAI/ARIA/apg/" },
  { label: "Section 508", href: "https://www.section508.gov/" },
  { label: "EN 301 549", to: "/en-301-549" },
  {
    label: "EAA 2025",
    href: "https://digital-strategy.ec.europa.eu/en/policies/web-accessibility",
  },
];

const ORG_LINKS = [
  { label: `About ${SITE_NAME}`, type: "app" },
  { label: "News", type: "route", to: "/news" },
  {
    label: "Newsletter",
    type: "external",
    href: "https://www.w3.org/WAI/news/subscribe/",
  },
  { label: "Blog", type: "external", href: "https://www.w3.org/WAI/news/" },
  { label: "Contribute", type: "route", to: "/contribute" },
  { label: "Contact", type: "route", to: "/contact" },
];

const SOCIAL_LINKS = [
  { label: "LinkedIn", href: "https://www.linkedin.com/company/w3c/" },
  { label: "X", href: "https://x.com/w3c/" },
  { label: "GitHub", href: "https://github.com/w3c/wai" },
  { label: "RSS", to: "/news" },
];

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
  const goToPage = (page) => {
    if (page === "portal") {
      if (typeof goToPortal === "function") goToPortal();
      return;
    }
    if (typeof goToSection === "function") goToSection(page);
  };

  return (
    <footer className={styles.footer} role="contentinfo">
      <div className={styles.inner}>
        <div className={styles.top}>
          <div className={styles.brand}>
            <button
              type="button"
              className={styles.brandBtn}
              onClick={() => goToPage("portal")}
            >
              <span className={styles.logo}>
                <FooterLogo className={styles.logoImg} width={200} height={60} />
              </span>
            </button>
            <p className={styles.brandDesc}>
              A community for accessibility practitioners, designers,
              developers, and advocates building a more inclusive web.
            </p>
            <div className={styles.socials} aria-label="Social links">
              {SOCIAL_LINKS.map((s) =>
                s.to ? (
                  <FooterRouteLink key={s.label} to={s.to} className={styles.social}>
                    {s.label}
                  </FooterRouteLink>
                ) : (
                  <a
                    key={s.label}
                    href={s.href}
                    className={styles.social}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {s.label}
                  </a>
                ),
              )}
            </div>
          </div>

          <nav className={styles.col} aria-label="Community">
            <p className={styles.colHeading}>Community</p>
            <ul className={styles.colLinks}>
              {COMMUNITY_NAV.map(({ label, page }) => (
                <li key={label}>
                  <button
                    type="button"
                    className={styles.colLink}
                    onClick={() => goToPage(page)}
                  >
                    {label}
                  </button>
                </li>
              ))}
            </ul>
          </nav>

          <nav className={styles.col} aria-label="Standards">
            <p className={styles.colHeading}>Standards</p>
            <ul className={styles.colLinks}>
              {STANDARDS_LINKS.map((l) => (
                <li key={l.label}>
                  {l.to ? (
                    <FooterRouteLink to={l.to} className={styles.colLink}>
                      {l.label}
                    </FooterRouteLink>
                  ) : (
                    <a
                      href={l.href}
                      className={styles.colLink}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {l.label}
                    </a>
                  )}
                </li>
              ))}
            </ul>
          </nav>

          <nav className={styles.col} aria-label="Organisation">
            <p className={styles.colHeading}>Organisation</p>
            <ul className={styles.colLinks}>
              {ORG_LINKS.map((item) => (
                <li key={item.label}>
                  {item.type === "route" ? (
                    <FooterRouteLink to={item.to} className={styles.colLink}>
                      {item.label}
                    </FooterRouteLink>
                  ) : item.type === "external" ? (
                    <a
                      href={item.href}
                      className={styles.colLink}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {item.label}
                    </a>
                  ) : (
                    <button
                      type="button"
                      className={styles.colLink}
                      onClick={() => goToPortal?.()}
                    >
                      {item.label}
                    </button>
                  )}
                </li>
              ))}
            </ul>
          </nav>
        </div>
        <div className={styles.bottom}>
          <p className={styles.copy}>
            © 2026 {SITE_NAME} · Built for the accessibility community · Not
            affiliated with IAAP or WebAIM
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
      </div>
    </footer>
  );
}
