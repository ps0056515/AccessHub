import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import styles from "./Terms.module.css";

const SECTIONS = [
  {
    id: "introduction",
    title: "Introduction",
    content:
      "Welcome to AllCanAccess. These Terms of Use govern your access to and use of the AllCanAccess website, community platform, resources, events, discussions, and related services. By accessing or using our platform, you agree to comply with these Terms of Use. If you do not agree with these terms, please refrain from using our services. Our mission is to foster an open, inclusive, and accessible community where individuals can learn, collaborate, and share knowledge about accessibility and inclusive design.",
  },
  {
    id: "community-values",
    title: "Community Values",
    content:
      "AllCanAccess is built on the following core principles. We expect all members to contribute positively and help create a welcoming environment for everyone regardless of ability, background, experience, or perspective.",
    list: ["Accessibility", "Inclusion", "Respect", "Collaboration", "Knowledge Sharing"],
  },
  {
    id: "acceptable-use",
    title: "Acceptable Use",
    content: "When using AllCanAccess, you agree to:",
    list: [
      "Engage respectfully with other community members.",
      "Share accurate and constructive information.",
      "Respect differing viewpoints and experiences.",
      "Use the platform in a lawful and responsible manner.",
      "Help maintain a safe and inclusive environment.",
    ],
    subsection: {
      title: "Users Must Not",
      list: [
        "Harass, threaten, or intimidate others.",
        "Post discriminatory, offensive, or hateful content.",
        "Share misleading, fraudulent, or harmful information.",
        "Attempt to disrupt website functionality or security.",
        "Violate applicable laws or regulations.",
        "Impersonate another individual or organization.",
      ],
    },
  },
  {
    id: "user-contributions",
    title: "User Contributions",
    content:
      "Members may contribute content including blog articles, discussion posts, comments, accessibility resources, event participation, and educational content. By submitting content to AllCanAccess, you confirm that:",
    list: [
      "You own the content or have permission to share it.",
      "The content does not infringe on the rights of others.",
      "The content complies with these Terms of Use.",
    ],
    footer:
      "You retain ownership of your content; however, by publishing it within the community, you grant AllCanAccess permission to display, share, and promote that content within community-related activities.",
  },
  {
    id: "respectful-communication",
    title: "Respectful Communication",
    content:
      "Accessibility is a diverse and evolving field that benefits from open discussion and shared learning. We encourage healthy conversations and constructive feedback. Disagreements are natural, but they should always be handled respectfully and professionally. Personal attacks, harassment, bullying, discrimination, or abusive behavior will not be tolerated.",
  },
  {
    id: "accessibility-commitment",
    title: "Accessibility Commitment",
    content:
      "As an accessibility-focused community, we are committed to providing an inclusive experience for all users. We continuously strive to improve the accessibility of our website, resources, and community interactions. If you encounter an accessibility barrier while using our platform, we encourage you to contact us so we can work toward a solution.",
  },
  {
    id: "intellectual-property",
    title: "Intellectual Property",
    content:
      "Unless otherwise stated, content published by AllCanAccess, including logos, branding, website design, and original materials, remains the property of AllCanAccess. Users may not reproduce, distribute, or modify community-owned content without appropriate permission. Third-party trademarks, logos, and content remain the property of their respective owners.",
  },
  {
    id: "community-moderation",
    title: "Community Moderation",
    content: "To maintain a positive and productive environment, AllCanAccess reserves the right to:",
    list: [
      "Review user-submitted content.",
      "Remove content that violates these Terms.",
      "Restrict or suspend access when necessary.",
      "Investigate reported violations.",
      "Take appropriate action to protect the community.",
    ],
    footer:
      "Moderation decisions are made with the goal of maintaining a respectful, inclusive, and safe environment for all members.",
  },
  {
    id: "privacy",
    title: "Privacy",
    content:
      "Your use of AllCanAccess is also governed by our Privacy Policy. We are committed to protecting user information and handling data responsibly in accordance with applicable laws and community practices.",
  },
  {
    id: "disclaimer",
    title: "Disclaimer",
    content:
      "The information, opinions, resources, and discussions shared within the community are provided for educational and informational purposes only. While we strive to ensure accuracy, AllCanAccess does not guarantee the completeness, reliability, or accuracy of user-generated content or external resources. Users are encouraged to evaluate information independently and apply professional judgment where appropriate.",
  },
  {
    id: "limitation-of-liability",
    title: "Limitation of Liability",
    content:
      "To the maximum extent permitted by applicable law, AllCanAccess shall not be liable for any direct, indirect, incidental, or consequential damages arising from the use of the website, community content, or related services. Users access and use the platform at their own discretion and responsibility.",
  },
  {
    id: "changes",
    title: "Changes to These Terms",
    content:
      "We may update these Terms of Use from time to time to reflect changes in community practices, services, legal requirements, or operational needs. Updated versions will be published on this page, and continued use of the platform constitutes acceptance of the revised Terms.",
  },
  {
    id: "contact",
    title: "Contact Us",
    content:
      "If you have questions regarding these Terms of Use, community guidelines, or platform policies, please contact the AllCanAccess team through our official communication channels.",
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

export default function Terms() {
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
          <span className={styles.badge}>
            Legal
          </span>
          <h1 className={styles.title}>
            Terms of Use
          </h1>
          <p className={styles.date}>Last updated: <time>June 2025</time></p>
          <p className={styles.description}>
            By using AllCanAccess, you agree to these terms. Please read them carefully before participating in our community.
          </p>
        </header>

        <div className={styles.contentGrid}>
          <div className={styles.sidebar}>
            <p className={styles.sidebarTitle}>
              On this page
            </p>
            <nav aria-label="Table of contents">
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
          </div>

          <div className={styles.mainContent}>
            {SECTIONS.map((section) => (
              <section key={section.id} id={section.id} aria-labelledby={`${section.id}-heading`} className={styles.section}>
                <h2 id={`${section.id}-heading`} className={styles.sectionTitle}>
                  {section.title}
                </h2>
                {section.content && (
                  <p className={styles.sectionContent}>{section.content}</p>
                )}
                {section.list && <BulletList items={section.list} />}
                {section.subsection && (
                  <div className={styles.subsection}>
                    <h3 className={styles.subsectionTitle}>
                      {section.subsection.title}
                    </h3>
                    <BulletList items={section.subsection.list} />
                  </div>
                )}
                {section.footer && (
                  <p className={styles.footerText}>{section.footer}</p>
                )}
                {section.link && (
                  <Link to={section.link.to} className={styles.contactBtn}>
                    {section.link.text}
                  </Link>
                )}
              </section>
            ))}

            <div className={styles.commitmentCard}>
              <h2 className={styles.commitmentTitle}>Our Community Promise</h2>
              <p className={styles.commitmentText}>
                AllCanAccess exists to promote accessibility, inclusion, learning, and collaboration. By participating in this community, you help create a space where people can share knowledge, exchange ideas, and work together toward a more accessible and inclusive digital world.
              </p>
              <p className={styles.commitmentFooter}>
                Thank you for being part of AllCanAccess.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}