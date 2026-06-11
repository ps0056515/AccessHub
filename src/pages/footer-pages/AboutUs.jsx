import { Link } from 'react-router-dom';

const accent = "#074a9e";
const accentLight = "#eff6ff";
const accentBorder = "#bfdbfe";
const textPrimary = "#0f172a";
const textSecondary = "#334155";
const textMuted = "#475569";
const borderColor = "#e2e8f0";
const bgPage = "#f8fafc";
const bgWhite = "#ffffff";

const MISSION_LIST = [
  "Promote accessibility awareness and education.",
  "Foster a collaborative and supportive community.",
  "Share knowledge, resources, and best practices.",
  "Encourage inclusive design and development practices.",
  "Advocate for equal access to digital information and services.",
  "Inspire organizations and individuals to make accessibility a priority.",
];

const WHAT_WE_DO = [
  "Learn about accessibility principles and standards.",
  "Share experiences, insights, and success stories.",
  "Participate in discussions and knowledge exchange.",
  "Discover resources, tools, and best practices.",
  "Explore emerging trends and innovations in accessibility.",
  "Connect with individuals and organizations passionate about inclusion.",
];

const VALUES = [
  { icon: "⊕", title: "Inclusion", desc: "We believe everyone deserves equal access to information, technology, and opportunities." },
  { icon: "◎", title: "Respect", desc: "We foster an environment where diverse perspectives, experiences, and voices are welcomed and valued." },
  { icon: "⇄", title: "Collaboration", desc: "Meaningful change happens when people learn, share, and work together." },
  { icon: "↑", title: "Continuous Improvement", desc: "Accessibility is an ongoing journey, and we are committed to learning, evolving, and growing together as a community." },
];

function BulletList({ items }) {
  return (
    <ul style={{ listStyle: "none", padding: 0, margin: "14px 0 0 0", display: "flex", flexDirection: "column", gap: 10 }}>
      {items.map((item, i) => (
        <li key={i} style={{ display: "flex", alignItems: "flex-start", gap: 10, fontSize: 15, lineHeight: 1.7, color: textSecondary }}>
          <span style={{ flexShrink: 0, width: 6, height: 6, borderRadius: "50%", background: accent, marginTop: 9, display: "inline-block" }} aria-hidden="true" />
          {item}
        </li>
      ))}
    </ul>
  );
}

