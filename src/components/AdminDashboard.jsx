import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminApi } from '../api/client';
import styles from './AdminDashboard.module.css';

function StatCard({ label, value, hint }) {
  return (
    <article className={styles.statCard}>
      <p className={styles.statLabel}>{label}</p>
      <p className={styles.statValue}>{value}</p>
      {hint && <p className={styles.statHint}>{hint}</p>}
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

export default function AdminDashboard({ goToPortal }) {
  const navigate = useNavigate();
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
        if (!cancelled) setError(err.message || 'Could not load admin data.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div>
          <p className={styles.kicker}>Admin</p>
          <h1 className={styles.title}>Community dashboard</h1>
          <p className={styles.lead}>Overview of members, locations, and sign-up activity.</p>
        </div>
        <button type="button" className={styles.backBtn} onClick={() => goToPortal?.() || navigate('/')}>
          ← Back to site
        </button>
      </header>

      {error && (
        <div className={styles.error} role="alert">
          {error}
        </div>
      )}

      {loading && <p className={styles.loading}>Loading dashboard…</p>}

      {!loading && stats && (
        <>
          <section className={styles.statsGrid} aria-label="Summary statistics">
            <StatCard label="Total members" value={stats.totalUsers} />
            <StatCard label="New this week" value={stats.recentSignups} />
            <StatCard label="Google sign-ins" value={stats.googleUsers} />
            <StatCard label="Email sign-ups" value={stats.emailUsers} />
            <StatCard label="With location" value={stats.withLocation} hint={`${stats.countriesCount} countries`} />
          </section>

          <div className={styles.panels}>
            <section className={styles.panel} aria-labelledby="country-heading">
              <h2 id="country-heading" className={styles.panelTitle}>
                Members by country
              </h2>
              <table className={styles.table}>
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

            <section className={styles.panel} aria-labelledby="city-heading">
              <h2 id="city-heading" className={styles.panelTitle}>
                Members by city
              </h2>
              <table className={styles.table}>
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

          <section className={styles.panel} aria-labelledby="users-heading">
            <h2 id="users-heading" className={styles.panelTitle}>
              All members
            </h2>
            <div className={styles.tableWrap}>
              <table className={styles.table}>
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
      )}
    </div>
  );
}
