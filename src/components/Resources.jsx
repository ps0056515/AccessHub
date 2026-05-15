import { useLayoutEffect, useMemo, useState } from 'react';
import { RESOURCES, COLOR_MAP } from '../data';
import Modal from './Modal';
import styles from './Resources.module.css';

const CATEGORIES = ['All', 'Standards', 'Testing', 'Design', 'Legal', 'Tools'];

const SAVED_KEY = 'allcanaccess-saved-resources';
const SUBMISSIONS_KEY = 'allcanaccess-resource-submissions';

function loadSaved() {
  try {
    const raw = localStorage.getItem(SAVED_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? new Set(parsed) : new Set();
  } catch {
    return new Set();
  }
}

export default function Resources({ setActivePage }) {
  const [activeCategory, setActiveCategory] = useState('All');
  const [query, setQuery] = useState('');
  const [saved, setSaved] = useState(loadSaved);
  const [submitOpen, setSubmitOpen] = useState(false);
  const [submitTitle, setSubmitTitle] = useState('');
  const [submitUrl, setSubmitUrl] = useState('');
  const [submitNote, setSubmitNote] = useState('');
  const [submitMsg, setSubmitMsg] = useState(null);

  useLayoutEffect(() => {
    const raw = sessionStorage.getItem('aa-nav');
    if (!raw) return;
    try {
      const { scrollTo, focusEventId } = JSON.parse(raw);
      if (scrollTo === 'certifications') {
        requestAnimationFrame(() => {
          document.getElementById('resource-certifications')?.scrollIntoView({
            behavior: 'smooth',
            block: 'start',
          });
        });
      }
      if (focusEventId) {
        /* consumed by Events page */
      }
    } catch {
      /* ignore */
    } finally {
      sessionStorage.removeItem('aa-nav');
    }
  }, []);

  const filtered = useMemo(() => {
    return RESOURCES.filter(r => {
      if (activeCategory !== 'All' && r.category !== activeCategory) return false;
      if (!query) return true;
      const q = query.toLowerCase();
      return r.title.toLowerCase().includes(q) || r.desc.toLowerCase().includes(q);
    });
  }, [activeCategory, query]);

  const toggleSave = slug => {
    setSaved(prev => {
      const next = new Set(prev);
      if (next.has(slug)) next.delete(slug);
      else next.add(slug);
      try {
        localStorage.setItem(SAVED_KEY, JSON.stringify([...next]));
      } catch {
        /* private mode / quota — state still updates this session */
      }
      return next;
    });
  };

  const handleSubmit = e => {
    e.preventDefault();
    const title = submitTitle.trim();
    const url = submitUrl.trim();
    if (!title || !url) {
      setSubmitMsg('Please add at least a title and link.');
      return;
    }
    try {
      const prev = sessionStorage.getItem(SUBMISSIONS_KEY);
      const list = prev ? JSON.parse(prev) : [];
      const entry = { title, url, note: submitNote.trim(), at: new Date().toISOString() };
      const next = Array.isArray(list) ? [...list, entry] : [entry];
      sessionStorage.setItem(SUBMISSIONS_KEY, JSON.stringify(next));
    } catch {
      /* still show thanks; storage may be unavailable */
    }
    setSubmitMsg('Thanks — we saved your suggestion locally for this demo. You can submit another anytime.');
    setSubmitTitle('');
    setSubmitUrl('');
    setSubmitNote('');
  };

  return (
    <div className={styles.page}>
      <header className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>Community resources</h1>
        <p className={styles.pageSub}>
          Guides, templates, checklists and references curated by the All Can Access community.
        </p>
      </header>

      <section id="resource-certifications" className={styles.certBanner} aria-labelledby="cert-heading">
        <div>
          <h2 id="cert-heading" className={styles.certHeading}>
            Certifications &amp; learning paths
          </h2>
          <p className={styles.certDesc}>
            IAAP credentials, WAS, and structured training tracks — pair these with the checklist resources below.
          </p>
        </div>
        <button
          type="button"
          className={styles.certCta}
          onClick={() => setActivePage?.('tools')}
        >
          Open tools &amp; certifications →
        </button>
      </section>

      <div className={styles.toolbar}>
        <div className={styles.searchWrap}>
          <label htmlFor="res-search" className="sr-only">
            Search resources
          </label>
          <input
            id="res-search"
            className={styles.searchInput}
            type="search"
            placeholder="Search resources…"
            value={query}
            onChange={e => setQuery(e.target.value)}
          />
        </div>
        <fieldset className={styles.catFieldset}>
          <legend className="sr-only">Filter resources by category</legend>
          <div className={styles.catNav}>
            {CATEGORIES.map(c => (
              <label
                key={c}
                className={`${styles.catLabel} ${activeCategory === c ? styles.catActive : ''}`}
              >
                <input
                  type="radio"
                  name="resource-category"
                  className={styles.catInput}
                  value={c}
                  checked={activeCategory === c}
                  onChange={() => setActiveCategory(c)}
                />
                <span className={styles.catText}>{c}</span>
              </label>
            ))}
          </div>
        </fieldset>
      </div>

      <div className={styles.grid}>
        {filtered.map((r, i) => {
          const c = COLOR_MAP[r.color] || COLOR_MAP.blue;
          const isSaved = saved.has(r.slug);
          return (
            <article
              key={r.slug}
              className={`${styles.card} fade-up`}
              style={{ animationDelay: `${i * 0.05}s` }}
            >
              <div className={styles.cardIcon} style={{ background: c.bg, color: c.text }}>
                <span role="img" aria-hidden="true" style={{ fontSize: 20 }}>
                  {r.icon}
                </span>
              </div>
              <div className={styles.cardBody}>
                <p className={styles.cardCat}>{r.category}</p>
                <h2 className={styles.cardTitle}>{r.title}</h2>
                <p className={styles.cardDesc}>{r.desc}</p>
              </div>
              <div className={styles.cardActions}>
                <a className={styles.cardBtn} href={r.viewUrl} target="_blank" rel="noopener noreferrer">
                  View →
                </a>
                <button
                  type="button"
                  className={`${styles.cardSave} ${isSaved ? styles.cardSaveOn : ''}`}
                  aria-label={isSaved ? `Remove from saved: ${r.title}` : `Save for later: ${r.title}`}
                  title={isSaved ? 'Remove from saved' : 'Save for later'}
                  aria-pressed={isSaved}
                  onClick={e => {
                    e.preventDefault();
                    e.stopPropagation();
                    toggleSave(r.slug);
                  }}
                >
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                    <path
                      d="M2 1h10v12l-5-3-5 3V1z"
                      stroke="currentColor"
                      strokeWidth="1.2"
                      fill={isSaved ? 'currentColor' : 'none'}
                    />
                  </svg>
                </button>
              </div>
            </article>
          );
        })}
      </div>

      {filtered.length === 0 ? (
        <p className={styles.empty}>
          {query.trim()
            ? `No resources found for “${query.trim()}” in this category.`
            : `No resources in “${activeCategory}”. Try another category.`}
        </p>
      ) : null}

      <div className={styles.submitBanner}>
        <div>
          <h2 className={styles.bannerTitle}>Have a resource to share?</h2>
          <p className={styles.bannerSub}>Submit it for community review and help practitioners worldwide.</p>
        </div>
        <button type="button" className={styles.bannerBtn} onClick={() => setSubmitOpen(true)}>
          Submit a resource →
        </button>
      </div>

      {submitOpen ? (
        <Modal
          title="Suggest a resource"
          onClose={() => {
            setSubmitOpen(false);
            setSubmitMsg(null);
          }}
        >
          <form id="resource-submit-form" onSubmit={handleSubmit} noValidate>
            <label className={styles.formLabel}>
              Title
              <input
                className={styles.formInput}
                name="resource-title"
                autoComplete="off"
                value={submitTitle}
                onChange={e => setSubmitTitle(e.target.value)}
              />
            </label>
            <label className={styles.formLabel}>
              Link
              <input
                className={styles.formInput}
                name="resource-url"
                type="url"
                inputMode="url"
                placeholder="https://"
                value={submitUrl}
                onChange={e => setSubmitUrl(e.target.value)}
              />
            </label>
            <label className={styles.formLabel}>
              Notes (optional)
              <textarea
                className={styles.formTextarea}
                name="resource-notes"
                rows={3}
                value={submitNote}
                onChange={e => setSubmitNote(e.target.value)}
              />
            </label>
            {submitMsg ? (
              <p className={styles.formMsg} role="status" aria-live="polite">
                {submitMsg}
              </p>
            ) : null}
            <div className={styles.submitFooter}>
              <button
                type="button"
                className={styles.submitCancel}
                onClick={() => {
                  setSubmitOpen(false);
                  setSubmitMsg(null);
                }}
              >
                Cancel
              </button>
              <button type="submit" className={styles.submitOk}>
                Send
              </button>
            </div>
          </form>
        </Modal>
      ) : null}
    </div>
  );
}
