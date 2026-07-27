import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { screenReadersApi } from 'api/client';
import Container from 'components/common/Container/Container';
import styles from './ScreenReaderDetail.module.css';

function Kbd({ children }) {
  return <kbd className={styles.kbd}>{children}</kbd>;
}

export default function ScreenReaderDetail() {
  const { id } = useParams();
  const [guide, setGuide] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [phaseIndex, setPhaseIndex] = useState(0);
  const [checked, setChecked] = useState({});

  useEffect(() => {
    loadGuide();
  }, [id]);

  const loadGuide = async () => {
    try {
      setLoading(true);
      const res = await screenReadersApi.get(id);
      setGuide(res);
      if (res.content_json && res.content_json.length > 0) {
        setPhaseIndex(0);
      }
      document.title = `${res.title} · Screen Readers · AllCanAccess`;
    } catch (err) {
      setError('Failed to load guide details.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className={styles.container}>Loading...</div>;
  if (error || !guide) return <div className={styles.container}>{error || 'Guide not found'}</div>;

  const PHASES = guide.content_json || [];
  const current = PHASES[phaseIndex] || PHASES[0] || {};

  const toggleCheck = (phaseId, i) => setChecked(prev => ({ ...prev, [`${phaseId}_${i}`]: !prev[`${phaseId}_${i}`] }));

  const getCheckedCount = (phaseId, phaseChecklist) => {
    if (!phaseChecklist) return 0;
    return phaseChecklist.reduce((count, _, i) => count + (checked[`${phaseId}_${i}`] ? 1 : 0), 0);
  };



  return (
    <Container className={styles.page}>
      <header className={styles.pageHeader}>
        <Link to="/screen-readers" className={styles.backLink}>← Back to screen readers</Link>
        <h1 className={styles.pageTitle}>{guide.title} testing guide</h1>
        <p className={styles.pageSub}>{guide.description}</p>
      </header>

      <div className={styles.layout}>
        {/* Phase nav */}
        <nav className={styles.phaseNav} aria-label="Guide sections">
          {PHASES.map((p, idx) => (
            <button
              key={idx}
              className={`${styles.phaseBtn} ${phaseIndex === idx ? styles.phaseBtnActive : ''}`}
              onClick={() => setPhaseIndex(idx)}
              aria-current={phaseIndex === idx ? 'step' : undefined}
            >
              {p.label}
              {p.checklist && p.checklist.length > 0 && (
                <span className={styles.checkCount}>
                  {getCheckedCount(p.id, p.checklist)}/{p.checklist.length}
                </span>
              )}
            </button>
          ))}
        </nav>

        {/* Content */}
        <div className={styles.content}>

          {/* Steps */}
          {current.steps && current.steps.length > 0 && (
            <div>
              <ol className={styles.stepList}>
                {current.steps.map((s, i) => (
                  <li key={i} className={`${styles.step} fade-up`} style={{ animationDelay: `${i * 0.06}s` }}>
                    <span className={styles.stepNum} aria-hidden="true">{i + 1}</span>
                    <div>
                      <h3 className={styles.stepTitle}>{s.title}</h3>
                      <div className={styles.stepDesc} dangerouslySetInnerHTML={{ __html: s.desc }} />
                    </div>
                  </li>
                ))}
              </ol>
              {current.tip && (
                <div className={styles.tipBox} role="note">
                  <span className={styles.tipIcon} aria-hidden="true">💡</span>
                  <p>{current.tip}</p>
                </div>
              )}
              {current.id === 'modes' && (
                <div className={styles.modeGrid}>
                  <div className={styles.modeCard} style={{ borderLeftColor: 'var(--red)' }}>
                    <h3 className={styles.modeTitle}>Browse mode</h3>
                    <p className={styles.modeDesc}>Red highlight. Single-key navigation shortcuts active. Use for reading and scanning.</p>
                  </div>
                  <div className={styles.modeCard} style={{ borderLeftColor: 'var(--blue)' }}>
                    <h3 className={styles.modeTitle}>Focus mode</h3>
                    <p className={styles.modeDesc}>Blue highlight. Key shortcuts disabled. Use for forms, inputs, and interactive widgets.</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Shortcuts */}
          {current.shortcuts && current.shortcuts.length > 0 && (
            <div>
              {current.shortcuts.map((s, si) => (
                <div key={si} className={styles.shortcutSection}>
                  <h3 className={styles.shortcutHeading}>{s.section}</h3>
                  <table className={styles.table} aria-label={s.section}>
                    <thead>
                      <tr>
                        <th className={styles.th}>Action</th>
                        <th className={styles.th}>Keyboard shortcut</th>
                      </tr>
                    </thead>
                    <tbody>
                      {s.rows.map((r, ri) => (
                        <tr key={ri} className={styles.tr}>
                          <th scope="row" className={styles.tdAction}>{r.action}</th>
                          <td className={styles.tdCmd}>
                            {r.cmd.split(' / ').map((part, pi) => (
                              <span key={pi}>
                                {pi > 0 && <span className={styles.slash}> / </span>}
                                {part.split(' + ').map((k, ki) => (
                                  <span key={ki}>
                                    {ki > 0 && <span className={styles.plus}>+</span>}
                                    <Kbd>{k}</Kbd>
                                  </span>
                                ))}
                              </span>
                            ))}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ))}
              {current.tip && (
                <div className={styles.tipBox} role="note">
                  <span className={styles.tipIcon} aria-hidden="true">💡</span>
                  <p>{current.tip}</p>
                </div>
              )}
            </div>
          )}

          {/* Checklist */}
          {current.checklist && current.checklist.length > 0 && (
            <div>
              <div className={styles.progress}>
                <div className={styles.progressBar}>
                  <div
                    className={styles.progressFill}
                    style={{ width: `${Math.round(getCheckedCount(current.id, current.checklist) / current.checklist.length * 100)}%` }}
                    role="progressbar"
                    aria-valuenow={getCheckedCount(current.id, current.checklist)}
                    aria-valuemin={0}
                    aria-valuemax={current.checklist.length}
                    aria-label={`${getCheckedCount(current.id, current.checklist)} of ${current.checklist.length} checks passed`}
                  />
                </div>
                <span className={styles.progressLabel}>{getCheckedCount(current.id, current.checklist)} / {current.checklist.length}</span>
              </div>
              {[...new Set(current.checklist.map(c => c.group))].map(group => (
                <div key={group} className={styles.checkGroup}>
                  <h3 className={styles.checkGroupTitle}>{group}</h3>
                  <ul className={styles.checkList}>
                    {current.checklist.map((item, i) => item.group === group && (
                      <li key={i} className={styles.checkItem}>
                        <button
                          className={`${styles.checkBox} ${checked[`${current.id}_${i}`] ? styles.checkBoxChecked : ''}`}
                          onClick={() => toggleCheck(current.id, i)}
                          aria-pressed={!!checked[`${current.id}_${i}`]}
                          aria-label={item.label}
                        >
                          {checked[`${current.id}_${i}`] && <span aria-hidden="true">✓</span>}
                        </button>
                        <div>
                          <p className={`${styles.checkLabel} ${checked[`${current.id}_${i}`] ? styles.checkLabelDone : ''}`}>{item.label}</p>
                          <p className={styles.checkSub}>{item.sub}</p>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          )}

          {/* Issues */}
          {current.issues && current.issues.length > 0 && (
            <div>
              <div className={styles.issueList}>
                {current.issues.map((issue, i) => (
                  <article
                    key={i}
                    className={`${styles.issueCard} ${issue.sev === 'high' ? styles.issueHigh : styles.issueMedium} fade-up`}
                    style={{ animationDelay: `${i * 0.06}s` }}
                  >
                    <div className={styles.issueHeader}>
                      <span className={`${styles.issueSev} ${issue.sev === 'high' ? styles.sevHigh : styles.sevMedium}`}>
                        {issue.sev === 'high' ? 'High' : 'Medium'}
                      </span>
                      <h3 className={styles.issueTitle}>{issue.title}</h3>
                    </div>
                    <p className={styles.issueDesc}>{issue.desc}</p>
                  </article>
                ))}
              </div>
              {current.tip && (
                <div className={styles.tipBox} role="note">
                  <span className={styles.tipIcon} aria-hidden="true">💡</span>
                  <p>{current.tip}</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </Container>
  );
}
