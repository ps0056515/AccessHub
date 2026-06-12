import { Link } from 'react-router-dom';
import { SITE_NAME } from 'brand';

const accent = "#074a9e";
const accentLight = "#eff6ff";
const accentBorder = "#bfdbfe";
const textPrimary = "#0f172a";
const textSecondary = "#334155";
const textMuted = "#475569";
const borderColor = "#e2e8f0";
const bgPage = "#f8fafc";
const bgWhite = "#ffffff";

const CARDS = [
  {
    icon: "✉",
    title: "Email Us",
    desc: "For general enquiries, feedback, or partnership ideas.",
    action: (
      <a
        href="mailto:contactus@allcanaccess.com"
        style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 14, fontWeight: 600, color: accent, textDecoration: "none", marginTop: 12 }}
      >
        contactus@allcanaccess.com →
      </a>
    ),
  },
  {
    icon: "💬",
    title: "Community Discussions",
    desc: "Prefer a public conversation? Post in our community and get answers from the whole team.",
    action: (
      <Link
        to="/"
        style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 14, fontWeight: 600, color: accent, textDecoration: "none", marginTop: 12 }}
      >
        Visit community page →
      </Link>
    ),
  },
  {
    icon: "♿",
    title: "Accessibility Issues",
    desc: "Found a barrier on our platform? We take accessibility feedback seriously and respond within 2 business days.",
    action: (
      <a
        href="mailto:contactus@allcanaccess.com?subject=Accessibility%20Issue"
        style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 14, fontWeight: 600, color: accent, textDecoration: "none", marginTop: 12 }}
      >
        Report an issue →
      </a>
    ),
  },
];

export default function Contact() {
  return (
    <div style={{ minHeight: "100vh", background: bgPage }}>
      <div style={{ height: 4, background: `linear-gradient(90deg, ${accent} 0%, #3b82f6 60%, #60a5fa 100%)` }} aria-hidden="true" />

      <div style={{ maxWidth: 900, margin: "0 auto", padding: "56px 24px 80px" }}>

        {/* Header */}
        <header style={{ maxWidth: 580, marginBottom: 52 }}>
          <span style={{ display: "inline-block", fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: accent, background: accentLight, border: `1px solid ${accentBorder}`, borderRadius: 4, padding: "3px 10px", marginBottom: 16 }}>
            Contact
          </span>
          <h1 style={{ fontSize: "clamp(28px, 4vw, 38px)", fontWeight: 800, color: textPrimary, letterSpacing: "-0.02em", lineHeight: 1.15, margin: "0 0 16px" }}>
            Get in touch
          </h1>
          <p style={{ fontSize: 17, lineHeight: 1.75, color: textSecondary, margin: 0 }}>
            We welcome feedback, accessibility questions, and partnership ideas. Choose the best way to reach the {SITE_NAME} team below.
          </p>
        </header>

        {/* Contact cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginBottom: 48 }}>
          {CARDS.map((card, i) => (
            <div key={i} style={{ background: bgWhite, border: `1px solid ${borderColor}`, borderRadius: 12, padding: 28, display: "flex", flexDirection: "column" }}>
              <div style={{ width: 44, height: 44, background: accentLight, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, marginBottom: 16 }} aria-hidden="true">
                {card.icon}
              </div>
              <h2 style={{ fontSize: 16, fontWeight: 700, color: textPrimary, margin: "0 0 8px" }}>{card.title}</h2>
              <p style={{ fontSize: 14, lineHeight: 1.65, color: textMuted, margin: 0, flex: 1 }}>{card.desc}</p>
              {card.action}
            </div>
          ))}
        </div>

        {/* Response time notice */}
        <div style={{ background: bgWhite, border: `1px solid ${borderColor}`, borderRadius: 12, padding: "20px 28px", display: "flex", alignItems: "flex-start", gap: 16 }}>
          <span style={{ fontSize: 20, flexShrink: 0, marginTop: 2 }} aria-hidden="true">🕐</span>
          <div>
            <p style={{ fontSize: 14, fontWeight: 700, color: textPrimary, margin: "0 0 4px" }}>Response times</p>
            <p style={{ fontSize: 14, lineHeight: 1.65, color: textMuted, margin: 0 }}>
              General enquiries: within <strong style={{ color: textSecondary }}>3 business days</strong>.&nbsp;
              Accessibility issues: within <strong style={{ color: textSecondary }}>2 business days</strong>.&nbsp;
              We read every message and respond personally.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}

