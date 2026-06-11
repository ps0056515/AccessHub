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
  },
];

function BulletList({ items }) {
  return (
    <ul style={{ listStyle: "none", padding: 0, margin: "12px 0 0 0", display: "flex", flexDirection: "column", gap: 8 }}>
      {items.map((item, i) => (
        <li key={i} style={{ display: "flex", alignItems: "flex-start", gap: 10, fontSize: 15, lineHeight: 1.7, color: "#334155" }}>
          <span style={{ flexShrink: 0, width: 6, height: 6, borderRadius: "50%", background: accent, marginTop: 9, display: "inline-block" }} aria-hidden="true" />
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
    <div style={{ minHeight: "100vh", background: bgPage }}>

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "52px 24px 80px" }}>
        <header style={{ maxWidth: 660, marginBottom: 52 }}>
          <span style={{
            display: "inline-block", fontSize: 11, fontWeight: 700, letterSpacing: "0.1em",
            textTransform: "uppercase", color: accent, background: accentLight,
            border: `1px solid ${accentBorder}`, borderRadius: 4, padding: "3px 10px", marginBottom: 16
          }}>Legal</span>
          <h1 style={{ fontSize: "clamp(28px, 4vw, 38px)", fontWeight: 800, color: textPrimary, letterSpacing: "-0.02em", lineHeight: 1.15, margin: "0 0 10px" }}>
            Privacy Policy
          </h1>
          <p style={{ fontSize: 13, color: textMuted, margin: "0 0 18px" }}>Last updated: <time>June 2025</time></p>
          <p style={{ fontSize: 17, lineHeight: 1.75, color: textSecondary, margin: 0 }}>
            Your privacy matters to us. This policy explains how we collect, use, and protect your information when you use AllCanAccess.
          </p>
        </header>

        <div style={{ display: "grid", gridTemplateColumns: "200px 1fr", gap: 48, alignItems: "start" }}>

          <aside aria-label="Table of contents" style={{ position: "sticky", top: 80, background: bgWhite, border: `1px solid ${borderColor}`, borderRadius: 10, padding: 20 }}>
            <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "#94a3b8", margin: "0 0 12px" }}>On this page</p>
            <nav>
              <ol style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 2 }}>
                {SECTIONS.map((s) => (
                  <li key={s.id}>
                    <a href={`#${s.id}`}
                      style={{ display: "block", fontSize: 13, color: activeSection === s.id ? accent : textMuted, textDecoration: "none", padding: "6px 8px", borderRadius: 6, background: activeSection === s.id ? accentLight : "transparent", lineHeight: 1.4, fontWeight: activeSection === s.id ? 600 : 400 }}
                      onClick={() => setActiveSection(s.id)}>
                      {s.title}
                    </a>
                  </li>
                ))}
              </ol>
            </nav>
          </aside>

          <main>
            {SECTIONS.map((section) => (
              <section key={section.id} id={section.id} aria-labelledby={`${section.id}-heading`}
                style={{ padding: "32px 0", borderBottom: `1px solid ${borderColor}` }}>
                <h2 id={`${section.id}-heading`} style={{ fontSize: 20, fontWeight: 700, color: textPrimary, margin: "0 0 12px", letterSpacing: "-0.01em" }}>
                  {section.title}
                </h2>
                {section.content && <p style={{ fontSize: 15, lineHeight: 1.75, color: textSecondary, margin: "0 0 12px" }}>{section.content}</p>}
                {section.callout && (
                  <blockquote style={{ margin: "14px 0", padding: "14px 18px", background: accentLight, borderLeft: `3px solid ${accent}`, borderRadius: "0 8px 8px 0", fontSize: 15, fontStyle: "italic", color: accent, fontWeight: 600 }}>
                    {section.callout}
                  </blockquote>
                )}
                {section.list && <BulletList items={section.list} />}
                {section.footer && <p style={{ fontSize: 15, lineHeight: 1.75, color: textMuted, margin: "14px 0 0", fontStyle: "italic" }}>{section.footer}</p>}
                {section.subsections && section.subsections.map((sub, i) => (
                  <div key={i} style={{ marginTop: 20, padding: "14px 18px", background: bgSubtle, borderLeft: `3px solid ${accent}`, borderRadius: "0 8px 8px 0" }}>
                    <h3 style={{ fontSize: 13, fontWeight: 700, color: textPrimary, margin: "0 0 6px", textTransform: "uppercase", letterSpacing: "0.04em" }}>{sub.title}</h3>
                    {sub.text && <p style={{ fontSize: 14, color: textSecondary, margin: "0 0 8px" }}>{sub.text}</p>}
                    <BulletList items={sub.list} />
                    {sub.footer && <p style={{ fontSize: 14, color: textMuted, margin: "10px 0 0", fontStyle: "italic" }}>{sub.footer}</p>}
                  </div>
                ))}
              </section>
            ))}

            <div style={{ marginTop: 48, padding: "36px 40px", background: "linear-gradient(135deg, #0f172a 0%, #1e3a5f 100%)", borderRadius: 16, color: "#fff" }}>
              <h2 style={{ fontSize: 22, fontWeight: 800, margin: "0 0 14px", letterSpacing: "-0.01em" }}>Our Commitment</h2>
              <p style={{ fontSize: 15, lineHeight: 1.75, color: "#cbd5e1", margin: "0 0 18px" }}>
                AllCanAccess was built on the belief that everyone deserves equal access to information, technology, and opportunity. Just as we work to remove accessibility barriers, we are committed to protecting the privacy and trust of our community members.
              </p>
              <p style={{ fontSize: 14, fontWeight: 600, color: "#60a5fa", margin: 0 }}>Thank you for being part of the AllCanAccess community.</p>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}