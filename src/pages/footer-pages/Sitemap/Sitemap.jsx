import { useEffect } from "react";
import { Link } from "react-router-dom";
import Container from "components/common/Container/Container";
import { SITE_NAME } from "brand";
import styles from "./Sitemap.module.css";

const SITEMAP_DATA = [
  {
    title: "Community & Resources",
    links: [
      { path: "/", label: "Community Portal (Home)" },
      { path: "/resources", label: "Resources" },
      { path: "/tools", label: "Tools" },
      { path: "/events", label: "Events" },
      { path: "/screen-readers", label: "Screen Readers" },
    ]
  },
  {
    title: "Content & Articles",
    links: [
      { path: "/articles", label: "Articles & News" },
      { path: "/blog", label: "Blogposts" },
    ]
  },
  {
    title: "Engagement",
    links: [
      { path: "/join", label: "Join the Community" },
      { path: "/auth/signin", label: "Sign In" },
      { path: "/auth/signup", label: "Sign Up" },
    ]
  },
  {
    title: "About & Legal",
    links: [
      { path: "/about-us", label: "About Us" },
      { path: "/accessibility-jobs", label: "Accessibility Jobs" },
      { path: "/contact", label: "Contact" },
      { path: "/contribute", label: "Contribute" },
      { path: "/news", label: "News (Corporate)" },
    ]
  },
  {
    title: "Policies & Standards",
    links: [
      { path: "/accessibility", label: "Accessibility Statement" },
      { path: "/privacy", label: "Privacy Policy" },
      { path: "/terms", label: "Terms of Service" },
      { path: "/en-301-549", label: "EN 301 549" },
    ]
  }
];

export default function Sitemap() {
  useEffect(() => {
    document.title = `Sitemap  ${SITE_NAME}`;
    window.scrollTo(0, 0);
  }, []);

  return (
    <Container className={styles.container}>
      <div className={styles.wrapper}>
        <header className={styles.header}>
          <h1 className={styles.title} tabIndex={-1}>Sitemap</h1>
          <p className={styles.subtitle}>
            A complete directory of all public pages, resources, and policies available on {SITE_NAME}.
          </p>
        </header>

        <div className={styles.grid}>
          {SITEMAP_DATA.map((section, idx) => (
            <section key={idx} className={styles.section} aria-labelledby={`sitemap-section-${idx}`}>
              <h2 id={`sitemap-section-${idx}`} className={styles.sectionTitle}>
                {section.title}
              </h2>
              <ul className={styles.linkList}>
                {section.links.map(link => (
                  <li key={link.path} className={styles.linkItem}>
                    <Link to={link.path}>{link.label}</Link>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      </div>
    </Container>
  );
}

