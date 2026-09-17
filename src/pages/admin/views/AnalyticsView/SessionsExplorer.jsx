import { useState, useEffect, useCallback } from 'react';
import { adminApi } from 'api/client';
import styles from './SessionsExplorer.module.css';

const TIMEFRAMES = [
  { id: '7d', label: 'Last 7 Days' },
  { id: '30d', label: 'Last 30 Days' },
  { id: 'ytd', label: 'Year to Date' },
  { id: 'all', label: 'All Time' },
];

function formatDateTime(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit', hour12: true
  });
}

function formatDuration(seconds) {
  if (!seconds || seconds <= 0) return '< 1s';
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  if (m === 0) return `${s}s`;
  return `${m}m ${s}s`;
}

function DeviceBadge({ type }) {
  const icons = { Mobile: '📱', Tablet: '🖥️', Desktop: '💻' };
  return (
    <span className={`${styles.badge} ${styles[`badge${type}`]}`} aria-label={`Device: ${type}`}>
      {icons[type] || '💻'} {type}
    </span>
  );
}

function SourceBadge({ category }) {
  const key = category || 'Direct';
  return (
    <span className={`${styles.badge} ${styles[`badgeSource${key}`]}`}>
      {key}
    </span>
  );
}

function PageViewsList({ sessionId }) {
  const [pages, setPages] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminApi.analyticsSessionPages(sessionId)
      .then(res => setPages(res.pages))
      .catch(() => setPages([]))
      .finally(() => setLoading(false));
  }, [sessionId]);

  if (loading) return <p className={styles.pagesLoading}>Loading pages…</p>;
  if (!pages || pages.length === 0) return <p className={styles.pagesEmpty}>No page views recorded.</p>;

  return (
    <ol className={styles.pagesList} aria-label="Pages visited in this session">
      {pages.map((pv, i) => (
        <li key={pv.id} className={styles.pagesItem}>
          <span className={styles.pagesIndex}>{i + 1}</span>
          <span className={styles.pagesPath} title={pv.path}>{pv.path}</span>
          <span className={styles.pagesTime}>{formatDateTime(pv.created_at)}</span>
        </li>
      ))}
    </ol>
  );
}

