import { Link } from 'react-router-dom';
import SEO from 'components/common/SEO/SEO';
import styles from './AboutUs.module.css';

const SEO_FAQS = [
  {
    q: "What is AllCanAccess accessibility community?",
    a: "AllCanAccess is a global digital accessibility community focused on creating inclusive digital experiences for everyone, including people with disabilities. The community brings together accessibility professionals, developers, QA engineers, designers, compliance experts, assistive technology users, and learners to collaborate on WCAG compliance, accessibility testing, inclusive UX design, assistive technologies, and accessibility best practices. AllCanAccess helps organizations and individuals learn, discuss, and implement accessibility standards across websites, mobile apps, documents, and digital platforms."
  },
  {
    q: "Why is joining an accessibility community important?",
    a: "Joining an accessibility community helps professionals stay updated with evolving standards such as WCAG 2.2, ADA, Section 508, and the European Accessibility Act (EAA). Accessibility is constantly evolving with new assistive technologies, legal regulations, and design practices. Communities like AllCanAccess provide opportunities to learn from experts, share real-world accessibility challenges, participate in discussions, attend webinars, collaborate on solutions, and improve accessibility implementation skills across digital products."
  },
  {
    q: "Who can join the AllCanAccess community?",
    a: "AllCanAccess is open to everyone interested in accessibility and inclusive technology. This includes accessibility testers, developers, designers, QA engineers, product managers, compliance teams, educators, students, assistive technology users, business owners, and organizations working toward digital inclusion. Whether someone is a beginner learning accessibility fundamentals or an experienced accessibility consultant, the community provides resources and discussions suitable for all skill levels."
  },
  {
    q: "What topics are discussed in accessibility communities?",
    a: "Accessibility communities discuss a wide range of topics related to digital inclusion and accessibility compliance. Common topics include WCAG 2.2 guidelines, screen reader testing, keyboard accessibility, ARIA implementation, color contrast compliance, mobile accessibility, PDF accessibility, accessibility automation, inclusive UX design, assistive technologies, ADA compliance, accessibility audits, accessibility testing tools, semantic HTML, accessibility in CI/CD pipelines, and accessibility remediation strategies."
  },
  {
    q: "How does an accessibility community help organizations improve compliance?",
    a: "Accessibility communities help organizations improve compliance by sharing practical implementation knowledge, accessibility testing strategies, remediation techniques, and industry best practices. Organizations can learn how to identify accessibility barriers early, integrate accessibility into development workflows, conduct audits, automate testing, and maintain WCAG compliance over time. Communities also help teams stay informed about accessibility lawsuits, legal requirements, and emerging accessibility technologies."
  },
  {
    q: "What is WCAG and why is it important for accessibility communities?",
    a: "WCAG (Web Content Accessibility Guidelines) is the internationally recognized standard for digital accessibility created by the W3C. Accessibility communities heavily focus on WCAG because it provides the foundation for creating accessible websites, applications, and digital content. WCAG is built on four principles — Perceivable, Operable, Understandable, and Robust (POUR). Communities like AllCanAccess help members understand WCAG success criteria, accessibility testing methods, and real-world implementation practices."
  },
  {
    q: "How do accessibility communities support accessibility testing learning?",
    a: "Accessibility communities provide educational resources, expert guidance, live discussions, webinars, workshops, and real-world examples to help members learn accessibility testing. Members can understand automated testing tools, manual accessibility audits, keyboard navigation testing, screen reader testing, color contrast validation, and accessibility issue remediation. Communities also allow learners to ask questions, share challenges, and receive support from experienced accessibility professionals."
  },
  {
    q: "What are the benefits of accessibility networking communities?",
    a: "Accessibility networking communities help professionals connect with industry experts, recruiters, organizations, accessibility advocates, and assistive technology users. These communities create opportunities for collaboration, career growth, knowledge sharing, mentorship, accessibility events, and partnerships. Networking within accessibility communities also helps organizations build stronger accessibility programs by learning from industry experiences and accessibility success stories."
  },
  {
    q: "How does accessibility improve user experience for everyone?",
    a: "Accessibility improves usability for all users, not only people with disabilities. Features such as proper headings, keyboard navigation, captions, responsive layouts, readable content, and clear navigation improve overall user experience, SEO performance, mobile usability, and customer satisfaction. Accessibility communities help spread awareness that inclusive design benefits every user, including older adults, users in temporary impairments, and users in challenging environments."
  },
  {
    q: "Why is digital accessibility becoming increasingly important worldwide?",
    a: "Digital accessibility is becoming increasingly important because governments and organizations worldwide are strengthening accessibility laws and compliance requirements. Regulations such as ADA in the United States, Section 508, EN 301 549 in Europe, and the European Accessibility Act require accessible digital experiences. Additionally, over 1.3 billion people globally live with disabilities, making accessibility essential for equal access to information, services, education, healthcare, and employment. Accessibility communities like AllCanAccess play a major role in spreading awareness and helping organizations adopt inclusive digital experiences."
  }
];

// Generate structured data for Google
const faqStructuredData = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": SEO_FAQS.map(faq => ({
    "@type": "Question",
    "name": faq.q,
    "acceptedAnswer": {
      "@type": "Answer",
      "text": faq.a
    }
  }))
};

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

