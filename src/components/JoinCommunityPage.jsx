import { STATS } from '../data';
import styles from './JoinCommunityPage.module.css';

/**
 * Mirrors how major accessibility communities surface “join / participate”:
 * — Reddit: public forum (feed + post after joining the subreddit)
 * — Discord: real-time server channels
 * — WebAIM: hub with newsletter, blog, RSS, archives, social (webaim.org/community)
 * — IAAP: stats, membership, certification, events (accessibilityassociation.org)
 */
export default function JoinCommunityPage({ goToPortal, goToSection }) {
  const enterDiscussions = () => {
    if (typeof goToPortal === 'function') goToPortal();
    queueMicrotask(() => {
      window.dispatchEvent(new CustomEvent('allcanaccess:focus-ask'));
    });
  };

  return (
    <div className={styles.page}>
      <nav aria-label="Breadcrumb">
        <button type="button" className={styles.btnSecondary} onClick={goToPortal}>
          ← Back to community home
        </button>
      </nav>

      <header className={styles.hero}>
        <p className={styles.heroKicker}>Community</p>
        <h1 className={styles.heroTitle}>Join the accessibility community</h1>
        <p className={styles.lead}>
          Like{' '}
          <a
            className={styles.extLink}
            href="https://www.reddit.com/r/accessibility/"
            target="_blank"
            rel="noopener noreferrer"
          >
            r/accessibility
          </a>
          ,{' '}
          <a
            className={styles.extLink}
            href="https://discord.com/channels/1126532724019187805/1201575159430119464"
            target="_blank"
            rel="noopener noreferrer"
          >
            Discord
          </a>
          ,{' '}
          <a className={styles.extLink} href="https://webaim.org/community/" target="_blank" rel="noopener noreferrer">
            WebAIM
          </a>
          , and{' '}
          <a
            className={styles.extLink}
            href="https://www.accessibilityassociation.org/"
            target="_blank"
            rel="noopener noreferrer"
          >
            IAAP
          </a>
          , All Can Access gives you several ways to learn and take part — starting here or through
          established hubs.
        </p>
        <div className={styles.heroActions}>
          <button type="button" className={styles.btnPrimary} onClick={enterDiscussions}>
            Start on All Can Access — open discussions
          </button>
          <a className={styles.btnSecondary} href="#participate-here">
            Jump to ways to participate
          </a>
        </div>
      </header>

      <section className={styles.stats} aria-labelledby="stats-heading">
        <h2 id="stats-heading" className={styles.srOnly}>
          Community at a glance
        </h2>
        <ul className={styles.statsGrid}>
          {STATS.map(s => (
            <li key={s.label} className={styles.statCard}>
              <span className={styles.statNum}>{s.num}</span>
              <span className={styles.statLabel}>{s.label}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className={styles.section} id="participate-here" aria-labelledby="here-heading">
        <h2 id="here-heading" className={styles.h2}>
          Ways to participate on All Can Access
        </h2>
        <p className={styles.sectionIntro}>
          This mirrors the split you see elsewhere: an open discussion space (like Reddit), curated
          resources (like WebAIM’s articles and newsletter focus), events (like IAAP’s calendar), and
          tooling (like certification study paths).
        </p>
        <ul className={styles.cardGrid}>
          <li className={styles.infoCard}>
            <h3 className={styles.cardTitle}>Discussions</h3>
            <p className={styles.cardBody}>
              Browse threads, vote, and add replies — the same “join then post” flow you use on a
              subreddit.
            </p>
            <button type="button" className={styles.cardBtn} onClick={enterDiscussions}>
              Go to discussions
            </button>
          </li>
          <li className={styles.infoCard}>
            <h3 className={styles.cardTitle}>Resources</h3>
            <p className={styles.cardBody}>
              Guides, articles, and links — similar to WebAIM’s blog and resource sharing.
            </p>
            <button type="button" className={styles.cardBtn} onClick={() => goToSection?.('resources')}>
              Browse resources
            </button>
          </li>
          <li className={styles.infoCard}>
            <h3 className={styles.cardTitle}>Events</h3>
            <p className={styles.cardBody}>
              Meetups, webinars, and conferences — like IAAP’s event listings for the profession.
            </p>
            <button type="button" className={styles.cardBtn} onClick={() => goToSection?.('events')}>
              View events
            </button>
          </li>
          <li className={styles.infoCard}>
            <h3 className={styles.cardTitle}>Tools &amp; NVDA guide</h3>
            <p className={styles.cardBody}>
              Practical checklists and NVDA help — aligned with hands-on learning paths.
            </p>
            <div className={styles.cardBtnRow}>
              <button type="button" className={styles.cardBtnGhost} onClick={() => goToSection?.('tools')}>
                Tools
              </button>
              <button type="button" className={styles.cardBtnGhost} onClick={() => goToSection?.('guide')}>
                NVDA guide
              </button>
            </div>
          </li>
        </ul>
      </section>

      <section className={styles.section} aria-labelledby="reddit-heading">
        <div className={styles.hub}>
          <div className={styles.hubHeader}>
            <p className={styles.hubBadge}>Reddit</p>
            <h2 id="reddit-heading" className={styles.hubTitle}>
              r/accessibility
            </h2>
          </div>
          <p className={styles.hubDesc}>
            Reddit’s pattern: open the subreddit, use <strong>Join</strong> to subscribe, then read the feed
            and <strong>Create Post</strong>. Large public forum for questions, news, and debate.
          </p>
          <a
            className={styles.extLink}
            href="https://www.reddit.com/r/accessibility/"
            target="_blank"
            rel="noopener noreferrer"
          >
            Open r/accessibility (new tab) ↗
          </a>
        </div>

        <div className={styles.hub}>
          <div className={styles.hubHeader}>
            <p className={styles.hubBadge}>Discord</p>
            <h2 className={styles.hubTitle}>Live chat</h2>
          </div>
          <p className={styles.hubDesc}>
            Discord’s pattern: join a server, then pick channels for real-time chat. You need a Discord
            account; the link opens the channel in Discord’s app or web client.
          </p>
          <a
            className={styles.extLink}
            href="https://discord.com/channels/1126532724019187805/1201575159430119464"
            target="_blank"
            rel="noopener noreferrer"
          >
            Open in Discord (new tab) ↗
          </a>
        </div>

        <div className={styles.hub}>
          <div className={styles.hubHeader}>
            <p className={styles.hubBadge}>WebAIM</p>
            <h2 className={styles.hubTitle}>Community hub</h2>
          </div>
          <p className={styles.hubDesc}>
            WebAIM’s community page lists several ways to connect — newsletter, blog, RSS, mailing-list
            archives, and social. Same idea as this page: choose how you want to engage.
          </p>
          <a
            className={styles.extLink}
            href="https://webaim.org/community/"
            target="_blank"
            rel="noopener noreferrer"
          >
            webaim.org/community (overview) ↗
          </a>
          <ul className={styles.linkList}>
            <li>
              <a className={styles.extLink} href="https://webaim.org/newsletter/" target="_blank" rel="noopener noreferrer">
                Newsletter & archive ↗
              </a>
            </li>
            <li>
              <a className={styles.extLink} href="https://webaim.org/blog/" target="_blank" rel="noopener noreferrer">
                Blog ↗
              </a>
            </li>
            <li>
              <a className={styles.extLink} href="https://webaim.org/community/rss" target="_blank" rel="noopener noreferrer">
                RSS feed ↗
              </a>
            </li>
            <li>
              <a
                className={styles.extLink}
                href="https://webaim.org/discussion/archives"
                target="_blank"
                rel="noopener noreferrer"
              >
                E-mail list archives ↗
              </a>
            </li>
            <li>
              <a
                className={styles.extLink}
                href="https://www.linkedin.com/company/webaim/"
                target="_blank"
                rel="noopener noreferrer"
              >
                LinkedIn — WebAIM ↗
              </a>
            </li>
          </ul>
        </div>

        <div className={styles.hub}>
          <div className={styles.hubHeader}>
            <p className={styles.hubBadge}>IAAP</p>
            <h2 className={styles.hubTitle}>International Association of Accessibility Professionals</h2>
          </div>
          <p className={styles.hubDesc}>
            IAAP’s site centres membership, certifications, education, and events — the
            professional-association path (directory, exams, chapters). Use the main site for the latest
            event listings; deep links beyond membership and certification change when IAAP updates their
            CMS.
          </p>
          <ul className={styles.linkList}>
            <li>
              <a
                className={styles.extLink}
                href="https://www.accessibilityassociation.org/"
                target="_blank"
                rel="noopener noreferrer"
              >
                Home — Join IAAP, events &amp; news ↗
              </a>
            </li>
            <li>
              <a
                className={styles.extLink}
                href="https://www.accessibilityassociation.org/membership"
                target="_blank"
                rel="noopener noreferrer"
              >
                Membership overview ↗
              </a>
            </li>
            <li>
              <a
                className={styles.extLink}
                href="https://www.accessibilityassociation.org/certification"
                target="_blank"
                rel="noopener noreferrer"
              >
                Certification overview (CPACC, WAS, …) ↗
              </a>
            </li>
          </ul>
        </div>
      </section>
    </div>
  );
}
