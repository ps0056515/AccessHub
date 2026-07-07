import { useState, useEffect } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { usersApi } from 'api/client';
import { COLOR_MAP } from 'data';
import { Mail, MapPin, Building2, Calendar, Briefcase, User, ArrowLeft, MessageSquare, FileText, Star } from 'lucide-react';
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

        {/* Community Stats */}
        <div className={styles.infoCard}>
          <h2 className={styles.cardTitle}>
            <Star size={14} /> Community Stats
          </h2>
          <div className={styles.cardRow}>
            <Star className={styles.cardRowIcon} style={{ color: 'var(--amber-500)' }} />
            <div>
              <div className={styles.cardRowLabel}>Reputation</div>
              <div className={styles.cardRowValue}>
                {member.reputation || 0} Upvotes
              </div>
            </div>
          </div>
          <div className={styles.cardRow}>
            <FileText className={styles.cardRowIcon} />
            <div>
              <div className={styles.cardRowLabel}>Discussions Started</div>
              <div className={styles.cardRowValue}>
                {member.discussionsCount || 0} Posts
              </div>
            </div>
          </div>
          <div className={styles.cardRow}>
            <MessageSquare className={styles.cardRowIcon} />
            <div>
              <div className={styles.cardRowLabel}>Comments Made</div>
              <div className={styles.cardRowValue}>
                {member.commentsCount || 0} Comments
              </div>
            </div>
          </div>
        </div>

        {/* Professional Details */}
        <div className={styles.infoCard}>
          <h2 className={styles.cardTitle}>
            <Briefcase size={14} /> Professional Details
          </h2>
          <div className={styles.cardRow}>
            <Building2 className={styles.cardRowIcon} />
            <div>
              <div className={styles.cardRowLabel}>Company</div>
              <div className={styles.cardRowValue}>
                {member.company || <span className={styles.cardRowEmpty}>Not set</span>}
              </div>
            </div>
          </div>
          <div className={styles.cardRow}>
            <Briefcase className={styles.cardRowIcon} />
            <div>
              <div className={styles.cardRowLabel}>Designation</div>
              <div className={styles.cardRowValue}>
                {member.designation || <span className={styles.cardRowEmpty}>Not set</span>}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className={`${styles.fadeUp} ${styles.fadeUp3}`}>
        <button type="button" className={styles.primaryBtn} onClick={goToPortal} style={{ display: 'flex', margin: '0 auto' }}>
          <ArrowLeft size={16} /> Back to discussions
        </button>
      </div>
    </div>
  );
}
