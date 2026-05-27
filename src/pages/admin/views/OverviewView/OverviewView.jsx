import { useEffect, useState } from 'react';
import { adminApi } from 'api/client';
import dashboardStyles from '../../AdminDashboard.module.css';
import styles from './OverviewView.module.css';

function StatCard({ label, value, hint }) {
  return (
    <article className={dashboardStyles.statCard}>
      <p className={dashboardStyles.statLabel}>{label}</p>
      <p className={dashboardStyles.statValue}>{value}</p>
      {hint && <p className={dashboardStyles.statHint}>{hint}</p>}
    </article>
  );
}

function formatDate(iso) {
  if (!iso) return '—';
  const normalized = iso.includes('T') ? iso : `${iso.replace(' ', 'T')}Z`;
  const d = new Date(normalized);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export default function OverviewView({ showToast }) {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError('');
      try {
        const [statsData, usersData] = await Promise.all([adminApi.stats(), adminApi.users()]);
        if (!cancelled) {
          setStats(statsData);
          setUsers(usersData.users || []);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err.message || 'Could not load admin data.');
          showToast?.(err.message || 'Could not load admin data.', 'error');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [showToast]);

  if (loading) return <p className={dashboardStyles.loading}>Loading dashboard overview…</p>;
  if (error) {
    return (
      <div className={styles.errorContainer}>
        <p>Failed to load dashboard overview stats.</p>
        <button
          type="button"
          onClick={() => window.location.reload()}
          className={`${dashboardStyles.backBtn} ${styles.retryBtn}`}
        >
          Retry
        </button>
      </div>
    );
  }
  if (!stats) return null;

  return (
    <>
      <header className={dashboardStyles.header}>
        <div>
          <p className={dashboardStyles.kicker}>Overview</p>
          <h1 className={dashboardStyles.title}>CMS Dashboard</h1>
          <p className={dashboardStyles.lead}>General system stats and member registration overview.</p>
        </div>
      </header>

      <section className={dashboardStyles.statsGrid} aria-label="Summary statistics">
        <StatCard label="Total members" value={stats.totalUsers} />
        <StatCard label="New this week" value={stats.recentSignups} />
        <StatCard label="Google sign-ins" value={stats.googleUsers} />
        <StatCard label="Email sign-ups" value={stats.emailUsers} />
        <StatCard label="With location" value={stats.withLocation} hint={`${stats.countriesCount} countries`} />
      </section>

      <div className={dashboardStyles.panels}>
        <section className={dashboardStyles.panel} aria-labelledby="country-heading">
          <h2 id="country-heading" className={dashboardStyles.panelTitle}>
            Members by country
          </h2>
          <table className={dashboardStyles.table}>
            <thead>
              <tr>
                <th scope="col">Country</th>
                <th scope="col">Members</th>
              </tr>
            </thead>
            <tbody>
              {stats.byCountry.map(row => (
                <tr key={row.country}>
                  <td>{row.country}</td>
                  <td>{row.count}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        <section className={dashboardStyles.panel} aria-labelledby="city-heading">
          <h2 id="city-heading" className={dashboardStyles.panelTitle}>
            Members by city
          </h2>
          <table className={dashboardStyles.table}>
            <thead>
              <tr>
                <th scope="col">City</th>
                <th scope="col">Country</th>
                <th scope="col">Members</th>
              </tr>
            </thead>
            <tbody>
              {stats.byCity.map(row => (
                <tr key={`${row.city}-${row.country}`}>
                  <td>{row.city}</td>
                  <td>{row.country}</td>
                  <td>{row.count}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      </div>

      <section className={dashboardStyles.panel} aria-labelledby="users-heading">
        <h2 id="users-heading" className={dashboardStyles.panelTitle}>
          All members
        </h2>
        <div className={dashboardStyles.tableWrap}>
          <table className={dashboardStyles.table}>
            <thead>
              <tr>
                <th scope="col">Name</th>
                <th scope="col">Email</th>
                <th scope="col">City</th>
                <th scope="col">Country</th>
                <th scope="col">Sign-in</th>
                <th scope="col">Joined</th>
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u.id}>
                  <td>{u.displayName}</td>
                  <td>{u.email}</td>
                  <td>{u.city || '—'}</td>
                  <td>{u.country || '—'}</td>
                  <td>{u.authMethod === 'google' ? 'Google' : 'Email'}</td>
                  <td>{formatDate(u.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}
