import { Link } from 'react-router-dom';
import styles from './AboutUs.module.css';

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

      </div>
    </div>
  );
}