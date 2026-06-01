import { useEffect, useState } from 'react';
import { adminApi } from 'api/client';
import dashboardStyles from '../../AdminDashboard.module.css';
import styles from './OverviewView.module.css';
import Table from 'components/common/Table/Table';

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

  const countryColumns = [
    { key: 'country', label: 'Country' },
    { key: 'count', label: 'Members' }
  ];

  const cityColumns = [
    { key: 'city', label: 'City' },
    { key: 'country', label: 'Country' },
    { key: 'count', label: 'Members' }
  ];

  const userColumns = [
    { key: 'displayName', label: 'Name' },
    { key: 'email', label: 'Email' },
    { key: 'city', label: 'City', render: (u) => u.city || '—' },
    { key: 'country', label: 'Country', render: (u) => u.country || '—' },
    { key: 'authMethod', label: 'Sign-in', render: (u) => u.authMethod === 'google' ? 'Google' : 'Email' },
    { key: 'createdAt', label: 'Joined', render: (u) => formatDate(u.createdAt) }
  ];

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
          <Table columns={countryColumns} data={stats.byCountry} emptyMessage="No data available." />
        </section>

        <section className={dashboardStyles.panel} aria-labelledby="city-heading">
          <h2 id="city-heading" className={dashboardStyles.panelTitle}>
            Members by city
          </h2>
          <Table 
            columns={cityColumns} 
            data={stats.byCity.map(r => ({ id: `${r.city}-${r.country}`, ...r }))} 
            emptyMessage="No data available." 
          />
        </section>
      </div>

      <section className={dashboardStyles.panel} aria-labelledby="users-heading">
        <h2 id="users-heading" className={dashboardStyles.panelTitle}>
          All members
        </h2>
        <Table columns={userColumns} data={users} emptyMessage="No members found." />
      </section>
    </>
  );
}
