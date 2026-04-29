import { useState } from 'react';
import styles from './NVDAGuide.module.css';

const PHASES = [
  {
    id: 'install', label: '1 · Install & setup',
    steps: [
      { title: 'Download NVDA (Windows only)', desc: 'Visit nvaccess.org and download the latest stable release — it\'s completely free and open-source. Run the .exe installer and follow the prompts.' },
      { title: 'First-run configuration', desc: 'On the first-run dialog: check "Use CapsLock as NVDA modifier key". Uncheck "Start NVDA after I sign in" and "Show this dialog when NVDA starts". Keep the desktop shortcut.' },
      { title: 'Settings for sighted testers', desc: 'Go to Preferences → Settings. Under Vision, check "Enable Highlighting" so you can see what NVDA is focused on. Under Speech, switch to a Microsoft OneCore voice (clearer than the default). Under Keyboard, uncheck "Speak typed characters".' },
      { title: 'Open the Speech Viewer', desc: 'Right-click the NVDA taskbar icon → Tools → Speech Viewer. This displays everything NVDA reads as text — invaluable when the voice is too fast.' },
      { title: 'Launch NVDA, then open your browser', desc: 'Always start NVDA before the browser. Firefox is the preferred test browser. Start NVDA with Ctrl + Alt + N. Quit with NVDA + Q (CapsLock + Q).' },
    ],
    tip: 'Slow down speech rate while learning: press NVDA + Ctrl + ↓. You\'ll speed back up naturally as you gain fluency.',
  },
  {
    id: 'modes', label: '2 · Browse vs focus mode',
    steps: [
      { title: 'Browse mode (default)', desc: 'Reading and navigating mode. Single-letter shortcuts (H, K, F, D…) jump between elements. Arrow keys read content line by line. A red highlight shows where NVDA is focused.' },
      { title: 'Focus mode (for interaction)', desc: 'Used when interacting with form fields, apps, and widgets. Single-letter shortcuts are disabled — keypresses go directly into the control. Blue highlight shows position. NVDA enters this automatically on form fields.' },
      { title: 'Switching between modes', desc: 'Toggle manually with NVDA + Space. You\'ll hear a click sound entering Focus Mode and a beep returning to Browse Mode. If shortcuts aren\'t working, you\'re probably stuck in Focus Mode.' },
      { title: 'How pages are structured', desc: 'Screen readers present pages like a Word document: Up/Down moves line by line, Left/Right moves character by character. Your HTML source order directly controls what users hear.' },
    ],
    tip: 'Most confusion for new NVDA testers comes from being in the wrong mode. Check the mode first whenever something seems broken.',
  },
  {
    id: 'shortcuts', label: '3 · Key shortcuts',
    shortcuts: [
      { section: 'Essential controls', rows: [
        { action: 'Stop speaking', cmd: 'Ctrl' },
        { action: 'Read current line', cmd: 'NVDA + ↑' },
        { action: 'Read from cursor', cmd: 'NVDA + ↓' },
        { action: 'Toggle focus / browse mode', cmd: 'NVDA + Space' },
        { action: 'Open NVDA menu', cmd: 'NVDA + N' },
        { action: 'Quit NVDA', cmd: 'NVDA + Q' },
        { action: 'Slow / speed up speech', cmd: 'NVDA + Ctrl + ↓/↑' },
      ]},
      { section: 'Navigation (browse mode)', rows: [
        { action: 'Next / previous heading', cmd: 'H / Shift+H' },
        { action: 'Heading level 1–6', cmd: '1–6 / Shift+1–6' },
        { action: 'Next / previous landmark', cmd: 'D / Shift+D' },
        { action: 'Next / previous link', cmd: 'K / Shift+K' },
        { action: 'Next / previous form field', cmd: 'F / Shift+F' },
        { action: 'Next / previous button', cmd: 'B / Shift+B' },
        { action: 'Next / previous table', cmd: 'T / Shift+T' },
        { action: 'Next / previous image', cmd: 'G / Shift+G' },
      ]},
      { section: 'Elements list & tables', rows: [
        { action: 'Open Elements List', cmd: 'NVDA + F7' },
        { action: 'Move across table columns', cmd: 'Ctrl + Alt + →' },
        { action: 'Move down table rows', cmd: 'Ctrl + Alt + ↓' },
      ]},
    ],
    tip: 'The Elements List (NVDA + F7) is one of the most powerful audit tools — it shows all headings, links, or form fields in a filterable list, exposing structural issues immediately.',
  },
  {
    id: 'checklist', label: '4 · Testing checklist',
    checklist: [
      { label: 'Page title announced correctly on load', sub: 'Tab title should uniquely describe the page content', group: 'Page structure' },
      { label: 'Skip to main content link is first focusable element', sub: 'Press Tab on page load — it must be the very first stop', group: 'Page structure' },
      { label: 'Headings form a logical outline', sub: 'Open Elements List → Headings. H1 once, no skipped levels', group: 'Page structure' },
      { label: 'Landmark regions present: nav, main, header, footer', sub: 'Press D to jump between them — all should be labelled', group: 'Page structure' },
      { label: 'All buttons announced with descriptive names', sub: 'Not just "button" — purpose must be clear from the name alone', group: 'Interactive elements' },
      { label: 'All links announced with meaningful text', sub: 'No "read more", "click here". Check via Elements List → Links', group: 'Interactive elements' },
      { label: 'Form fields have labels read on focus', sub: 'NVDA reads: label text, then field type (e.g. "Email, edit")', group: 'Interactive elements' },
      { label: 'Error messages announced without page reload', sub: 'Submit with errors — NVDA should announce the error automatically', group: 'Interactive elements' },
      { label: 'Informative images have descriptive alt text', sub: 'Press G to jump to images and listen to announcements', group: 'Media' },
      { label: 'Decorative images are ignored', sub: 'Empty alt="" and role="presentation" — NVDA should not announce them', group: 'Media' },
      { label: 'Modal dialogs trap focus and are announced', sub: 'Focus must not escape; Escape key must close the modal', group: 'Dynamic content' },
      { label: 'Status messages announced via aria-live', sub: 'Toasts, alerts, search results — NVDA reads them without focus moving', group: 'Dynamic content' },
    ],
  },
  {
    id: 'issues', label: '5 · Common failures',
    issues: [
      { sev: 'high', title: 'Ambiguous button and link names', desc: '"Click here", "Read more", "Submit" with no context. Automated tools often pass these — but NVDA users hear them out of context and have no idea where they go.' },
      { sev: 'high', title: 'Focus lost after modal closes', desc: 'When a modal is dismissed, focus should return to the element that triggered it. If it drops to the top of the page, the user loses their place entirely.' },
      { sev: 'high', title: 'ARIA misuse', desc: 'role="button" on a <div> without keyboard support, or aria-label overriding visible text. NVDA announces these as confusing or contradictory.' },
      { sev: 'high', title: 'Dynamic content not announced', desc: 'Spinners, toasts, search results updating without aria-live. NVDA reads nothing — the user has no idea something changed.' },
      { sev: 'medium', title: 'Tables with no headers', desc: 'Ctrl+Alt+Arrow navigation reads cells with no context when <th> headers are absent. Data becomes meaningless.' },
      { sev: 'medium', title: 'Custom components without ARIA patterns', desc: 'Date pickers, sliders, carousels, comboboxes built from scratch without ARIA. These are the most common source of real-world failures.' },
    ],
    tip: 'Pair NVDA with Firefox for primary testing, then re-test in Chrome. Different browser/NVDA combinations produce different announcements — covering both catches more issues.',
  },
];

