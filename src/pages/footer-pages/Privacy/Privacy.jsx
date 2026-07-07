import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import styles from "./Privacy.module.css";

const SECTIONS = [
  {
    id: "introduction",
    title: "Introduction",
    content:
      "At AllCanAccess, we believe that accessibility, inclusion, and privacy go hand in hand. We are committed to creating a safe, respectful, and trustworthy community where individuals can learn, share experiences, and collaborate to promote accessibility for everyone. This Privacy Policy explains how we collect, use, protect, and manage information shared through our website, community platform, events, resources, and related services. By accessing or using AllCanAccess, you agree to the practices described in this Privacy Policy.",
  },
  {
    id: "information-we-collect",
    title: "Information We Collect",
    content: "We collect only the information necessary to support and improve our community experience.",
    subsections: [
      {
        title: "Information You Provide",
        text: "You may choose to provide information such as:",
        list: ["Name", "Email address", "Community profile details", "Comments and discussion posts", "Blog submissions and articles", "Event registrations", "Feedback and survey responses", "Information shared when contacting our team"],
        footer: "Providing personal information is voluntary; however, certain features may require specific information to function effectively.",
      },
      {
        title: "Information Collected Automatically",
        text: "When you visit our website, limited technical information may be collected automatically, including:",
        list: ["Browser type and version", "Device information", "Operating system", "IP address", "Pages visited", "Website usage patterns", "Date and time of visits"],
        footer: "This information helps us understand how our platform is being used and enables us to improve accessibility, performance, and user experience.",
      },
    ],
  },
  {
    id: "how-we-use",
    title: "How We Use Your Information",
    content: "The information we collect may be used to:",
    list: [
      "Manage and support community participation",
      "Respond to inquiries and support requests",
      "Publish and manage community contributions",
      "Share newsletters, announcements, and event updates",
      "Improve website functionality, accessibility, and content",
      "Understand community engagement and interests",
      "Maintain a safe, respectful, and inclusive environment",
    ],
    footer: "We do not sell personal information to third parties.",
  },
  {
    id: "accessibility-privacy",
    title: "Accessibility and Privacy",
    content:
      "As an accessibility-focused community, we recognize that privacy and accessibility are equally important. We strive to ensure that our services are accessible to a diverse range of users while respecting individual privacy preferences. Our goal is to create an environment where members can participate confidently, knowing that their information is handled responsibly and transparently.",
    callout: "Accessibility should empower participation, and privacy should protect it.",
  },
  {
    id: "community-contributions",
    title: "Community Contributions",
    content:
      "AllCanAccess encourages open collaboration and knowledge sharing. Content shared in public areas of the community — including blogs, comments, discussions, and event interactions — may be visible to other members and visitors. We encourage members to avoid posting sensitive, confidential, or personally identifiable information in public spaces. Users are responsible for the content they voluntarily choose to share.",
  },
  {
    id: "cookies",
    title: "Cookies and Analytics",
    content: "Our website may use cookies and similar technologies to:",
    list: ["Remember user preferences", "Improve website functionality", "Analyse website traffic and engagement", "Enhance accessibility features", "Improve overall user experience"],
    footer: "Users can manage cookie preferences through their browser settings.",
  },
  {
    id: "data-protection",
    title: "Data Protection",
    content:
      "We take reasonable administrative, technical, and organisational measures to safeguard personal information against unauthorised access, disclosure, alteration, or misuse. While no online platform can guarantee absolute security, we continuously work to maintain appropriate safeguards to protect community information.",
  },
  {
    id: "data-retention",
    title: "Data Retention",
    content: "We retain information only for as long as necessary to:",
    list: ["Provide community services", "Support community activities and engagement", "Maintain operational records", "Comply with legal obligations where applicable"],
    footer: "When information is no longer required, we take reasonable steps to securely remove or anonymise it.",
  },
  {
    id: "third-party-links",
    title: "Third-Party Links",
    content:
      "Our website may contain links to external websites, tools, resources, or social media platforms. These third-party services operate independently and may have their own privacy practices. We encourage users to review the privacy policies of any external services they choose to visit. AllCanAccess is not responsible for the privacy practices or content of third-party websites.",
  },
  {
    id: "your-rights",
    title: "Your Privacy Rights",
    content: "We respect your rights regarding your personal information. Depending on applicable laws and regulations, you may have the right to:",
    list: ["Access your personal information", "Request corrections to inaccurate information", "Request deletion of personal information", "Withdraw consent where applicable", "Raise concerns regarding how your information is handled"],
    footer: "Requests can be submitted through our official contact channels.",
  },
  {
    id: "updates",
    title: "Updates to This Policy",
    content:
      "We may update this Privacy Policy periodically to reflect changes in community practices, services, or legal requirements. Any updates will be published on this page. Continued use of the website after changes are posted constitutes acceptance of the updated policy.",
  },
  {
    id: "contact",
    title: "Contact Us",
    content:
      "If you have any questions, concerns, or feedback regarding this Privacy Policy or the handling of your information, please contact the AllCanAccess team through our official support or community channels.",
    link: { to: "/contact", text: "Contact Us" }
  },
];