export default function AboutUs() {
  return (
    <div style={{ minHeight: "100vh", background: bgPage }}>
      <div style={{ height: 4, background: `linear-gradient(90deg, ${accent} 0%, #3b82f6 60%, #60a5fa 100%)` }} aria-hidden="true" />

      <div style={{ maxWidth: 1000, margin: "0 auto", padding: "56px 24px 80px" }}>

        {/* Hero */}
        <header style={{ maxWidth: 720, marginBottom: 64 }}>
          <span style={{ display: "inline-block", fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: accent, background: accentLight, border: `1px solid ${accentBorder}`, borderRadius: 4, padding: "3px 10px", marginBottom: 16 }}>
            About AllCanAccess
          </span>
          <h1 style={{ fontSize: "clamp(30px, 4vw, 42px)", fontWeight: 800, color: textPrimary, letterSpacing: "-0.02em", lineHeight: 1.12, margin: "0 0 22px" }}>
            Building a More Accessible<br />and Inclusive Digital World
          </h1>
          <p style={{ fontSize: 17, lineHeight: 1.8, color: textSecondary, margin: "0 0 16px" }}>
            AllCanAccess is a community-driven platform dedicated to promoting accessibility, inclusion, and equal digital experiences for everyone.
          </p>
          <p style={{ fontSize: 16, lineHeight: 1.8, color: textMuted, margin: "0 0 16px" }}>
            We believe that technology should empower people—not create barriers. Yet millions of individuals continue to face challenges when accessing websites, applications, digital content, and online services. Our mission is to help bridge that gap by fostering awareness, sharing knowledge, encouraging collaboration, and supporting accessibility best practices across industries.
          </p>
          <p style={{ fontSize: 16, lineHeight: 1.8, color: textMuted, margin: 0 }}>
            AllCanAccess brings together accessibility advocates, designers, developers, testers, content creators, educators, organizations, and individuals who share a common goal: creating digital experiences that everyone can access and use with confidence.
          </p>
        </header>

        {/* Vision & Mission */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
          {/* Vision */}
          <div style={{ background: bgWhite, border: `1px solid ${borderColor}`, borderRadius: 12, padding: 32 }}>
            <div style={{ width: 40, height: 40, background: accentLight, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, marginBottom: 16 }} aria-hidden="true">◈</div>
            <h2 style={{ fontSize: 18, fontWeight: 700, color: textPrimary, margin: "0 0 12px" }}>Our Vision</h2>
            <p style={{ fontSize: 15, lineHeight: 1.75, color: textSecondary, margin: "0 0 12px" }}>
              To create a world where accessibility is not an afterthought but a fundamental part of every digital experience.
            </p>
            <p style={{ fontSize: 15, lineHeight: 1.75, color: textMuted, margin: 0 }}>
              We envision a future where technology is designed with inclusion in mind from the very beginning, enabling people of all abilities to participate fully in education, employment, communication, and everyday life.
            </p>
          </div>

          {/* Mission */}
          <div style={{ background: bgWhite, border: `1px solid ${borderColor}`, borderRadius: 12, padding: 32 }}>
            <div style={{ width: 40, height: 40, background: accentLight, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, marginBottom: 16 }} aria-hidden="true">⊙</div>
            <h2 style={{ fontSize: 18, fontWeight: 700, color: textPrimary, margin: "0 0 4px" }}>Our Mission</h2>
            <p style={{ fontSize: 15, lineHeight: 1.75, color: textSecondary, margin: "0 0 4px" }}>Our mission is to:</p>
            <BulletList items={MISSION_LIST} />
          </div>
        </div>

        {/* What We Do */}
        <div style={{ background: bgWhite, border: `1px solid ${borderColor}`, borderRadius: 12, padding: 32, marginBottom: 16 }}>
          <h2 style={{ fontSize: 20, fontWeight: 700, color: textPrimary, margin: "0 0 6px" }}>What We Do</h2>
          <p style={{ fontSize: 15, lineHeight: 1.75, color: textSecondary, margin: "0 0 4px" }}>Through our community, we provide opportunities to:</p>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px 32px" }}>
            {WHAT_WE_DO.map((item, i) => (
              <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 10, fontSize: 15, lineHeight: 1.7, color: textSecondary }}>
                <span style={{ flexShrink: 0, width: 6, height: 6, borderRadius: "50%", background: accent, marginTop: 9, display: "inline-block" }} aria-hidden="true" />
                {item}
              </div>
            ))}
          </div>
          <p style={{ fontSize: 15, lineHeight: 1.75, color: textMuted, margin: "20px 0 0", fontStyle: "italic", borderTop: `1px solid ${borderColor}`, paddingTop: 16 }}>
            We believe that accessibility is not solely the responsibility of developers or designers — it is a shared responsibility across teams, organizations, and communities.
          </p>
        </div>

        {/* Why Accessibility Matters */}
        <div style={{ background: `linear-gradient(135deg, ${accent} 0%, #1e40af 100%)`, borderRadius: 12, padding: "36px 40px", marginBottom: 16, color: "#fff" }}>
          <h2 style={{ fontSize: 20, fontWeight: 800, margin: "0 0 10px", letterSpacing: "-0.01em" }}>Why Accessibility Matters</h2>
          <p style={{ fontSize: 16, fontWeight: 600, color: "#bfdbfe", margin: "0 0 12px" }}>Accessibility benefits everyone.</p>
          <p style={{ fontSize: 15, lineHeight: 1.8, color: "#bfdbfe", margin: "0 0 12px" }}>
            Whether it's captions on a video, keyboard navigation, readable content, voice interactions, or inclusive design practices, accessibility creates better experiences for all users — not just those with disabilities.
          </p>
          <p style={{ fontSize: 15, lineHeight: 1.8, color: "#93c5fd", margin: 0 }}>
            By designing for diverse needs and experiences, we build products, services, and communities that are more usable, welcoming, and effective for everyone.
          </p>
        </div>

        {/* Core Values */}
        <div style={{ marginBottom: 16 }}>
          <div style={{ background: bgWhite, border: `1px solid ${borderColor}`, borderRadius: 12, padding: 32 }}>
            <h2 style={{ fontSize: 20, fontWeight: 700, color: textPrimary, margin: "0 0 6px" }}>Our Community Values</h2>
            <p style={{ fontSize: 15, color: textMuted, margin: "0 0 20px" }}>Everything we do is guided by four core values:</p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 16 }}>
              {VALUES.map((v, i) => (
                <div key={i} style={{ background: "#f8fafc", border: `1px solid ${borderColor}`, borderRadius: 10, padding: 20, display: "flex", gap: 14, alignItems: "flex-start" }}>
                  <div style={{ width: 36, height: 36, background: accentLight, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, flexShrink: 0 }} aria-hidden="true">{v.icon}</div>
                  <div>
                    <h3 style={{ fontSize: 15, fontWeight: 700, color: textPrimary, margin: "0 0 6px" }}>{v.title}</h3>
                    <p style={{ fontSize: 14, lineHeight: 1.65, color: textMuted, margin: 0 }}>{v.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Join the Movement */}
        <div style={{ background: "linear-gradient(135deg, #0f172a 0%, #1e3a5f 100%)", borderRadius: 16, padding: "40px 44px" }}>
          <h2 style={{ fontSize: 22, fontWeight: 800, color: "#fff", margin: "0 0 12px" }}>Join the Movement</h2>
          <p style={{ fontSize: 15, lineHeight: 1.8, color: "#94a3b8", margin: "0 0 10px" }}>
            Creating a more accessible world requires collective effort.
          </p>
          <p style={{ fontSize: 15, lineHeight: 1.8, color: "#94a3b8", margin: "0 0 10px" }}>
            Whether you're just beginning your accessibility journey or have years of experience, AllCanAccess welcomes you to learn, contribute, collaborate, and help shape a future where digital experiences are accessible to all.
          </p>
          <p style={{ fontSize: 15, lineHeight: 1.8, color: "#60a5fa", fontWeight: 600, margin: "0 0 28px" }}>
            Together, we can build a world where everyone can access, participate, and thrive.
          </p>
          <Link to="/join" style={{ display: "inline-block", background: accent, color: "#fff", fontWeight: 700, fontSize: 15, padding: "12px 28px", borderRadius: 8, textDecoration: "none" }}>
            Join the community →
          </Link>
        </div>

      </div>
    </div>
  );
}