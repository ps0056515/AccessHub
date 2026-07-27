import { useEffect, useState } from "react";
import { adminApi } from "api/client";
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip,
  ResponsiveContainer, Legend
} from 'recharts';
import dashboardStyles from "../../AdminDashboard.module.css";
import styles from "./AnalyticsView.module.css";
import AccessibleChartWrapper from "components/common/AccessibleChartWrapper/AccessibleChartWrapper";

// High contrast, WCAG AA compliant color palette (responsive to theme)
const COLORS = ['var(--chart-1)', 'var(--chart-2)', 'var(--chart-3)', 'var(--chart-4)', 'var(--chart-5)'];

const SOURCE_COLORS = {
  Direct: 'var(--chart-1)',
  Social: 'var(--chart-2)',
  Search: 'var(--chart-3)',
  Referral: 'var(--chart-4)'
};

const DEVICE_COLORS = {
  Desktop: 'var(--chart-1)',
  Mobile: 'var(--chart-2)',
  Tablet: 'var(--chart-3)'
};

const TIMEFRAMES = [
  { id: '7d', label: 'Last 7 Days' },
  { id: '30d', label: 'Last 30 Days' },
  { id: 'ytd', label: 'Year to Date' },
  { id: 'all', label: 'All Time' }
];

/**
 * Format a number with comma separators: 12345 -> "12,345"
 */
function formatNumber(n) {
  if (n == null) return '0';
  return Number(n).toLocaleString('en-US');
}

/**
 * Format seconds into "Xm Ys": 185 -> "3m 5s"
 */
function formatDuration(seconds) {
  if (seconds == null || seconds <= 0) return '0m 0s';
  const m = Math.floor(seconds / 60);
  const s = Math.round(seconds % 60);
  return `${m}m ${s}s`;
}

/**
 * Format an ISO date string to "Jun 3" style.
 */