export default function SessionsExplorer({ showToast }) {
  const [timeframe, setTimeframe] = useState('30d');
  const [sessions, setSessions] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);

  const loadSessions = useCallback(async (tf, pg) => {
    setLoading(true);
    try {
      const res = await adminApi.analyticsSessions(tf, pg);
      setSessions(res.sessions || []);
      setTotal(res.total || 0);
      setPage(res.page || 1);
      setTotalPages(res.totalPages || 1);
    } catch (err) {
      showToast?.(err.message || 'Failed to load sessions.', 'error');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    setPage(1);
    setExpandedId(null);
    loadSessions(timeframe, 1);
  }, [timeframe, loadSessions]);

  const handlePageChange = (newPage) => {
    setExpandedId(null);
    loadSessions(timeframe, newPage);
  };

  const toggleExpand = (id) => {
    setExpandedId(prev => prev === id ? null : id);
  };

  return (
    <div className={styles.container}>
      <div className={styles.toolbar} role="group" aria-label="Filter timeframe">
        {TIMEFRAMES.map(tf => (
          <button
            key={tf.id}
            type="button"
            className={`${styles.filterBtn} ${timeframe === tf.id ? styles.filterBtnActive : ''}`}
            aria-pressed={timeframe === tf.id}
            onClick={() => setTimeframe(tf.id)}
          >
            {tf.label}
          </button>
        ))}
        <span className={styles.totalBadge}>{total.toLocaleString('en-IN')} sessions total</span>
      </div>

      {loading ? (
        <div className={styles.loadingState} role="status" aria-live="polite">Loading sessions…</div>
      ) : sessions.length === 0 ? (
        <div className={styles.emptyState}>No sessions found for this timeframe.</div>
      ) : (
        <>
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <caption className={styles.srOnly}>Visitor sessions list — {total} total</caption>
              <thead>
                <tr>
                  <th scope="col">Time</th>
                  <th scope="col">Visitor</th>
                  <th scope="col">Location</th>
                  <th scope="col">Device</th>
                  <th scope="col">Browser / OS</th>
                  <th scope="col">Source</th>
                  <th scope="col">Pages</th>
                  <th scope="col">Duration</th>
                  <th scope="col">Bounce</th>
                  <th scope="col"><span className={styles.srOnly}>Actions</span></th>
                </tr>
              </thead>
              <tbody>
                {sessions.map(s => (
                  <>
                    <tr
                      key={s.id}
                      className={`${styles.row} ${expandedId === s.id ? styles.rowExpanded : ''}`}
                    >
                      <td className={styles.cellTime}>
                        <time dateTime={s.started_at}>{formatDateTime(s.started_at)}</time>
                      </td>
                      <td className={styles.cellVisitor}>
                        {s.user_id ? (
                          <div className={styles.userInfo}>
                            <span className={`${styles.userBadge} ${s.user_is_admin ? styles.adminBadge : ''}`}>
                              {s.user_is_admin ? '🛡️ Admin' : '👤 User'}
                            </span>
                            <strong className={styles.userName}>{s.user_name || 'Unknown'}</strong>
                            <span className={styles.userEmail}>{s.user_email}</span>
                          </div>
                        ) : (
                          <div className={styles.anonInfo}>
                            <span className={styles.anonBadge}>👁 Anonymous</span>
                            <span className={styles.visitorId} title={`Visitor fingerprint: ${s.visitor_id}`}>
                              {s.visitor_id ? s.visitor_id.substring(0, 10) + '…' : '—'}
                            </span>
                          </div>
                        )}
                      </td>
                      <td className={styles.cellLocation}>
                        {[s.city !== 'Unknown' ? s.city : null, s.country !== 'Unknown' ? s.country : null]
                          .filter(Boolean).join(', ') || '—'}
                      </td>
                      <td><DeviceBadge type={s.device_type || 'Desktop'} /></td>
                      <td className={styles.cellBrowser}>
                        {s.browser && s.browser !== 'Unknown' ? s.browser : '—'}
                        {s.os && s.os !== 'Unknown' && (
                          <span className={styles.osLabel}> / {s.os}</span>
                        )}
                      </td>
                      <td>
                        <SourceBadge category={s.referrer_category} />
                        {s.referrer_domain && s.referrer_domain !== 'Direct' && (
                          <div className={styles.referrerDomain} title={s.referrer_domain}>
                            {s.referrer_domain.length > 22
                              ? s.referrer_domain.substring(0, 22) + '…'
                              : s.referrer_domain}
                          </div>
                        )}
                      </td>
                      <td className={styles.cellNumber}>{s.page_count}</td>
                      <td className={styles.cellNumber}>{formatDuration(s.duration_seconds)}</td>
                      <td>
                        <span className={s.is_bounce ? styles.bounceBadge : styles.noBounce}>
                          {s.is_bounce ? 'Yes' : 'No'}
                        </span>
                      </td>
                      <td>
                        <button
                          type="button"
                          className={styles.expandBtn}
                          onClick={() => toggleExpand(s.id)}
                          aria-expanded={expandedId === s.id}
                          aria-label={expandedId === s.id ? 'Collapse pages' : 'View pages for this session'}
                        >
                          {expandedId === s.id ? '▲ Hide' : '▼ Pages'}
                        </button>
                      </td>
                    </tr>
                    {expandedId === s.id && (
                      <tr key={`${s.id}-pages`} className={styles.expandedRow}>
                        <td colSpan={10} className={styles.expandedCell}>
                          <div className={styles.pagesContainer}>
                            <h3 className={styles.pagesTitle}>Pages visited in this session</h3>
                            <PageViewsList sessionId={s.id} />
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                ))}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <nav className={styles.pagination} aria-label="Sessions pagination">
              <button type="button" className={styles.pageBtn} onClick={() => handlePageChange(page - 1)} disabled={page <= 1} aria-label="Previous page">← Prev</button>
              <span className={styles.pageInfo}>Page {page} of {totalPages}</span>
              <button type="button" className={styles.pageBtn} onClick={() => handlePageChange(page + 1)} disabled={page >= totalPages} aria-label="Next page">Next →</button>
            </nav>
          )}
        </>
      )}
    </div>
  );
}