function Kbd({ children }) {
  return <kbd className={styles.kbd}>{children}</kbd>;
}

export default function NVDAGuide() {
  const [phase, setPhase] = useState('install');
  const [checked, setChecked] = useState({});

  const current = PHASES.find(p => p.id === phase);
  const checklist = PHASES.find(p => p.id === 'checklist').checklist;
  const checkedCount = Object.values(checked).filter(Boolean).length;

  const toggleCheck = (i) => setChecked(prev => ({ ...prev, [i]: !prev[i] }));

  const groups = [...new Set(checklist.map(c => c.group))];

  return (
    <div className={styles.page}>
      <header className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>NVDA testing guide</h1>
        <p className={styles.pageSub}>
          A practical, step-by-step reference for testing websites with the world's most widely used screen reader.
        </p>
      </header>

      <div className={styles.layout}>
        {/* Phase nav */}
        <nav className={styles.phaseNav} aria-label="Guide sections">
          {PHASES.map(p => (
            <button
              key={p.id}
              className={`${styles.phaseBtn} ${phase === p.id ? styles.phaseBtnActive : ''}`}
              onClick={() => setPhase(p.id)}
              aria-current={phase === p.id ? 'step' : undefined}
            >
              {p.label}
              {p.id === 'checklist' && (
                <span className={styles.checkCount}>{checkedCount}/{checklist.length}</span>
              )}
            </button>
          ))}
        </nav>

        {/* Content */}
        <div className={styles.content}>

          {/* Install & Modes */}
          {(phase === 'install' || phase === 'modes') && (
            <div>
              <ol className={styles.stepList}>
                {current.steps.map((s, i) => (
                  <li key={i} className={`${styles.step} fade-up`} style={{ animationDelay: `${i * 0.06}s` }}>
                    <span className={styles.stepNum} aria-hidden="true">{i + 1}</span>
                    <div>
                      <h3 className={styles.stepTitle}>{s.title}</h3>
                      <p className={styles.stepDesc}>{s.desc}</p>
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
              {phase === 'modes' && (
                <div className={styles.modeGrid}>
                  <div className={styles.modeCard} style={{ borderLeftColor: '#b03020' }}>
                    <h3 className={styles.modeTitle}>Browse mode</h3>
                    <p className={styles.modeDesc}>Red highlight. Single-key navigation shortcuts active. Use for reading and scanning.</p>
                  </div>
                  <div className={styles.modeCard} style={{ borderLeftColor: '#1a4f8a' }}>
                    <h3 className={styles.modeTitle}>Focus mode</h3>
                    <p className={styles.modeDesc}>Blue highlight. Key shortcuts disabled. Use for forms, inputs, and interactive widgets.</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Shortcuts */}
          {phase === 'shortcuts' && (
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
                          <td className={styles.tdAction}>{r.action}</td>
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
          {phase === 'checklist' && (
            <div>
              <div className={styles.progress}>
                <div className={styles.progressBar}>
                  <div
                    className={styles.progressFill}
                    style={{ width: `${Math.round(checkedCount / checklist.length * 100)}%` }}
                    role="progressbar"
                    aria-valuenow={checkedCount}
                    aria-valuemin={0}
                    aria-valuemax={checklist.length}
                    aria-label={`${checkedCount} of ${checklist.length} checks passed`}
                  />
                </div>
                <span className={styles.progressLabel}>{checkedCount} / {checklist.length}</span>
              </div>
              {groups.map(group => (
                <div key={group} className={styles.checkGroup}>
                  <h3 className={styles.checkGroupTitle}>{group}</h3>
                  <ul className={styles.checkList}>
                    {checklist.map((item, i) => item.group === group && (
                      <li key={i} className={styles.checkItem}>
                        <button
                          className={`${styles.checkBox} ${checked[i] ? styles.checkBoxChecked : ''}`}
                          onClick={() => toggleCheck(i)}
                          aria-pressed={!!checked[i]}
                          aria-label={item.label}
                        >
                          {checked[i] && <span aria-hidden="true">✓</span>}
                        </button>
                        <div>
                          <p className={`${styles.checkLabel} ${checked[i] ? styles.checkLabelDone : ''}`}>{item.label}</p>
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
          {phase === 'issues' && (
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
              <div className={styles.tipBox} role="note">
                <span className={styles.tipIcon} aria-hidden="true">💡</span>
                <p>{current.tip}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
