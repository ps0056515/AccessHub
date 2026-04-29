import { useState } from 'react';
import { RESOURCES, COLOR_MAP } from '../data';
import styles from './Resources.module.css';

const CATEGORIES = ['All', 'Standards', 'Testing', 'Design', 'Legal', 'Tools'];

export default function Resources() {
  const [activeCategory, setActiveCategory] = useState('All');
  const [query, setQuery] = useState('');

  const filtered = RESOURCES.filter(r =>
    !query || r.title.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className={styles.page}>
      <header className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>Community resources</h1>
        <p className={styles.pageSub}>
          Guides, templates, checklists and references curated by the AccessHub community.
        </p>
      </header>

      <div className={styles.toolbar}>
        <div className={styles.searchWrap}>
          <label htmlFor="res-search" className="sr-only">Search resources</label>
          <input
            id="res-search"
            className={styles.searchInput}
            type="search"
            placeholder="Search resources…"
            value={query}
            onChange={e => setQuery(e.target.value)}
          />
        </div>
        <nav className={styles.catNav} aria-label="Resource categories">
          {CATEGORIES.map(c => (
            <button
              key={c}
              className={`${styles.catBtn} ${activeCategory === c ? styles.catActive : ''}`}
              onClick={() => setActiveCategory(c)}
              aria-pressed={activeCategory === c}
            >
              {c}
            </button>
          ))}
        </nav>
      </div>

      <div className={styles.grid}>
        {filtered.map((r, i) => {
          const c = COLOR_MAP[r.color] || COLOR_MAP.blue;
          return (
            <article
              key={i}
              className={`${styles.card} fade-up`}
              style={{ animationDelay: `${i * 0.05}s` }}
            >
              <div className={styles.cardIcon} style={{ background: c.bg, color: c.text }}>
                <span role="img" aria-hidden="true" style={{ fontSize: 20 }}>{r.icon}</span>
              </div>
              <div className={styles.cardBody}>
                <h2 className={styles.cardTitle}>{r.title}</h2>
                <p className={styles.cardDesc}>{r.desc}</p>
              </div>
              <div className={styles.cardActions}>
                <button className={styles.cardBtn}>View →</button>
                <button className={styles.cardSave} aria-label={`Save ${r.title}`}>
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                    <path d="M2 1h10v12l-5-3-5 3V1z" stroke="currentColor" strokeWidth="1.2"/>
                  </svg>
                </button>
              </div>
            </article>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <p className={styles.empty}>No resources found for "{query}"</p>
      )}

      {/* Submit banner */}
      <div className={styles.submitBanner}>
        <div>
          <h2 className={styles.bannerTitle}>Have a resource to share?</h2>
          <p className={styles.bannerSub}>Submit it for community review and help practitioners worldwide.</p>
        </div>
        <button className={styles.bannerBtn}>Submit a resource →</button>
      </div>
    </div>
  );
}
