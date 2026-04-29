import { TOOLS, CERTS, COLOR_MAP } from '../data';
import styles from './Tools.module.css';

function BadgePill({ label, color }) {
  const c = COLOR_MAP[color] || COLOR_MAP.blue;
  return (
    <span className={styles.badge} style={{ background: c.bg, color: c.text }}>
      {label}
    </span>
  );
}

export default function Tools() {
  return (
    <div className={styles.page}>
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
        <div className={styles.toolGrid}>
          {TOOLS.map((t, i) => (
            <a
              key={i}
              href={t.url}
              target="_blank"
              rel="noopener noreferrer"
              className={`${styles.toolCard} fade-up`}
              style={{ animationDelay: `${i * 0.04}s` }}
              aria-label={`${t.name} — ${t.type} — ${t.price}${t.badge ? ` — ${t.badge}` : ''}`}
            >
              <div className={styles.toolTop}>
                <div className={styles.toolIcon}>{t.icon}</div>
                {t.badge && <BadgePill label={t.badge} color={t.badgeColor} />}
              </div>
              <h3 className={styles.toolName}>{t.name}</h3>
              <p className={styles.toolType}>{t.type}</p>
              <div className={styles.toolFooter}>
                <span className={styles.toolPrice}>{t.price}</span>
                <span className={styles.toolArrow} aria-hidden="true">↗</span>
              </div>
            </a>
          ))}
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
                  <div className={styles.certBadge} style={{ background: col.bg }}>
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
                <button className={styles.certBtn}>Learn more →</button>
              </article>
            );
          })}
        </div>
      </section>
    </div>
  );
}
