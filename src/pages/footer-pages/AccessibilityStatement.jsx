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

const COMMITMENTS = [
  { icon: "✓", title: "WCAG 2.2 AA Conformance", desc: "We design and develop our platform to meet Web Content Accessibility Guidelines (WCAG) 2.1 Level AA standards." },
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
      "AllCanAccess is committed to ensuring that our website, community platform, and all related services are accessible to people of all abilities. Accessibility is not an add-on or afterthought for us — it is central to everything we build and every decision we make. We continuously audit and improve our digital experiences to meet and exceed the Web Content Accessibility Guidelines (WCAG) 2.1 Level AA.",
  },
  {
    id: "standards",
    title: "Standards We Follow",
    content: "Our accessibility work is guided by recognised international and national standards, including:",
    list: [
      "Web Content Accessibility Guidelines (WCAG) 2. Level AA",
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
    <div style={{ minHeight: "100vh", background: bgPage }}>
     
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "52px 24px 80px" }}>

        {/* Header */}
        <header style={{ maxWidth: 660, marginBottom: 48 }}>
          <span style={{ display: "inline-block", fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: accent, background: accentLight, border: `1px solid ${accentBorder}`, borderRadius: 4, padding: "3px 10px", marginBottom: 16 }}>
            Accessibility
          </span>
          <h1 style={{ fontSize: "clamp(28px, 4vw, 38px)", fontWeight: 800, color: textPrimary, letterSpacing: "-0.02em", lineHeight: 1.15, margin: "0 0 10px" }}>
            Accessibility Statement
          </h1>
          <p style={{ fontSize: 13, color: textMuted, margin: "0 0 18px" }}>Last updated: <time>June 2025</time></p>
          <p style={{ fontSize: 17, lineHeight: 1.75, color: textSecondary, margin: 0 }}>
            AllCanAccess is built for everyone. Here is how we uphold that promise in the design, development, and maintenance of our platform.
          </p>
        </header>

        {/* Commitment cards */}
        <div role="list" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginBottom: 56 }}>
          {COMMITMENTS.map((c, i) => (
            <div key={i} role="listitem" style={{ background: bgWhite, border: `1px solid ${borderColor}`, borderRadius: 12, padding: 24 }}>
              <div style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 40, height: 40, background: accentLight, borderRadius: 8, fontSize: 18, marginBottom: 14 }} aria-hidden="true">
                {c.icon}
              </div>
              <h2 style={{ fontSize: 15, fontWeight: 700, color: textPrimary, margin: "0 0 8px", letterSpacing: "-0.01em" }}>{c.title}</h2>
              <p style={{ fontSize: 13, lineHeight: 1.65, color: textMuted, margin: 0 }}>{c.desc}</p>
            </div>
          ))}
        </div>

        {/* Layout */}
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
                {section.list && <BulletList items={section.list} />}
              </section>
            ))}

            <div style={{ marginTop: 48, padding: "36px 40px", background: "linear-gradient(135deg, #0f172a 0%, #1e3a5f 100%)", borderRadius: 16, color: "#fff" }}>
              <h2 style={{ fontSize: 22, fontWeight: 800, margin: "0 0 14px", letterSpacing: "-0.01em" }}>Accessibility is Everyone's Responsibility</h2>
              <p style={{ fontSize: 15, lineHeight: 1.75, color: "#cbd5e1", margin: "0 0 18px" }}>
                AllCanAccess exists to bring people together around a shared goal: a more accessible digital world. We hold ourselves to the same standard we advocate for — because a community dedicated to accessibility must itself be accessible.
              </p>
              <p style={{ fontSize: 14, fontWeight: 600, color: "#60a5fa", margin: 0 }}>Thank you for helping us do better.</p>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}