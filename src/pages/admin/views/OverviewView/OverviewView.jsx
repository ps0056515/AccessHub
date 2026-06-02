import { useEffect, useState } from "react";
import { adminApi } from "api/client";
import { useAuth } from "context/AuthContext";
import dashboardStyles from "../../AdminDashboard.module.css";
import styles from "./OverviewView.module.css";
import Table from "components/common/Table/Table";

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
  if (!iso) return "—";
  const normalized = iso.includes("T") ? iso : `${iso.replace(" ", "T")}Z`;
  const d = new Date(normalized);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export default function OverviewView({ showToast }) {
  const { user: currentUser } = useAuth();
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const toggleRole = async (userToUpdate) => {
    try {
      const { user: updatedUser } = await adminApi.toggleAdminRole(
        userToUpdate.id,
        !userToUpdate.isAdmin,
      );
      setUsers((prev) =>
        prev.map((u) => (u.id === updatedUser.id ? updatedUser : u)),
      );
      showToast?.(`Updated role for ${updatedUser.displayName}`, "success");
    } catch (err) {
      showToast?.(err.message, "error");
    }
  };

  const toggleBlock = async (userToUpdate) => {
    try {
      const { user: updatedUser } = await adminApi.toggleBlockUser(
        userToUpdate.id,
        !userToUpdate.isBlocked,
      );
      setUsers((prev) =>
        prev.map((u) => (u.id === updatedUser.id ? updatedUser : u)),
      );
      showToast?.(
        `User ${updatedUser.displayName} has been ${updatedUser.isBlocked ? "blocked" : "unblocked"}.`,
        "success",
      );
    } catch (err) {
      showToast?.(err.message, "error");
    }
  };

  const deleteUser = async (userToDelete) => {
    if (
      !window.confirm(
        `Are you sure you want to completely delete ${userToDelete.displayName} (${userToDelete.email})? This action cannot be undone.`,
      )
    ) {
      return;
    }
    try {
      await adminApi.deleteUser(userToDelete.id);
      setUsers((prev) => prev.filter((u) => u.id !== userToDelete.id));
      if (stats) {
        setStats((prev) => ({
          ...prev,
          totalUsers: Math.max(0, prev.totalUsers - 1),
        }));
      }
      showToast?.(`${userToDelete.displayName} has been deleted.`, "success");
    } catch (err) {
      showToast?.(err.message, "error");
    }
  };

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError("");
      try {
        const [statsData, usersData] = await Promise.all([
          adminApi.stats(),
          adminApi.users(),
        ]);
        if (!cancelled) {
          setStats(statsData);
          setUsers(usersData.users || []);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err.message || "Could not load admin data.");
          showToast?.(err.message || "Could not load admin data.", "error");
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

  if (loading)
    return (
      <p className={dashboardStyles.loading}>Loading dashboard overview…</p>
    );
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
    { key: "country", label: "Country", width:"50%" },
    { key: "count", label: "Members", width:"50%" },
  ];

  const cityColumns = [
    { key: "city", label: "City",width:"40%" },
    { key: "country", label: "Country", width:"40%" },
    { key: "count", label: "Members", width:"20%" },
  ];

  const userColumns = [
    { key: 'displayName', label: 'Name', width: '15%' },
    { key: 'email', label: 'Email', width: '25%' },
    { key: 'city', label: 'City', render: (u) => u.city || '—', width: '10%' },
    { key: 'country', label: 'Country', render: (u) => u.country || '—', width: '10%' },
    { key: 'authMethod', label: 'Sign-in', render: (u) => u.authMethod === 'google' ? 'Google' : 'Email', width: '8%' },
    { key: 'createdAt', label: 'Joined', render: (u) => formatDate(u.createdAt), width: '12%' },
    { key: 'role', label: 'Role', render: (u) => u.isAdmin ? 'Admin' : 'Member', width: '10%' },
    { 
      key: 'actions', 
      label: 'Actions', 
      width: '25%',
      render: (u) => (
        <div style={{ display: "flex", gap: "8px" }}>
          <button
            className={`${styles.actionBtn} ${u.isAdmin ? styles.actionBtnDanger : ""}`}
            onClick={() => toggleRole(u)}
            disabled={u.id === currentUser?.id}
          >
            {u.isAdmin ? "Revoke Admin" : "Make Admin"}
          </button>
          <button
            className={`${styles.actionBtn} ${u.isBlocked ? "" : styles.actionBtnDanger}`}
            onClick={() => toggleBlock(u)}
            disabled={u.id === currentUser?.id}
          >
            {u.isBlocked ? "Unblock" : "Block"}
          </button>
          <button
            className={`${styles.actionBtn} ${styles.actionBtnDanger}`}
            onClick={() => deleteUser(u)}
            disabled={u.id === currentUser?.id}
            title="Delete user"
          >
            Delete
          </button>
        </div>
      ),
    },
  ];

  return (
    <>
      <header className={dashboardStyles.header}>
        <div>
          <p className={dashboardStyles.kicker}>Overview</p>
          <h1 className={dashboardStyles.title}>CMS Dashboard</h1>
          <p className={dashboardStyles.lead}>
            General system stats and member registration overview.
          </p>
        </div>
      </header>

      <section
        className={dashboardStyles.statsGrid}
        aria-label="Summary statistics"
      >
        <StatCard label="Total members" value={stats.totalUsers} />
        <StatCard label="New this week" value={stats.recentSignups} />
        <StatCard label="Google sign-ins" value={stats.googleUsers} />
        <StatCard label="Email sign-ups" value={stats.emailUsers} />
        <StatCard
          label="With location"
          value={stats.withLocation}
          hint={`${stats.countriesCount} countries`}
        />
      </section>

      <div className={dashboardStyles.panels}>
        <section
          className={dashboardStyles.panel}
          aria-labelledby="country-heading"
        >
          <h2 id="country-heading" className={dashboardStyles.panelTitle}>
            Members by country
          </h2>
          <Table
            columns={countryColumns}
            data={stats.byCountry}
            emptyMessage="No data available."
          />
        </section>

        <section
          className={dashboardStyles.panel}
          aria-labelledby="city-heading"
        >
          <h2 id="city-heading" className={dashboardStyles.panelTitle}>
            Members by city
          </h2>
          <Table
            columns={cityColumns}
            data={stats.byCity.map((r) => ({
              id: `${r.city}-${r.country}`,
              ...r,
            }))}
            emptyMessage="No data available."
          />
        </section>
      </div>

      <section
        className={dashboardStyles.panel}
        aria-labelledby="users-heading"
      >
        <h2 id="users-heading" className={dashboardStyles.panelTitle}>
          All members
        </h2>
        <Table
          columns={userColumns}
          data={users}
          emptyMessage="No members found."
          getRowStyle={(u) => (u.isBlocked ? { opacity: 0.5 } : {})}
          minWidth="900px"
        />
      </section>
    </>
  );
}