export default function AboutUs() {
  return (
    <div className={styles.container}>
      <SEO 
        title="AllCanAccess | Global Accessibility Community for Inclusive Digital Experiences"
        description="Join AllCanAccess, a global accessibility community focused on WCAG compliance, inclusive design, assistive technologies, accessibility testing, ADA compliance, and digital inclusion."
        keywords="accessibility community, digital accessibility community, WCAG community, accessibility testing community, inclusive design community, ADA compliance community, web accessibility community, accessibility professionals network, accessibility learning platform, assistive technology community, accessibility forum, accessibility knowledge sharing platform, accessibility QA community, accessibility experts community, WCAG 2.2 community, accessibility awareness platform, inclusive UX community, accessibility automation community, accessibility discussions, AllCanAccess"
        structuredData={faqStructuredData}
      />
      <div className={styles.gradientBar} aria-hidden="true" />

      <div className={styles.contentWrapper}>

        {/* Hero */}
        <header className={styles.header}>
          <span className={styles.tagline}>
            About AllCanAccess
          </span>
          <h1 className={styles.title}>
            Building a More Accessible<br />and Inclusive Digital World
          </h1>
          <p className={styles.subtitle}>
            AllCanAccess is a community-driven platform dedicated to promoting accessibility, inclusion, and equal digital experiences for everyone.
          </p>
          <p className={styles.paragraph}>
            We believe that technology should empower people—not create barriers. Yet millions of individuals continue to face challenges when accessing websites, applications, digital content, and online services. Our mission is to help bridge that gap by fostering awareness, sharing knowledge, encouraging collaboration, and supporting accessibility best practices across industries.
          </p>
          <p className={styles.paragraphLast}>
            AllCanAccess brings together accessibility advocates, designers, developers, testers, content creators, educators, organizations, and individuals who share a common goal: creating digital experiences that everyone can access and use with confidence.
          </p>
        </header>

        {/* Vision & Mission */}
        <div className={styles.visionMissionGrid}>
          {/* Vision */}
          <div className={styles.card}>
            <div className={styles.cardIcon} aria-hidden="true">◈</div>
            <h2 className={styles.cardTitle}>Our Vision</h2>
            <p className={styles.cardDesc}>
              To create a world where accessibility is not an afterthought but a fundamental part of every digital experience.
            </p>
            <p className={styles.cardDescLast}>
              We envision a future where technology is designed with inclusion in mind from the very beginning, enabling people of all abilities to participate fully in education, employment, communication, and everyday life.
            </p>
          </div>

          {/* Mission */}
          <div className={styles.card}>
            <div className={styles.cardIcon} aria-hidden="true">⊙</div>
            <h2 className={styles.cardTitleSmallMargin}>Our Mission</h2>
            <p className={styles.cardDescSmallMargin}>Our mission is to:</p>
            <BulletList items={MISSION_LIST} />
          </div>
        </div>

        {/* What We Do */}
        <div className={styles.whatWeDoCard}>
          <h2 className={styles.whatWeDoTitle}>What We Do</h2>
          <p className={styles.cardDescSmallMargin}>Through our community, we provide opportunities to:</p>
          <div className={styles.whatWeDoGrid}>
            {WHAT_WE_DO.map((item, i) => (
              <div key={i} className={styles.bulletItem}>
                <span className={styles.bulletIcon} aria-hidden="true" />
                {item}
              </div>
            ))}
          </div>
          <p className={styles.whatWeDoFooter}>
            We believe that accessibility is not solely the responsibility of developers or designers — it is a shared responsibility across teams, organizations, and communities.
          </p>
        </div>

        {/* Why Accessibility Matters */}
        <div className={styles.whyMatters}>
          <h2 className={styles.whyMattersTitle}>Why Accessibility Matters</h2>
          <p className={styles.whyMattersSubtitle}>Accessibility benefits everyone.</p>
          <p className={styles.whyMattersText}>
            Whether it's captions on a video, keyboard navigation, readable content, voice interactions, or inclusive design practices, accessibility creates better experiences for all users — not just those with disabilities.
          </p>
          <p className={styles.whyMattersTextLast}>
            By designing for diverse needs and experiences, we build products, services, and communities that are more usable, welcoming, and effective for everyone.
          </p>
        </div>

        {/* Core Values */}
        <div className={styles.valuesWrapper}>
          <div className={styles.valuesCard}>
            <h2 className={styles.valuesTitle}>Our Community Values</h2>
            <p className={styles.valuesSubtitle}>Everything we do is guided by four core values:</p>
            <div className={styles.valuesGrid}>
              {VALUES.map((v, i) => (
                <div key={i} className={styles.valueItem}>
                  <div className={styles.valueIcon} aria-hidden="true">{v.icon}</div>
                  <div>
                    <h3 className={styles.valueItemTitle}>{v.title}</h3>
                    <p className={styles.valueItemDesc}>{v.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Join the Movement */}
        <div className={styles.joinSection}>
          <h2 className={styles.joinTitle}>Join the Movement</h2>
          <p className={styles.joinText}>
            Creating a more accessible world requires collective effort.
          </p>
          <p className={styles.joinText}>
            Whether you're just beginning your accessibility journey or have years of experience, AllCanAccess welcomes you to learn, contribute, collaborate, and help shape a future where digital experiences are accessible to all.
          </p>
          <p className={styles.joinTextBold}>
            Together, we can build a world where everyone can access, participate, and thrive.
          </p>
          <Link to="/join" className={styles.joinBtn}>
            Join the community →
          </Link>
        </div>

        {/* SEO FAQs */}
        <div className={styles.faqSection} aria-labelledby="faq-title">
          <h2 id="faq-title" className={styles.valuesTitle}>Frequently Asked Questions</h2>
          <p className={styles.valuesSubtitle}>Learn more about our community and digital accessibility.</p>
          <dl className={styles.faqList}>
            {SEO_FAQS.map((faq, index) => (
              <div key={index} className={styles.faqItem}>
                <dt className={styles.faqQuestion}>{faq.q}</dt>
                <dd className={styles.faqAnswer}>{faq.a}</dd>
              </div>
            ))}
          </dl>
        </div>

      </div>
    </div>
  );
}