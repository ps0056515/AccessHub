import { useState, useEffect } from "react";

const accent = "#074a9e";
const accentLight = "#eff6ff";
const accentBorder = "#bfdbfe";
const textPrimary = "#0f172a";
const textSecondary = "#334155";
const textMuted = "#475569";
const borderColor = "#e2e8f0";
const bgPage = "#f8fafc";
const bgWhite = "#ffffff";
const bgSubtle = "#f1f5f9";

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
  },
];

function BulletList({ items }) {
  return (
    <ul style={{ listStyle: "none", padding: 0, margin: "12px 0 0 0", display: "flex", flexDirection: "column", gap: 8 }}>
      {items.map((item, i) => (
        <li key={i} style={{ display: "flex", alignItems: "flex-start", gap: 10, fontSize: 15, lineHeight: 1.7, color: textSecondary }}>
          <span style={{ flexShrink: 0, width: 6, height: 6, borderRadius: "50%", background: accent, marginTop: 9, display: "inline-block" }} aria-hidden="true" />
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
    <div style={{ minHeight: "100vh", background: bgPage }}>
      {/* Accent strip */}

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "52px 24px 80px" }}>
        {/* Header */}
        <header style={{ maxWidth: 660, marginBottom: 52 }}>
          <span style={{
            display: "inline-block", fontSize: 11, fontWeight: 700, letterSpacing: "0.1em",
            textTransform: "uppercase", color: accent, background: accentLight,
            border: `1px solid ${accentBorder}`, borderRadius: 4, padding: "3px 10px", marginBottom: 16
          }}>
            Legal
          </span>
          <h1 style={{ fontSize: "clamp(28px, 4vw, 38px)", fontWeight: 800, color: textPrimary, letterSpacing: "-0.02em", lineHeight: 1.15, margin: "0 0 10px" }}>
            Terms of Use
          </h1>
          <p style={{ fontSize: 13, color: textMuted, margin: "0 0 18px" }}>Last updated: <time>June 2025</time></p>
          <p style={{ fontSize: 17, lineHeight: 1.75, color: textSecondary, margin: 0 }}>
            By using AllCanAccess, you agree to these terms. Please read them carefully before participating in our community.
          </p>
        </header>

        {/* Layout */}
        <div style={{ display: "grid", gridTemplateColumns: "200px 1fr", gap: 48, alignItems: "start" }}>

          {/* Sidebar TOC */}
          <aside aria-label="Table of contents" style={{
            position: "sticky", top: 80, background: bgWhite,
            border: `1px solid ${borderColor}`, borderRadius: 10, padding: 20
          }}>
            <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "#94a3b8", margin: "0 0 12px" }}>
              On this page
            </p>
            <nav>
              <ol style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 2 }}>
                {SECTIONS.map((s) => (
                  <li key={s.id}>
                    <a
                      href={`#${s.id}`}
                      style={{
                        display: "block", fontSize: 13, color: activeSection === s.id ? accent : textMuted,
                        textDecoration: "none", padding: "6px 8px", borderRadius: 6,
                        background: activeSection === s.id ? accentLight : "transparent",
                        lineHeight: 1.4, transition: "background 0.15s, color 0.15s",
                        fontWeight: activeSection === s.id ? 600 : 400,
                      }}
                      onClick={() => setActiveSection(s.id)}
                    >
                      {s.title}
                    </a>
                  </li>
                ))}
              </ol>
            </nav>
          </aside>

          {/* Content */}
          <main>
            {SECTIONS.map((section) => (
              <section key={section.id} id={section.id} aria-labelledby={`${section.id}-heading`}
                style={{ padding: "32px 0", borderBottom: `1px solid ${borderColor}` }}>
                <h2 id={`${section.id}-heading`} style={{ fontSize: 20, fontWeight: 700, color: textPrimary, margin: "0 0 12px", letterSpacing: "-0.01em" }}>
                  {section.title}
                </h2>
                {section.content && (
                  <p style={{ fontSize: 15, lineHeight: 1.75, color: textSecondary, margin: "0 0 12px" }}>{section.content}</p>
                )}
                {section.list && <BulletList items={section.list} />}
                {section.subsection && (
                  <div style={{ marginTop: 20, padding: "14px 18px", background: bgSubtle, borderLeft: `3px solid ${accent}`, borderRadius: "0 8px 8px 0" }}>
                    <h3 style={{ fontSize: 13, fontWeight: 700, color: textPrimary, margin: "0 0 10px", textTransform: "uppercase", letterSpacing: "0.04em" }}>
                      {section.subsection.title}
                    </h3>
                    <BulletList items={section.subsection.list} />
                  </div>
                )}
                {section.footer && (
                  <p style={{ fontSize: 15, lineHeight: 1.75, color: textMuted, margin: "14px 0 0", fontStyle: "italic" }}>{section.footer}</p>
                )}
              </section>
            ))}

            {/* Closing card */}
            <div style={{
              marginTop: 48, padding: "36px 40px",
              background: "linear-gradient(135deg, #0f172a 0%, #1e3a5f 100%)",
              borderRadius: 16, color: "#fff"
            }}>
              <h2 style={{ fontSize: 22, fontWeight: 800, margin: "0 0 14px", letterSpacing: "-0.01em" }}>Our Community Promise</h2>
              <p style={{ fontSize: 15, lineHeight: 1.75, color: "#cbd5e1", margin: "0 0 18px" }}>
                AllCanAccess exists to promote accessibility, inclusion, learning, and collaboration. By participating in this community, you help create a space where people can share knowledge, exchange ideas, and work together toward a more accessible and inclusive digital world.
              </p>
              <p style={{ fontSize: 14, fontWeight: 600, color: "#60a5fa", margin: 0 }}>
                Thank you for being part of AllCanAccess.
              </p>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}