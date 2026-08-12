import { Link } from 'react-router-dom';
import { SITE_NAME } from 'brand';
import styles from './Contact.module.css';

const CARDS = [
  {
    icon: "✉",
    title: "Email Us",
    desc: "For general enquiries, feedback, or partnership ideas.",
    action: (
      <a
        href="mailto:contactus@allcanaccess.com"
        className={styles.action}
      >
        contactus@allcanaccess.com <span aria-hidden="true">→</span>
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
        className={styles.action}
      >
        Visit community page <span aria-hidden="true">→</span>
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
        className={styles.action}
      >
        Report an issue <span aria-hidden="true">→</span>
      </a>
    ),
  },
];

export default function Contact() {
  return (
    <div className={styles.container}>
      <div className={styles.gradientBar} aria-hidden="true" />

      <div className={styles.content}>

        {/* Header */}
        <header className={styles.header}>
          <span className={styles.badge}>
            Contact
          </span>
          <h1 className={styles.title}>
            Get in touch
          </h1>
          <p className={styles.subtitle}>
            We welcome feedback, accessibility questions, and partnership ideas. Choose the best way to reach the {SITE_NAME} team.
          </p>
        </header>

        {/* Contact cards */}
        <div className={styles.grid}>
          {CARDS.map((card, i) => (
            <div key={i} className={styles.card}>
              <div className={styles.icon} aria-hidden="true">
                {card.icon}
              </div>
              <h2 className={styles.cardTitle}>{card.title}</h2>
              <p className={styles.cardDesc}>{card.desc}</p>
              {card.action}
            </div>
          ))}
        </div>

        {/* Response time notice */}
        <div className={styles.notice}>
          <span className={styles.noticeIcon} aria-hidden="true">🕐</span>
          <div>
            <p className={styles.noticeTitle}>Response times</p>
            <p className={styles.noticeDesc}>
              General enquiries: within <strong className={styles.highlight}>3 business days</strong>.&nbsp;
              Accessibility issues: within <strong className={styles.highlight}>2 business days</strong>.&nbsp;
              We read every message and respond personally.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
