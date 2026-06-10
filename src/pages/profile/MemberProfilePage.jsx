import { useState, useEffect } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { usersApi } from 'api/client';
import { COLOR_MAP } from 'data';
import styles from './MemberProfilePage.module.css';

export default function MemberProfilePage({ goToPortal }) {
  const { memberId } = useParams();
  const location = useLocation();
  const [member, setMember] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!memberId) return;
    setLoading(true);
    usersApi.getProfile(memberId)
      .then(res => {
        setMember(res.profile);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message || "Failed to load profile.");
        setLoading(false);
      });
  }, [memberId]);

  if (loading) {
    return (
      <div className={styles.page}>
        <p className={styles.missing}>Loading profile...</p>
      </div>
    );
  }

  if (error || !member) {
    return (
      <div className={styles.page}>
        <p className={styles.missing}>{error || "This profile could not be found."}</p>
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
