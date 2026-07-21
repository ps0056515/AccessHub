import { useState, useEffect, useMemo } from 'react';
import { CERTS, COLOR_MAP } from 'data';
import { toolsApi } from 'api/client';
import Container from 'components/common/Container/Container';
import SEO from 'components/common/SEO/SEO';
import styles from './Tools.module.css';

function BadgePill({ label, color }) {
  const c = COLOR_MAP[color] || COLOR_MAP.blue;
  return (
    <span className={styles.badge} style={{ background: c.bg, color: c.text }}>
      {label}
    </span>
  );
}

const FILTERS = ['All', 'Web', 'Android', 'iOS', 'React', 'Angular', 'PDF'];

export default function Tools() {
  const [toolsList, setToolsList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedFilter, setSelectedFilter] = useState('All');

  useEffect(() => {
    let cancelled = false;
    async function fetchTools() {
      try {
        const data = await toolsApi.list();
        if (!cancelled && Array.isArray(data)) {
          setToolsList(data);
        }
      } catch (err) {
        console.error('Failed to load tools:', err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    fetchTools();
    return () => {
      cancelled = true;
    };
  }, []);

  const filteredTools = useMemo(() => {
    if (selectedFilter === 'All') return toolsList;
    return toolsList.filter(t => Array.isArray(t.compatibility) && t.compatibility.includes(selectedFilter));
  }, [toolsList, selectedFilter]);


  return (
    <Container className={styles.page}>
      <SEO 
        title="Accessibility Tools & Certifications | AllCanAccess"
        description="Discover industry-standard accessibility testing tools and professional certifications. Compare the best automated WCAG scanners, screen readers, and explore paths for IAAP CPACC and WAS certifications to advance your accessibility career."
        keywords="accessibility testing tools, WCAG checker, automated accessibility scanners, screen readers, NVDA, JAWS, VoiceOver testing, IAAP certifications, CPACC certification, WAS certification, web accessibility evaluation tools, WAVE tool, axe DevTools, accessibility automation, CI/CD accessibility testing, PDF accessibility tools, color contrast analyzers, inclusive design tools, accessibility browser extensions, ADA compliance software, Section 508 testing tools, digital accessibility software, manual accessibility testing, accessibility testing software, a11y tools, enterprise accessibility platforms"
      />
      <header className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>Tools &amp; certifications</h1>
        <p className={styles.pageSub}>
          Community-recommended testing tools and professional development paths.
        </p>
      </header>

      {/* Tools section */}
      <section aria-labelledby="tools-heading">
        <h2 id="tools-heading" className={styles.sectionHeading}>
          Recommended tools
        </h2>
        <p className={styles.sectionSub}>
          Vetted by the community — from quick browser checks to deep CI/CD integration.
        </p>

        <div className={styles.filterBar} role="tablist" aria-label="Filter tools by platform compatibility">
          {FILTERS.map(f => (
            <button
              key={f}
              type="button"
              role="tab"
              aria-selected={selectedFilter === f}
              className={`${styles.filterBtn} ${selectedFilter === f ? styles.filterBtnActive : ''}`}
              onClick={() => setSelectedFilter(f)}
            >
              {f}
            </button>
          ))}
        </div>

        <div className={styles.toolGrid}>
          {loading ? (
            <p style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>Loading tools...</p>
          ) : filteredTools.length === 0 ? (
            <p style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '40px', color: 'var(--text-muted)', fontSize: '15px' }}>
              No tools match the selected platform.
            </p>
          ) : (
            filteredTools.map((t, i) => (
              <a
                key={t.id || i}
                href={t.url}
                target="_blank"
                rel="noopener noreferrer"
                className={`${styles.toolCard} fade-up`}
                style={{ animationDelay: `${i * 0.04}s` }}
                aria-label={`${t.name} — ${t.type} — ${t.price}${t.badge ? ` — ${t.badge}` : ''}${Array.isArray(t.compatibility) && t.compatibility.length > 0 ? ` — Compatible with ${t.compatibility.join(', ')}` : ''}`}
              >
                <div className={styles.toolTop}>
                  <div className={styles.toolIcon}>{t.icon}</div>
                  {t.badge && <BadgePill label={t.badge} color={t.badge_color || t.badgeColor} />}
                </div>
                <h3 className={styles.toolName}>{t.name}</h3>
                <p className={styles.toolType}>{t.type}</p>
                {Array.isArray(t.compatibility) && t.compatibility.length > 0 && (
                  <div className={styles.toolTags}>
                    {t.compatibility.map(c => (
                      <span key={c} className={styles.toolTag}>{c}</span>
                    ))}
                  </div>
                )}
                <div className={styles.toolFooter}>
                  <span className={styles.toolPrice}>{t.price}</span>
                  <span className={styles.toolArrow} aria-hidden="true">↗</span>
                </div>
              </a>
            ))
          )}
        </div>
      </section>

      {/* Certifications */}
      <section aria-labelledby="certs-heading" className={styles.certsSection}>
        <h2 id="certs-heading" className={styles.sectionHeading}>Certifications</h2>
        <p className={styles.sectionSub}>Professional credentials recognised globally by hiring managers and procurement teams.</p>
        <div className={styles.certList}>
          {CERTS.map((c, i) => {
            const col = COLOR_MAP[c.color] || COLOR_MAP.blue;
            return (
              <article
                key={i}
                className={`${styles.certCard} fade-up`}
                style={{ animationDelay: `${i * 0.06}s` }}
              >
                <div className={styles.certLeft}>
                  <div className={styles.certBadge} style={{ background: col.bg, color: col.text }}>
                    <span role="img" aria-hidden="true">{c.icon}</span>
                  </div>
                </div>
                <div className={styles.certBody}>
                  <h3 className={styles.certTitle}>{c.title}</h3>
                  <p className={styles.certDesc}>{c.body}</p>
                  <div className={styles.progressWrap}>
                    <div
                      className={styles.progressFill}
                      style={{ width: `${c.progress}%`, background: col.text }}
                      role="progressbar"
                      aria-valuenow={c.progress}
                      aria-valuemin={0}
                      aria-valuemax={100}
                      aria-label={`${c.progress}% of community members pursuing this certification`}
                    />
                  </div>
                  <p className={styles.certMembers}>{c.members} in our community</p>
                </div>
                <a
                  className={styles.certBtn}
                  href={c.learnMoreUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={e => e.stopPropagation()}
                >
                  Learn more →
                </a>
              </article>
            );
          })}
        </div>
      </section>
    </Container>
  );
}
