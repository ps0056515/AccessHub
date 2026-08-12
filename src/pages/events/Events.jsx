import { useLayoutEffect, useMemo, useState, useEffect } from 'react';
import { eventsApi } from 'api/client';
import { useAuth } from 'context/AuthContext';
import { useToast } from 'context/ToastContext';
import { useAriaLive } from 'context/AriaLiveContext';
import RsvpModal from "./RsvpModal";
import HostEventModal from "./HostEventModal";
import Container from 'components/common/Container/Container';
import SEO from 'components/common/SEO/SEO';
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
  const { addToast } = useToast();
  const { announce } = useAriaLive();
  const [eventsList, setEventsList] = useState([]);
  const [eventsLoading, setEventsLoading] = useState(true);
  const [filter, setFilter] = useState('All');
  const [rsvpEvent, setRsvpEvent] = useState(null);
  const [hostOpen, setHostOpen] = useState(false);

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

  useEffect(() => {
    // We only want to announce when the user explicitly applies a filter, but since filter changes immediately on radio button click, 
    // we can just announce whenever the filtered array length changes.
    // If it's the initial load, it might announce "All events", which is fine.
    announce(`Filters applied: ${filtered.length} events found.`);
  }, [filtered.length, announce]);

  const closeHost = () => {
    setHostOpen(false);
  };

  const closeRsvp = () => {
    setRsvpEvent(null);
  };

  return (
    <Container className={styles.page}>
      <SEO 
        title="Accessibility Events & Workshops | AllCanAccess"
        description="Attend live digital accessibility events, interactive WCAG workshops, and inclusive design webinars. Network with global a11y experts and learn practical accessibility implementation from industry leaders."
        keywords="accessibility events, WCAG workshops, digital accessibility webinars, inclusive design meetups, a11y conferences, web accessibility training, accessibility community events, ADA compliance webinars, Section 508 workshops, screen reader demonstrations, accessibility networking, IAAP study groups, accessibility professional development, inclusive UX seminars, digital inclusion events, accessibility testing workshops, ARIA implementation training, global accessibility awareness day, GAAD events, accessibility panel discussions, accessibility masterclasses, accessible tech events, accessibility developer meetups, accessibility conferences 2026, web accessibility summits"
      />
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
              <button
                key={t}
                type="button"
                className={`${styles.filterLabel} ${filter === t ? styles.filterSelected : ''}`}
                aria-pressed={filter === t}
                onClick={() => setFilter(t)}
              >
                <span className={styles.filterText}>{t}</span>
              </button>
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
          <button type="button" className={styles.hostBtn} onClick={() => setHostOpen(true)} aria-haspopup="dialog">
            Submit your event <span aria-hidden="true">→</span>
          </button>
        </div>
      </div>

      <RsvpModal event={rsvpEvent} onClose={closeRsvp} />
      <HostEventModal isOpen={hostOpen} onClose={closeHost} />
    </Container>
  );
}

function EventCard({ ev, i, onRsvp, timing }) {
  return (
    <article
      id={`event-${ev.id}`}
      className={`${styles.eventCard} fade-up`}
      style={{ animationDelay: `${i * 0.05}s` }}
      aria-labelledby={`event-title-${ev.id}`}
    >
      <div className={styles.dateBadge}>
        <span className={styles.dateMonth}>{fmtMonth(ev.event_date)}</span>
        <span className={styles.dateDay}>{fmtDay(ev.event_date)}</span>
      </div>
      <div className={styles.eventBody}>
        <p className={styles.timingPill}>{timing} • {fmtTime(ev.event_date)}</p>
        <h2 id={`event-title-${ev.id}`} className={styles.eventTitle}>{ev.title}</h2>
        <p className={styles.eventMeta}>{ev.type}</p>
        
        {(() => {
          let parsedTags = [];
          if (ev.tags) {
            try {
              parsedTags = JSON.parse(ev.tags);
            } catch (err) {}
          }
          if (!parsedTags || parsedTags.length === 0) return null;
          return (
            <div className={styles.eventTags}>
              {parsedTags.map(tag => (
                <span key={tag} className={styles.eventTag}>{tag}</span>
              ))}
            </div>
          );
        })()}
      </div>
      <button
        type="button"
        className={styles.rsvpBtn}
        disabled={timing === 'Past'}
        aria-label={timing === 'Past' ? `Event Completed: ${ev.title}` : `RSVP for ${ev.title}`}
        onClick={e => {
          e.preventDefault();
          e.stopPropagation();
          if (timing !== 'Past') onRsvp();
        }}
      >
        {timing === 'Past' ? 'Event Completed' : <>RSVP <span aria-hidden="true">→</span></>}
      </button>
    </article>
  );
}
