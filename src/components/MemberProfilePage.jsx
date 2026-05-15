import { useParams, useLocation } from 'react-router-dom';
import { MEMBERS, COLOR_MAP } from '../data';
import styles from './MemberProfilePage.module.css';

function findMember(id) {
  return MEMBERS.find(m => m.id === id) ?? null;
}

export default function MemberProfilePage({ goToPortal }) {
  const { memberId } = useParams();
  const location = useLocation();
  const member = memberId ? findMember(memberId) : null;

  if (!member) {
    return (
      <div className={styles.page}>
        <p className={styles.missing}>This profile could not be found.</p>
        <button type="button" className={styles.back} onClick={goToPortal}>
          Back to community
        </button>
      </div>
    );
  }

  const colors = COLOR_MAP[member.color] || COLOR_MAP.blue;

  return (
    <div className={styles.page}>
      <nav className={styles.breadcrumb} aria-label="Breadcrumb">
        <button type="button" className={styles.crumbBtn} onClick={goToPortal}>
          Community
        </button>
        <span aria-hidden="true" className={styles.sep}>
          /
        </span>
        <span className={styles.crumbCurrent}>Profile</span>
      </nav>

      <header className={styles.header}>
        <div
          className={styles.avatar}
          style={{ background: colors.bg, color: colors.text }}
          aria-hidden="true"
        >
          {member.initials}
        </div>
        <div className={styles.headerText}>
          <h1 className={styles.name}>{member.name}</h1>
          <p className={styles.role}>{member.role}</p>
          {member.hot ? (
            <span className={styles.hot}>Active contributor</span>
          ) : null}
        </div>
      </header>

      <section className={styles.section} aria-labelledby="about-heading">
        <h2 id="about-heading" className={styles.sectionTitle}>
          About
        </h2>
        <p className={styles.bio}>{member.bio}</p>
      </section>

      <p className={styles.urlHint}>
        Public profile ·{' '}
        <span className={styles.mono}>{location.pathname}</span>
      </p>

      <button type="button" className={styles.primaryBtn} onClick={goToPortal}>
        Back to discussions
      </button>
    </div>
  );
}