function formatDate(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export default function AnalyticsView({ showToast }) {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [timeframe, setTimeframe] = useState('30d');

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError("");
      try {
        const response = await adminApi.analytics(timeframe);
        if (!cancelled) {
          setData(response);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err.message || "Could not load analytics data.");
          showToast?.(err.message || "Could not load analytics data.", "error");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [timeframe, showToast]);

  /* ---------- Loading / Error / Empty guards ---------- */
  if (loading && !data) {
    return <p className={dashboardStyles.loading}>Loading web analytics…</p>;
  }

  if (error && !data) {
    return (
      <div className={styles.errorContainer}>
        <p>Failed to load analytics dashboard.</p>
        <button
          type="button"
          onClick={() => window.location.reload()}
          className={styles.retryBtn}
        >
          Retry
        </button>
      </div>
    );
  }

  if (!data) return null;

  /* ---------- Derived data ---------- */
  const kpis = data.kpis || {};
  const trafficOverTime = (data.trafficOverTime || []).map(d => ({
    ...d,
    displayDate: formatDate(d.date)
  }));
  const topPages = (data.topPages || []).slice(0, 10);
  const trafficSources = (data.trafficSources || []).filter(d => d.value > 0);
  const topReferrers = (data.topReferrers || []).slice(0, 10);
  const regionNames = new Intl.DisplayNames(['en'], { type: 'region' });
  const topCountries = (data.topCountries || []).slice(0, 10).map(c => {
    let fullName = c.country;
    try {
      if (c.country && c.country !== 'Unknown') {
        fullName = regionNames.of(c.country);
      }
    } catch (e) {
      // Ignore invalid codes
    }
    return { ...c, country: fullName };
  });
  const devices = (data.devices || []).filter(d => d.value > 0);
  const browsers = (data.browsers || []).filter(d => d.value > 0);

  return (
    <>
      {/* ==================== HEADER ==================== */}
      <header className={dashboardStyles.header}>
        <div>
          <p className={dashboardStyles.kicker}>Analytics Suite</p>
          <h1 className={dashboardStyles.title}>Web Analytics Dashboard</h1>
          <p className={dashboardStyles.lead}>
            Real-time traffic insights &amp; audience analytics
          </p>
        </div>
      </header>

      {/* ==================== TIME FILTERS ==================== */}
      <section className={styles.filterControls} aria-label="Filter timeframe">
        {TIMEFRAMES.map((tf) => (
          <button
            key={tf.id}
            className={styles.filterBtn}
            aria-pressed={timeframe === tf.id}
            onClick={() => setTimeframe(tf.id)}
          >
            {tf.label}
          </button>
        ))}
      </section>

      {/* ==================== KPI CARDS ==================== */}
      <section className={styles.kpiGrid} aria-label="Key Performance Indicators">
        <article className={styles.kpiCard}>
          <span className={styles.kpiIcon} role="img" aria-label="Visitors icon">👥</span>
          <h2 className={styles.kpiTitle}>Unique Visitors</h2>
          <p className={styles.kpiValue}>{formatNumber(kpis.uniqueVisitors)}</p>
        </article>
        <article className={styles.kpiCard}>
          <span className={styles.kpiIcon} role="img" aria-label="Sessions icon">🔄</span>
          <h2 className={styles.kpiTitle}>Total Sessions</h2>
          <p className={styles.kpiValue}>{formatNumber(kpis.totalSessions)}</p>
        </article>
        <article className={styles.kpiCard}>
          <span className={styles.kpiIcon} role="img" aria-label="Pageviews icon">📄</span>
          <h2 className={styles.kpiTitle}>Total Pageviews</h2>
          <p className={styles.kpiValue}>{formatNumber(kpis.totalPageviews)}</p>
        </article>
        <article className={styles.kpiCard}>
          <span className={styles.kpiIcon} role="img" aria-label="Bounce rate icon">📉</span>
          <h2 className={styles.kpiTitle}>Bounce Rate</h2>
          <p className={styles.kpiValue}>{kpis.bounceRate != null ? `${kpis.bounceRate}%` : '—'}</p>
        </article>
        <article className={styles.kpiCard}>
          <span className={styles.kpiIcon} role="img" aria-label="Session duration icon">⏱️</span>
          <h2 className={styles.kpiTitle}>Avg Session Duration</h2>
          <p className={styles.kpiValue}>{formatDuration(kpis.avgSessionDuration)}</p>
        </article>
      </section>

      {/* ==================== TRAFFIC OVER TIME (Area Chart) ==================== */}
      <section className={styles.sectionPanel} aria-label="Traffic overview chart">
        <h2 className={styles.sectionTitle}>Traffic Overview</h2>
        <div className={styles.chartContainer}>
          <AccessibleChartWrapper
            title="Traffic Overview"
            data={trafficOverTime}
            columns={[
              { key: 'displayDate', label: 'Date' },
              { key: 'sessions', label: 'Sessions' },
              { key: 'pageviews', label: 'Pageviews' }
            ]}
          >
            {trafficOverTime.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trafficOverTime} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="gradVisitors" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#005A9C" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#005A9C" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="gradPageviews" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#007A33" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#007A33" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="displayDate" stroke="#475569" fontSize={13} />
                  <YAxis stroke="#475569" fontSize={13} allowDecimals={false} />
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#cbd5e1" />
                  <RechartsTooltip contentStyle={{ borderRadius: '8px', border: '1px solid #cbd5e1' }} />
                  <Legend verticalAlign="top" height={36} />
                  <Area type="monotone" name="Sessions" dataKey="sessions" stroke="#005A9C" fillOpacity={1} fill="url(#gradVisitors)" />
                  <Area type="monotone" name="Pageviews" dataKey="pageviews" stroke="#007A33" fillOpacity={1} fill="url(#gradPageviews)" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <p className={styles.emptyState}>No tracking data yet</p>
            )}
          </AccessibleChartWrapper>
        </div>
      </section>

      {/* ==================== ROW: Top Pages + Traffic Sources ==================== */}
      <div className={styles.chartRow}>
        {/* Top Pages Table */}
        <section className={styles.sectionPanel} aria-label="Top pages table">
          <h2 className={styles.sectionTitle}>Top Pages</h2>
          {topPages.length > 0 ? (
            <table className={styles.dataTable}>
              <caption>Top 10 most visited pages</caption>
              <thead>
                <tr>
                  <th scope="col">Page Path</th>
                  <th scope="col">Views</th>
                  <th scope="col">SESSIONS</th>
                </tr>
              </thead>
              <tbody>
                {topPages.map((page, i) => (
                  <tr key={page.path || i} className={styles.tableRow}>
                    <td className={styles.tablePath} title={page.path}>{page.path}</td>
                    <td>{formatNumber(page.views)}</td>
                    <td>{formatNumber(page.uniqueSessions)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className={styles.emptyState}>No tracking data yet</p>
          )}
        </section>

        {/* Traffic Sources Donut */}
        <section className={styles.sectionPanel} aria-label="Traffic sources chart">
          <h2 className={styles.sectionTitle}>Traffic Sources</h2>
          <div className={styles.chartContainer}>
            <AccessibleChartWrapper
              title="Traffic Sources Breakdown"
              data={data.trafficSources || []}
              columns={[
                { key: 'name', label: 'Source' },
                { key: 'value', label: 'Sessions' }
              ]}
            >
              {trafficSources.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={trafficSources}
                      cx="50%"
                      cy="50%"
                      innerRadius={70}
                      outerRadius={110}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {trafficSources.map((entry, index) => (
                        <Cell
                          key={`source-${index}`}
                          fill={SOURCE_COLORS[entry.name] || COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <RechartsTooltip contentStyle={{ borderRadius: '8px', border: '1px solid #cbd5e1' }} />
                    <Legend verticalAlign="bottom" height={36} iconType="circle" />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <p className={styles.emptyState}>No tracking data yet</p>
              )}
            </AccessibleChartWrapper>
          </div>
        </section>
      </div>

      {/* ==================== ROW: Top Countries + Top Referrers ==================== */}
      <div className={styles.chartRow}>
        {/* Top Countries Horizontal Bar Chart */}
        <section className={styles.sectionPanel} aria-label="Top countries chart">
          <h2 className={styles.sectionTitle}>Top Countries</h2>
          <div className={styles.chartContainer}>
            <AccessibleChartWrapper
              title="Top Countries by Sessions"
              data={topCountries}
              columns={[
                { key: 'country', label: 'Country' },
                { key: 'sessions', label: 'Sessions' }
              ]}
            >
              {topCountries.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={topCountries} layout="vertical" margin={{ top: 10, right: 30, left: 60, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#cbd5e1" />
                    <XAxis type="number" stroke="#475569" fontSize={13} allowDecimals={false} />
                    <YAxis type="category" dataKey="country" stroke="#475569" fontSize={13} width={50} />
                    <RechartsTooltip contentStyle={{ borderRadius: '8px', border: '1px solid #cbd5e1' }} />
                    <Bar dataKey="sessions" name="Sessions" fill="#005A9C" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <p className={styles.emptyState}>No tracking data yet</p>
              )}
            </AccessibleChartWrapper>
          </div>
        </section>

        {/* Top Referrers Table */}
        <section className={styles.sectionPanel} aria-label="Top referrers table">
          <h2 className={styles.sectionTitle}>Top Referrers</h2>
          {topReferrers.length > 0 ? (
            <table className={styles.dataTable}>
              <caption>Top 10 referring domains</caption>
              <thead>
                <tr>
                  <th scope="col">Domain</th>
                  <th scope="col">SESSIONS</th>
                </tr>
              </thead>
              <tbody>
                {topReferrers.map((ref, i) => (
                  <tr key={ref.domain || i} className={styles.tableRow}>
                    <td className={styles.tablePath} title={ref.domain}>{ref.domain}</td>
                    <td>{formatNumber(ref.sessions)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className={styles.emptyState}>No tracking data yet</p>
          )}
        </section>
      </div>

      {/* ==================== ROW: Devices + Browsers ==================== */}
      <div className={styles.chartRow}>
        {/* Device Breakdown Donut */}
        <section className={styles.sectionPanel} aria-label="Device breakdown chart">
          <h2 className={styles.sectionTitle}>Device Breakdown</h2>
          <div className={styles.chartContainer}>
            <AccessibleChartWrapper
              title="Device Breakdown"
              data={data.devices || []}
              columns={[
                { key: 'name', label: 'Device' },
                { key: 'value', label: 'Visitors' }
              ]}
            >
              {devices.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={devices}
                      cx="50%"
                      cy="50%"
                      innerRadius={70}
                      outerRadius={110}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {devices.map((entry, index) => (
                        <Cell
                          key={`device-${index}`}
                          fill={DEVICE_COLORS[entry.name] || COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <RechartsTooltip contentStyle={{ borderRadius: '8px', border: '1px solid #cbd5e1' }} />
                    <Legend verticalAlign="bottom" height={36} iconType="circle" />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <p className={styles.emptyState}>No tracking data yet</p>
              )}
            </AccessibleChartWrapper>
          </div>
        </section>

        {/* Browser Breakdown Donut */}
        <section className={styles.sectionPanel} aria-label="Browser breakdown chart">
          <h2 className={styles.sectionTitle}>Browser Breakdown</h2>
          <div className={styles.chartContainer}>
            <AccessibleChartWrapper
              title="Browser Breakdown"
              data={data.browsers || []}
              columns={[
                { key: 'name', label: 'Browser' },
                { key: 'value', label: 'Visitors' }
              ]}
            >
              {browsers.length > 0 ? (
                <ul className={styles.progressList}>
                  {browsers.map((browser, index) => {
                    const totalVisitors = browsers.reduce((sum, b) => sum + b.value, 0);
                    const percentage = Math.round((browser.value / totalVisitors) * 100);
                    const barColor = COLORS[index % COLORS.length];
                    return (
                      <li key={`browser-${index}`} className={styles.progressItem}>
                        <div className={styles.progressHeader}>
                          <span>{browser.name}</span>
                          <span className={styles.progressCount}>{formatNumber(browser.value)} ({percentage}%)</span>
                        </div>
                        <div className={styles.progressTrack}>
                          <div 
                            className={styles.progressFill} 
                            style={{ width: `${percentage}%`, backgroundColor: barColor }} 
                            aria-valuenow={percentage}
                            aria-valuemin="0"
                            aria-valuemax="100"
                            role="progressbar"
                          />
                        </div>
                      </li>
                    );
                  })}
                </ul>
              ) : (
                <p className={styles.emptyState}>No tracking data yet</p>
              )}
            </AccessibleChartWrapper>
          </div>
        </section>
      </div>
    </>
  );
}
