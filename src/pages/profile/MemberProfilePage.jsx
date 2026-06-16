import { useState, useEffect } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { usersApi } from 'api/client';
import { COLOR_MAP } from 'data';
import { Mail, MapPin, Building2, Calendar, Briefcase, User, ArrowLeft } from 'lucide-react';
import styles from './MemberProfilePage.module.css';

function formatDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
}

function timeSince(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  const now = new Date();
  const diffMs = now - d;
  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (days < 30) return `${days} day${days !== 1 ? 's' : ''} ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months} month${months !== 1 ? 's' : ''} ago`;
  const years = Math.floor(months / 12);
  const rem = months % 12;
  if (rem === 0) return `${years} year${years !== 1 ? 's' : ''} ago`;
  return `${years} year${years !== 1 ? 's' : ''}, ${rem} month${rem !== 1 ? 's' : ''} ago`;
}

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
        <button type="button" className={styles.primaryBtn} onClick={goToPortal}>
          <ArrowLeft size={16} /> Back to community
        </button>
      </div>
    );
  }

  const colors = COLOR_MAP[member.color] || COLOR_MAP.blue;
  const hasAvatar = !!member.avatarUrl;

  // Build location string
  const locationParts = [member.city, member.country].filter(Boolean);
  const locationStr = locationParts.join(', ');

  // Build company line
  const companyLine = [member.designation, member.company].filter(Boolean).join(' at ');

  return (
    <div className={styles.page}>
      <nav className={styles.breadcrumb} aria-label="Breadcrumb">
        <button type="button" className={styles.crumbBtn} onClick={goToPortal}>
          Community
        </button>
        <span aria-hidden="true" className={styles.sep}>/</span>
        <span className={styles.crumbCurrent}>Profile</span>
      </nav>

      {/* Cover banner */}
      <div className={`${styles.coverBanner} ${styles.fadeUp}`} />

      {/* Profile card */}
      <div className={`${styles.profileCard} ${styles.fadeUp} ${styles.fadeUp1}`}>
        <div className={styles.profileHeader}>
          <div className={styles.avatarWrapper}>
            <div
              className={styles.avatar}
              style={!hasAvatar ? { background: colors.bg, color: colors.text } : undefined}
              aria-hidden="true"
            >
              {hasAvatar ? (
                <img src={member.avatarUrl} alt="" className={styles.avatarImg} />
              ) : (
                member.initials
              )}
            </div>
          </div>
          
          <div className={styles.profileHeaderInfo}>
            <div className={styles.nameRow}>
              <h1 className={styles.name}>{member.name}</h1>
              {member.role && <span className={styles.roleBadge}>{member.role}</span>}
              {member.hot && <span className={styles.hotBadge}>Top Contributor</span>}
            </div>

            <div className={styles.metaRow}>
              {member.email && (
                <span className={styles.metaItem}>
                  <Mail className={styles.metaIcon} />
                  <a href={`mailto:${member.email}`} style={{ color: 'inherit', textDecoration: 'none' }}>
                    {member.email}
                  </a>
                </span>
              )}
              {companyLine && (
                <span className={styles.metaItem}>
                  <Building2 className={styles.metaIcon} />
                  {companyLine}
                </span>
              )}
              {locationStr && (
                <span className={styles.metaItem}>
                  <MapPin className={styles.metaIcon} />
                  {locationStr}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Info Cards */}
      <div className={`${styles.cardsGrid} ${styles.fadeUp} ${styles.fadeUp2}`}>
        {/* About */}
        <div className={`${styles.infoCard} ${styles.infoCardFull}`}>
          <h2 className={styles.cardTitle}>
            <User size={14} /> About
          </h2>
          {member.bio ? (
            <p className={styles.bio}>{member.bio}</p>
          ) : (
            <p className={styles.bioEmpty}>
              No bio provided yet.
            </p>
          )}
        </div>

        {/* Contact & Details */}
        <div className={styles.infoCard}>
          <h2 className={styles.cardTitle}>
            <Mail size={14} /> Contact & Details
          </h2>
          <div className={styles.cardRow}>
            <Mail className={styles.cardRowIcon} />
            <div>
              <div className={styles.cardRowLabel}>Email</div>
              <div className={styles.cardRowValue}>
                {member.email ? (
                  <a href={`mailto:${member.email}`} style={{ color: 'inherit' }}>{member.email}</a>
                ) : (
                  <span className={styles.cardRowEmpty}>Not set</span>
                )}
              </div>
            </div>
          </div>
          <div className={styles.cardRow}>
            <Building2 className={styles.cardRowIcon} />
            <div>
              <div className={styles.cardRowLabel}>Company</div>
              <div className={styles.cardRowValue}>
                {member.company || <span className={styles.cardRowEmpty}>Not set</span>}
              </div>
            </div>
          </div>
        </div>

        {/* Location & Membership */}
        <div className={styles.infoCard}>
          <h2 className={styles.cardTitle}>
            <MapPin size={14} /> Location
          </h2>
          <div className={styles.cardRow}>
            <MapPin className={styles.cardRowIcon} />
            <div>
              <div className={styles.cardRowLabel}>Location</div>
              <div className={styles.cardRowValue}>
                {locationStr || <span className={styles.cardRowEmpty}>Not set</span>}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className={`${styles.fadeUp} ${styles.fadeUp3}`}>
        <p className={styles.urlHint}>
          Public profile ·{' '}
          <span className={styles.mono}>{location.pathname}</span>
        </p>

        <button type="button" className={styles.primaryBtn} onClick={goToPortal} style={{ display: 'flex', margin: '0 auto' }}>
          <ArrowLeft size={16} /> Back to discussions
        </button>
      </div>
    </div>
  );
}
