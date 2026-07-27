import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import styles from "./AccessibilityStatement.module.css";

const COMMITMENTS = [
  { icon: "✓", title: "WCAG 2.2 AA Conformance", desc: "We design and develop our platform to meet Web Content Accessibility Guidelines (WCAG) 2.2 Level AA standards." },
  { icon: "⌨", title: "Keyboard Navigation", desc: "All functionality is accessible via keyboard. No keyboard traps. Focus is always visible and logical." },
  { icon: "🔊", title: "Screen Reader Support", desc: "AllCanAccess is tested with NVDA, JAWS, and VoiceOver to ensure a consistent and reliable experience." },
  { icon: "◑", title: "Colour Contrast", desc: "We maintain minimum contrast ratios of 4.5:1 for normal text and 3:1 for large text throughout the interface." },
  { icon: "⊞", title: "Responsive & Zoomable", desc: "Content reflows correctly up to 400% zoom and across all screen sizes without loss of functionality." },
  { icon: "⬚", title: "Meaningful Alt Text", desc: "Images carry descriptive alternative text. Decorative images are hidden from assistive technologies." },
];

const SECTIONS = [
  {
    id: "our-commitment",
    title: "Our Commitment",
    content:
      "AllCanAccess is committed to ensuring that our website, community platform, and all related services are accessible to people of all abilities. Accessibility is not an add-on or afterthought for us — it is central to everything we build and every decision we make. We continuously audit and improve our digital experiences to meet and exceed the Web Content Accessibility Guidelines (WCAG) 2.2 Level AA.",
  },
  {
    id: "standards",
    title: "Standards We Follow",
    content: "Our accessibility work is guided by recognised international and national standards, including:",
    list: [
      "Web Content Accessibility Guidelines (WCAG) 2.2 Level AA",
      "Section 508 of the US Rehabilitation Act",
      "EN 301 549 – European Accessibility Standard",
      "WAI-ARIA 1.2 for dynamic and interactive content",
      "ATAG 2.0 for authoring tools and content editors",
    ],
  },
  {
    id: "known-issues",
    title: "Known Issues & Ongoing Work",
    content:
      "We are actively working to identify and resolve accessibility barriers across the platform. Our team conducts regular automated scans and manual testing with assistive technologies. If you encounter any issue not listed here, we want to hear from you.",
  },
  {
    id: "testing",
    title: "How We Test",
    content: "Our accessibility testing approach combines automated tools and manual evaluation:",
    list: [
      "Automated scans with axe, Lighthouse, and WAVE",
      "Manual keyboard-only navigation testing",
      "Screen reader testing with NVDA on Windows and VoiceOver on macOS/iOS",
      "Colour contrast verification across all colour tokens",
      "Zoom testing at 200%, 300%, and 400%",
      "User testing with community members who use assistive technologies",
    ],
  },
  {
    id: "feedback",
    title: "Feedback & Contact",
    content:
      "We welcome feedback on the accessibility of AllCanAccess. If you experience any barrier, find content you cannot access, or have a suggestion that would improve your experience, please reach out through our official support channels. We aim to respond to accessibility concerns within 2 business days and to implement reasonable fixes within 10 business days.",
    link: { to: "/contact", text: "Contact Us" }
  },
  
];

function BulletList({ items }) {
  return (
    <ul className={styles.bulletList}>
      {items.map((item, i) => (
        <li key={i} className={styles.bulletItem}>
          <span className={styles.bulletIcon} aria-hidden="true" />
          {item}
        </li>
      ))}
    </ul>
  );
}

export default function AccessibilityStatement() {
const [activeSection, setActiveSection] = useState(null);

useEffect(() => {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) setActiveSection(entry.target.id);
      });
    },
    { rootMargin: "-20% 0px -70% 0px" }
  );
  SECTIONS.forEach((s) => {
    const el = document.getElementById(s.id);
    if (el) observer.observe(el);
  });
  return () => observer.disconnect();
}, []);  

  return (
    <div className={styles.container}>
     
      <div className={styles.contentWrapper}>

        {/* Header */}
        <header className={styles.header}>
          <span className={styles.tagline}>
            Accessibility
          </span>
          <h1 className={styles.title}>
            Accessibility Statement
          </h1>
          <p className={styles.lastUpdated}>Last updated: <time>June 2025</time></p>
          <p className={styles.headerDesc}>
            AllCanAccess is built for everyone. Here is how we uphold that promise in the design, development, and maintenance of our platform.
          </p>
        </header>

        {/* Commitment cards */}
        <div role="list" className={styles.commitmentsGrid}>
          {COMMITMENTS.map((c, i) => (
            <div key={i} role="listitem" className={styles.commitmentCard}>
              <div className={styles.commitmentIcon} aria-hidden="true">
                {c.icon}
              </div>
              <h2 className={styles.commitmentTitle}>{c.title}</h2>
              <p className={styles.commitmentDesc}>{c.desc}</p>
            </div>
          ))}
        </div>

        {/* Layout */}
        <div className={styles.layoutGrid}>

          <div className={styles.sidebar}>
            <p className={styles.sidebarTitle}>On this page</p>
            <nav aria-label="Table of contents">
              <ol className={styles.tocList}>
                {SECTIONS.map((s) => (
                  <li key={s.id}>
                    <a href={`#${s.id}`}
                      className={`${styles.tocLink} ${activeSection === s.id ? styles.tocLinkActive : ''}`}
                      onClick={() => setActiveSection(s.id)}>
                      {s.title}
                    </a>
                  </li>
                ))}
              </ol>
            </nav>
          </div>

          <div className={styles.mainContent}>
            {SECTIONS.map((section) => (
              <section key={section.id} id={section.id} aria-labelledby={`${section.id}-heading`}
                className={styles.section}>
                <h2 id={`${section.id}-heading`} className={styles.sectionTitle}>
                  {section.title}
                </h2>
                {section.content && <p className={styles.sectionContent}>{section.content}</p>}
                {section.list && <BulletList items={section.list} />}
                {section.link && (
                  <Link to={section.link.to} className={styles.contactBtn}>
                    {section.link.text}
                  </Link>
                )}
              </section>
            ))}

            <div className={styles.footerSection}>
              <h2 className={styles.footerTitle}>Accessibility is Everyone's Responsibility</h2>
              <p className={styles.footerDesc}>
                AllCanAccess exists to bring people together around a shared goal: a more accessible digital world. We hold ourselves to the same standard we advocate for — because a community dedicated to accessibility must itself be accessible.
              </p>
              <p className={styles.footerThanks}>Thank you for helping us do better.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}