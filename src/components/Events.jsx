import { EVENTS } from '../data';
import styles from './Events.module.css';

const ALL_EVENTS = [
  ...EVENTS,
  { month: 'JUL', day: '22', title: 'Designing for cognitive accessibility', type: 'Online · 75 min · Free' },
  { month: 'AUG', day: '5',  title: 'PDF accessibility deep-dive workshop', type: 'Online · 90 min · Free' },
  { month: 'AUG', day: '19', title: 'AccessHub annual survey results reveal', type: 'Online · 60 min · Free' },
  { month: 'SEP', day: '11', title: 'Inclusive UX patterns for mobile', type: 'Online · 90 min · Members only' },
];

const TYPES = ['All', 'Free', 'Members only', 'In-person'];

export default function Events() {
  return (
    <div className={styles.page}>
      <header className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>Events &amp; workshops</h1>
        <p className={styles.pageSub}>
          Live sessions, workshops, and meetups run by and for the accessibility community.
        </p>
        <div className={styles.filters}>
          {TYPES.map(t => (
            <button key={t} className={`${styles.filterBtn} ${t === 'All' ? styles.filterActive : ''}`}>
              {t}
            </button>
          ))}
        </div>
      </header>

      <div className={styles.eventGrid}>
        {ALL_EVENTS.map((e, i) => (
          <article
            key={i}
            className={`${styles.eventCard} fade-up`}
            style={{ animationDelay: `${i * 0.05}s` }}
          >
            <div className={styles.dateBadge}>
              <span className={styles.dateMonth}>{e.month}</span>
              <span className={styles.dateDay}>{e.day}</span>
            </div>
            <div className={styles.eventBody}>
              <h2 className={styles.eventTitle}>{e.title}</h2>
              <p className={styles.eventMeta}>{e.type}</p>
            </div>
            <button className={styles.rsvpBtn}>RSVP →</button>
          </article>
        ))}
      </div>

      <div className={styles.hostBanner}>
        <div className={styles.hostBannerContent}>
          <h2 className={styles.hostTitle}>Host an event</h2>
          <p className={styles.hostSub}>
            Running a workshop, webinar, or local meetup? Reach thousands of practitioners through AccessHub.
          </p>
          <button className={styles.hostBtn}>Submit your event →</button>
        </div>
      </div>
    </div>
  );
}
