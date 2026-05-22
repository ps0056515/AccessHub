import { useLayoutEffect, useMemo, useState } from 'react';
import { ALL_EVENTS } from '../data';
import Modal from './Modal';
import styles from './Events.module.css';

const TYPES = ['All', 'Free', 'Members only', 'In-person'];

const HOST_SUBMIT_KEY = 'allcanaccess-host-submissions';

function timingLabel(t) {
  if (t.timing === 'past') return 'Past';
  if (t.timing === 'live') return 'Live now';
  return 'Upcoming';
}

export default function Events() {
  const [filter, setFilter] = useState('All');
  const [rsvpEvent, setRsvpEvent] = useState(null);
  const [hostOpen, setHostOpen] = useState(false);
  const [hostTitle, setHostTitle] = useState('');
  const [hostFormat, setHostFormat] = useState('webinar');
  const [hostDate, setHostDate] = useState('');
  const [hostEmail, setHostEmail] = useState('');
  const [hostDetails, setHostDetails] = useState('');
  const [hostMsg, setHostMsg] = useState(null);

  useLayoutEffect(() => {
    const raw = sessionStorage.getItem('aa-nav');
    if (!raw) return;
    try {
      const { focusEventId } = JSON.parse(raw);
      if (focusEventId) {
        requestAnimationFrame(() => {
          document.getElementById(`event-${focusEventId}`)?.scrollIntoView({
            behavior: 'smooth',
            block: 'center',
          });
        });
      }
    } catch {
      /* ignore */
    } finally {
      sessionStorage.removeItem('aa-nav');
    }
  }, []);

  const filtered = useMemo(() => {
    return ALL_EVENTS.filter(e => {
      if (filter === 'All') return true;
      if (filter === 'In-person') return e.band === 'In-person';
      if (filter === 'Free') return e.band === 'Free';
      if (filter === 'Members only') return e.band === 'Members only';
      return true;
    });
  }, [filter]);

  const grouped = useMemo(() => {
    const past = filtered.filter(e => e.timing === 'past');
    const live = filtered.filter(e => e.timing === 'live');
    const upcoming = filtered.filter(e => e.timing === 'upcoming');
    return { past, live, upcoming };
  }, [filtered]);

  const closeHost = () => {
    setHostOpen(false);
    setHostMsg(null);
  };

  const handleHostSubmit = e => {
    e.preventDefault();
    const title = hostTitle.trim();
    const email = hostEmail.trim();
    if (!title || !email) {
      setHostMsg('Please add an event title and a contact email.');
      return;
    }
    try {
      const prev = sessionStorage.getItem(HOST_SUBMIT_KEY);
      const list = prev ? JSON.parse(prev) : [];
      const entry = {
        title,
        format: hostFormat,
        proposedDate: hostDate.trim(),
        email,
        details: hostDetails.trim(),
        submittedAt: new Date().toISOString(),
      };
      const next = Array.isArray(list) ? [...list, entry] : [entry];
      sessionStorage.setItem(HOST_SUBMIT_KEY, JSON.stringify(next));
    } catch {
      /* ignore */
    }
    setHostMsg(
      'Thanks — your proposal was saved in this browser for the demo. With a backend we would email you a confirmation and review timeline.'
    );
    setHostTitle('');
    setHostFormat('webinar');
    setHostDate('');
    setHostEmail('');
    setHostDetails('');
  };

  return (
    <div className={styles.page}>
      <header className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>Events &amp; workshops</h1>
        <p className={styles.pageSub}>
          Live sessions, workshops, and meetups run by and for the accessibility community.
        </p>
        <fieldset className={styles.filterFieldset}>
          <legend className="sr-only">Filter events by type</legend>
          <div className={styles.filters}>
            {TYPES.map(t => (
              <label
                key={t}
                className={`${styles.filterLabel} ${filter === t ? styles.filterSelected : ''}`}
              >
                <input
                  type="radio"
                  name="event-type-filter"
                  className={styles.filterInput}
                  value={t}
                  checked={filter === t}
                  onChange={() => setFilter(t)}
                />
                <span className={styles.filterText}>{t}</span>
              </label>
            ))}
          </div>
        </fieldset>
      </header>

      {grouped.live.length > 0 ? (
        <section className={styles.eventSection} aria-labelledby="live-heading">
          <h2 id="live-heading" className={styles.sectionLabel}>
            Happening now
          </h2>
          <div className={styles.eventGrid}>
            {grouped.live.map((e, i) => (
              <EventCard
                key={e.id}
                ev={e}
                i={i}
                onRsvp={() => setRsvpEvent(e)}
                timing={timingLabel(e)}
              />
            ))}
          </div>
        </section>
      ) : null}

      <section className={styles.eventSection} aria-labelledby="up-heading">
        <h2 id="up-heading" className={styles.sectionLabel}>
          Upcoming
        </h2>
        <div className={styles.eventGrid}>
          {grouped.upcoming.map((e, i) => (
            <EventCard
              key={e.id}
              ev={e}
              i={i}
              onRsvp={() => setRsvpEvent(e)}
              timing={timingLabel(e)}
            />
          ))}
        </div>
        {grouped.upcoming.length === 0 ? (
          <p className={styles.empty}>No upcoming events match this filter.</p>
        ) : null}
      </section>

      <section className={styles.eventSection} aria-labelledby="past-heading">
        <h2 id="past-heading" className={styles.sectionLabel}>
          Past
        </h2>
        <div className={styles.eventGrid}>
          {grouped.past.map((e, i) => (
            <EventCard
              key={e.id}
              ev={e}
              i={i}
              onRsvp={() => setRsvpEvent(e)}
              timing={timingLabel(e)}
            />
          ))}
        </div>
        {grouped.past.length === 0 ? (
          <p className={styles.empty}>No past events in this filter.</p>
        ) : null}
      </section>

      <div className={styles.hostBanner}>
        <div className={styles.hostBannerContent}>
          <h2 className={styles.hostTitle}>Host an event</h2>
          <p className={styles.hostSub}>
            Running a workshop, webinar, or local meetup? Reach thousands of practitioners through AllCanAccess.
          </p>
          <button type="button" className={styles.hostBtn} onClick={() => setHostOpen(true)}>
            Submit your event →
          </button>
        </div>
      </div>

      {rsvpEvent ? (
        <Modal title={`RSVP: ${rsvpEvent.title}`} onClose={() => setRsvpEvent(null)}>
          <p>{rsvpEvent.type}</p>
          <p className={styles.rsvpHint} role="status" aria-live="polite">
            You’re on the list for this session (demo). We’d email a calendar invite with a real backend.
          </p>
        </Modal>
      ) : null}

      {hostOpen ? (
        <Modal title="Host an event" onClose={closeHost}>
          <p className={styles.hostModalIntro}>
            Tell us about your session. We’ll review community fit, timing, and accessibility needs before it goes
            live — same flow whether you’re on a preview build or production.
          </p>
          <form onSubmit={handleHostSubmit} noValidate>
            <label className={styles.formLabel}>
              Event title
              <input
                className={styles.formInput}
                name="host-title"
                autoComplete="off"
                value={hostTitle}
                onChange={e => setHostTitle(e.target.value)}
              />
            </label>
            <label className={styles.formLabel}>
              Format
              <select
                className={styles.formInput}
                name="host-format"
                value={hostFormat}
                onChange={e => setHostFormat(e.target.value)}
              >
                <option value="webinar">Webinar (online)</option>
                <option value="workshop">Workshop (online)</option>
                <option value="meetup">Local meetup (in person)</option>
                <option value="hybrid">Hybrid</option>
              </select>
            </label>
            <label className={styles.formLabel}>
              Proposed date or window
              <input
                className={styles.formInput}
                name="host-date"
                placeholder="e.g. July 2026, or 15 Sept afternoon"
                value={hostDate}
                onChange={e => setHostDate(e.target.value)}
              />
            </label>
            <label className={styles.formLabel}>
              Contact email
              <input
                className={styles.formInput}
                name="host-email"
                type="email"
                autoComplete="email"
                inputMode="email"
                value={hostEmail}
                onChange={e => setHostEmail(e.target.value)}
              />
            </label>
            <label className={styles.formLabel}>
              Details (audience, length, accessibility plans)
              <textarea
                className={styles.formTextarea}
                name="host-details"
                rows={4}
                value={hostDetails}
                onChange={e => setHostDetails(e.target.value)}
              />
            </label>
            {hostMsg ? (
              <p className={styles.formMsg} role="status" aria-live="polite">
                {hostMsg}
              </p>
            ) : null}
            <div className={styles.submitFooter}>
              <button type="button" className={styles.submitCancel} onClick={closeHost}>
                Cancel
              </button>
              <button type="submit" className={styles.submitOk}>
                Submit proposal
              </button>
            </div>
          </form>
        </Modal>
      ) : null}
    </div>
  );
}

function EventCard({ ev, i, onRsvp, timing }) {
  return (
    <article
      id={`event-${ev.id}`}
      className={`${styles.eventCard} fade-up`}
      style={{ animationDelay: `${i * 0.05}s` }}
    >
      <div className={styles.dateBadge}>
        <span className={styles.dateMonth}>{ev.month}</span>
        <span className={styles.dateDay}>{ev.day}</span>
      </div>
      <div className={styles.eventBody}>
        <p className={styles.timingPill}>{timing}</p>
        <h2 className={styles.eventTitle}>{ev.title}</h2>
        <p className={styles.eventMeta}>{ev.type}</p>
      </div>
      <button
        type="button"
        className={styles.rsvpBtn}
        onClick={e => {
          e.preventDefault();
          e.stopPropagation();
          onRsvp();
        }}
      >
        RSVP →
      </button>
    </article>
  );
}
