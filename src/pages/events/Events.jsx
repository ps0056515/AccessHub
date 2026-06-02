import { useLayoutEffect, useMemo, useState, useEffect } from 'react';
import { eventsApi } from 'api/client';
import { useAuth } from 'context/AuthContext';
import Modal from 'components/common/Modal/Modal';
import Container from 'components/common/Container/Container';
import styles from './Events.module.css';

const TYPES = ['All', 'Free', 'Members only', 'In-person'];

const HOST_SUBMIT_KEY = 'allcanaccess-host-submissions';
const MONTH_ABBRS = ['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC'];

function getEventTiming(eventDateStr) {
  if (!eventDateStr) return 'upcoming';
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const d = new Date(String(eventDateStr).slice(0, 10) + 'T00:00:00');
  const diff = d - today;
  if (diff < 0) return 'past';
  if (diff === 0) return 'live';
  return 'upcoming';
}

function fmtMonth(dateStr) {
  if (!dateStr) return '';
  return MONTH_ABBRS[new Date(String(dateStr).slice(0, 10) + 'T00:00:00Z').getUTCMonth()] ?? '';
}

function fmtDay(dateStr) {
  if (!dateStr) return '';
  return String(new Date(String(dateStr).slice(0, 10) + 'T00:00:00Z').getUTCDate());
}

function fmtTime(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', timeZoneName: 'short' });
}

function timingLabel(timing) {
  if (timing === 'past') return 'Past';
  if (timing === 'live') return 'Live now';
  return 'Upcoming';
}