function BulletList({ items }) {
  return (
    <ul className={styles.bulletList}>
      {items.map((item, i) => (
        <li key={i} className={styles.bulletListItem}>
          <span className={styles.bulletListIcon} aria-hidden="true" />
          {item}
        </li>
      ))}
    </ul>
  );
}

export default function Privacy() {
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
      <div className={styles.wrapper}>
        <header className={styles.header}>
          <span className={styles.badge}>Legal</span>
          <h1 className={styles.title}>Privacy Policy</h1>
          <p className={styles.date}>Last updated: <time>June 2025</time></p>
          <p className={styles.description}>
            Your privacy matters to us. This policy explains how we collect, use, and protect your information when you use AllCanAccess.
          </p>
        </header>

        <div className={styles.contentGrid}>
          <aside aria-label="Table of contents" className={styles.sidebar}>
            <p className={styles.sidebarTitle}>On this page</p>
            <nav>
              <ol className={styles.tocList}>
                {SECTIONS.map((s) => (
                  <li key={s.id}>
                    <a
                      href={`#${s.id}`}
                      className={`${styles.tocLink} ${activeSection === s.id ? styles.tocLinkActive : ""}`}
                      onClick={() => setActiveSection(s.id)}
                    >
                      {s.title}
                    </a>
                  </li>
                ))}
              </ol>
            </nav>
          </aside>

          <main>
            {SECTIONS.map((section) => (
              <section key={section.id} id={section.id} aria-labelledby={`${section.id}-heading`} className={styles.section}>
                <h2 id={`${section.id}-heading`} className={styles.sectionTitle}>
                  {section.title}
                </h2>
                {section.content && <p className={styles.sectionContent}>{section.content}</p>}
                {section.callout && (
                  <blockquote className={styles.blockquote}>
                    {section.callout}
                  </blockquote>
                )}
                {section.list && <BulletList items={section.list} />}
                {section.footer && <p className={styles.footerText}>{section.footer}</p>}
                {section.link && (
                  <Link to={section.link.to} className={styles.contactBtn}>
                    {section.link.text}
                  </Link>
                )}
                {section.subsections && section.subsections.map((sub, i) => (
                  <div key={i} className={styles.subsection}>
                    <h3 className={styles.subsectionTitle}>{sub.title}</h3>
                    {sub.text && <p className={styles.subsectionText}>{sub.text}</p>}
                    <BulletList items={sub.list} />
                    {sub.footer && <p className={styles.subsectionFooter}>{sub.footer}</p>}
                  </div>
                ))}
              </section>
            ))}

            <div className={styles.commitmentCard}>
              <h2 className={styles.commitmentTitle}>Our Commitment</h2>
              <p className={styles.commitmentText}>
                AllCanAccess was built on the belief that everyone deserves equal access to information, technology, and opportunity. Just as we work to remove accessibility barriers, we are committed to protecting the privacy and trust of our community members.
              </p>
              <p className={styles.commitmentFooter}>Thank you for being part of the AllCanAccess community.</p>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}