export default function Events() {
  const { user } = useAuth();
  const [eventsList, setEventsList] = useState([]);
  const [eventsLoading, setEventsLoading] = useState(true);
  const [filter, setFilter] = useState('All');
  const [rsvpEvent, setRsvpEvent] = useState(null);
  const [rsvpEmail, setRsvpEmail] = useState('');
  const [rsvpMsg, setRsvpMsg] = useState(null);
  const [rsvpSubmitting, setRsvpSubmitting] = useState(false);
  const [hostOpen, setHostOpen] = useState(false);
  const [hostTitle, setHostTitle] = useState('');
  const [hostFormat, setHostFormat] = useState('webinar');
  const [hostDate, setHostDate] = useState('');
  const [hostEmail, setHostEmail] = useState('');
  const [hostDetails, setHostDetails] = useState('');
  const [hostMsg, setHostMsg] = useState(null);

  useEffect(() => {
    eventsApi.list()
      .then(data => { if (Array.isArray(data)) setEventsList(data); })
      .catch(() => {})
      .finally(() => setEventsLoading(false));
  }, []); 

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
    return eventsList.filter(e => {
      if (filter === 'All') return true;
      if (filter === 'In-person') return e.band === 'In-person';
      if (filter === 'Free') return e.band === 'Free';
      if (filter === 'Members only') return e.band === 'Members only';
      return true;
    });
  }, [filter, eventsList]);

  const grouped = useMemo(() => {
    const past = filtered.filter(e => getEventTiming(e.event_date) === 'past');
    const live = filtered.filter(e => getEventTiming(e.event_date) === 'live');
    const upcoming = filtered.filter(e => getEventTiming(e.event_date) === 'upcoming');
    return { past, live, upcoming };
  }, [filtered]);

  const closeHost = () => {
    setHostOpen(false);
    setHostMsg(null);
  };

  const closeRsvp = () => {
    setRsvpEvent(null);
    setRsvpEmail('');
    setRsvpMsg(null);
    setRsvpSubmitting(false);
  };

  const handleRsvpSubmit = async (e) => {
    e.preventDefault();
    const email = user ? user.email : rsvpEmail.trim();
    if (!email) {
      setRsvpMsg('Please enter your email address.');
      return;
    }
    setRsvpSubmitting(true);
    try {
      await eventsApi.rsvp(rsvpEvent.id, {
        email,
        displayName: user?.displayName || null,
      });
      setRsvpMsg("✨ You're on the list! Check your email for a calendar invite.");
    } catch (err) {
      setRsvpMsg(err.message || 'Something went wrong. Please try again.');
    } finally {
      setRsvpSubmitting(false);
    }
  };

  const handleHostSubmit = async e => {
    e.preventDefault();
    const title = hostTitle.trim();
    const email = hostEmail.trim();
    if (!title || !email) {
      setHostMsg('Please add an event title and a contact email.');
      return;
    }
    try {
      await eventsApi.submitProposal({
        title,
        format: hostFormat,
        proposedDate: hostDate.trim() || null,
        email,
        details: hostDetails.trim() || null,
      });
      setHostMsg('Thanks — your proposal has been submitted! Our team will review it and get back to you.');
      setHostTitle('');
      setHostFormat('webinar');
      setHostDate('');
      setHostEmail('');
      setHostDetails('');
    } catch (err) {
      setHostMsg(err.message || 'Failed to submit proposal. Please try again.');
    }
  };

  return (
    <Container className={styles.page}>
      <header className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>Events &amp; workshops</h1>
        <p className={styles.pageSub}>
          Live sessions, workshops, and meetups run by and for the accessibility community.
        </p>
        {eventsLoading && <p className={styles.empty} aria-live="polite">Loading events…</p>}
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
                timing={timingLabel(getEventTiming(e.event_date))}
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
              timing={timingLabel(getEventTiming(e.event_date))}
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
              timing={timingLabel(getEventTiming(e.event_date))}
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
        <Modal title={`RSVP: ${rsvpEvent.title}`} onClose={closeRsvp}>
          <p style={{ marginBottom: 12 }}>{rsvpEvent.type}</p>
          {rsvpMsg ? (
            <p className={styles.rsvpHint} role="status" aria-live="polite">{rsvpMsg}</p>
          ) : (
            <form onSubmit={handleRsvpSubmit}>
              {user ? (
                <p style={{ fontSize: 14, marginBottom: 12 }}>
                  Registering as <strong>{user.displayName}</strong> ({user.email})
                </p>
              ) : (
                <label style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 12 }}>
                  <span style={{ fontSize: 13, fontWeight: 600 }}>Your email address *</span>
                  <input
                    type="email"
                    className={styles.formInput}
                    value={rsvpEmail}
                    onChange={e => setRsvpEmail(e.target.value)}
                    placeholder="you@example.com"
                    required
                    aria-required="true"
                  />
                </label>
              )}
              <div className={styles.submitFooter}>
                <button type="button" className={styles.submitCancel} onClick={closeRsvp}>Cancel</button>
                <button type="submit" className={styles.submitOk} disabled={rsvpSubmitting}>
                  {rsvpSubmitting ? 'Registering…' : 'Confirm RSVP'}
                </button>
              </div>
            </form>
          )}
        </Modal>
      ) : null}

      {hostOpen ? (
        <Modal title="Host an event" onClose={closeHost}>
          <p className={styles.hostModalIntro}>
            Tell us about your session. We’ll review community fit, timing, and accessibility needs before it goes
            live — same flow whether you’re on a preview build or production.
          </p>
          <form onSubmit={handleHostSubmit} noValidate aria-describedby="host-required-note">
            <p id="host-required-note" className={styles.formRequiredNote}>
              Required fields are marked with an asterisk (
              <span className={styles.requiredMark} aria-hidden="true">
                *
              </span>
              ).
            </p>
            <label className={styles.formLabel} htmlFor="host-title">
              <span className={styles.formLabelText}>
                Event title
                <span className={styles.requiredMark} aria-hidden="true">
                  *
                </span>
                <span className="sr-only"> (required)</span>
              </span>
              <input
                id="host-title"
                className={styles.formInput}
                name="host-title"
                autoComplete="off"
                required
                aria-required="true"
                value={hostTitle}
                onChange={e => setHostTitle(e.target.value)}
              />
            </label>
            <label className={styles.formLabel} htmlFor="host-format">
              <span className={styles.formLabelText}>Format</span>
              <select
                id="host-format"
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
            <label className={styles.formLabel} htmlFor="host-date">
              <span className={styles.formLabelText}>
                Proposed date or window
                <span className={styles.optionalMark}> (optional)</span>
              </span>
              <input
                id="host-date"
                className={styles.formInput}
                name="host-date"
                placeholder="e.g. July 2026, or 15 Sept afternoon"
                value={hostDate}
                onChange={e => setHostDate(e.target.value)}
              />
            </label>
            <label className={styles.formLabel} htmlFor="host-email">
              <span className={styles.formLabelText}>
                Contact email
                <span className={styles.requiredMark} aria-hidden="true">
                  *
                </span>
                <span className="sr-only"> (required)</span>
              </span>
              <input
                id="host-email"
                className={styles.formInput}
                name="host-email"
                type="email"
                autoComplete="email"
                inputMode="email"
                required
                aria-required="true"
                value={hostEmail}
                onChange={e => setHostEmail(e.target.value)}
              />
            </label>
            <label className={styles.formLabel} htmlFor="host-details">
              <span className={styles.formLabelText}>
                Details (audience, length, accessibility plans)
                <span className={styles.optionalMark}> (optional)</span>
              </span>
              <textarea
                id="host-details"
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
    </Container>
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
        <span className={styles.dateMonth}>{fmtMonth(ev.event_date)}</span>
        <span className={styles.dateDay}>{fmtDay(ev.event_date)}</span>
      </div>
      <div className={styles.eventBody}>
        <p className={styles.timingPill}>{timing} • {fmtTime(ev.event_date)}</p>
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
