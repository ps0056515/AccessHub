import { useEffect, useState } from "react";
import { adminApi } from "api/client";
import { useAuth } from "context/AuthContext";
import { Download } from "lucide-react";
import dashboardStyles from "../../AdminDashboard.module.css";
import styles from "./OverviewView.module.css";
import Table from "pages/admin/components/Table/Table";
import Tooltip from "pages/admin/components/Tooltip/Tooltip";
import { useConfirm } from "context/ConfirmContext";
import { exportToExcel } from "utils/commonUtils";

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
  const confirm = useConfirm();
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [memberSearch, setMemberSearch] = useState("");
  const [countrySearch, setCountrySearch] = useState("");
  const [citySearch, setCitySearch] = useState("");


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
      !(await confirm(
        `Are you sure you want to completely delete ${userToDelete.displayName} (${userToDelete.email})? This action cannot be undone.`,
      ))
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
    { key: "country", label: "Country", width: "50%" },
    { key: "count", label: "Members", width: "50%" },
  ];

  const cityColumns = [
    { key: "city", label: "City", width: "40%" },
    { key: "country", label: "Country", width: "40%" },
    { key: "count", label: "Members", width: "20%" },
  ];

  const userColumns = [
    {
      key: "displayName",
      label: "Name",
      width: "150px",
      sortable: true,
    },
    { key: "email", label: "Email",width:"300px" },
    { key: "city", label: "City", render: (u) => u.city || "—" },
    {
      key: "country",
      label: "Country",
      render: (u) => u.country || "—",
    },
    {
      key: "authMethod",
      label: "Sign-in",
      render: (u) => (u.authMethod === "google" ? "Google" : "Email"),
    },
    {
      key: "createdAt",
      label: "Joined",
      render: (u) => formatDate(u.createdAt),
    },
    {
      key: "role",
      label: "Role",
      render: (u) => (u.isAdmin ? "Admin" : "Member"),
    },
    { key: 'updated_at', label: 'Last Updated', render: (u) => u.updated_at ? new Date(u.updated_at).toLocaleString('en-US', { month: 'numeric', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' }).replace(',', '') : '—' },
    {
      key: "actions",
      label: "Actions",
      filterOptions: [
        { label: "Blocked", value: "blocked" },
        { label: "Active", value: "active" },
      ],
      filterMatch: (row, val) => {
        if (val === "blocked") return row.isBlocked;
        if (val === "active") return !row.isBlocked;
        return true;
      },
      render: (u) => (
        <div style={{ display: "flex", gap: "8px" }}>
          <button
            className={`${styles.actionBtn} ${u.isAdmin ? styles.actionBtnDanger : ""}`}
            onClick={() => toggleRole(u)}
            disabled={u.id === currentUser?.id}
            aria-label={`${u.isAdmin ? "Revoke Admin" : "Make Admin"} for ${u.displayName}`}
          >
            {u.isAdmin ? "Revoke Admin" : "Make Admin"}
          </button>
          <button
            className={`${styles.actionBtn} ${u.isBlocked ? "" : styles.actionBtnDanger}`}
            onClick={() => toggleBlock(u)}
            disabled={u.id === currentUser?.id}
            aria-label={`${u.isBlocked ? "Unblock" : "Block"} ${u.displayName}`}
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
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h2 id="country-heading" className={dashboardStyles.panelTitle} style={{ margin: 0 }}>
              Members by country
            </h2>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
              <Tooltip content="Export to Excel" position="top">
                <button 
                  onClick={() => exportToExcel(stats.byCountry, "members_by_country")} 
                  className={styles.actionBtn}
                  style={{ padding: '8px', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                  aria-label="Export to Excel"
                >
                  <Download aria-hidden="true" size={16} />
                </button>
              </Tooltip>
              <input 
                type="search" 
                aria-label="Search members by country"
                placeholder="Search..." 
                value={countrySearch}
                onChange={(e) => setCountrySearch(e.target.value)}
                style={{ 
                  padding: '6px 10px', 
                  borderRadius: 'var(--radius-sm, 6px)', 
                  border: '1px solid var(--border-strong, #cbd5e1)', 
                  width: '150px',
                  outline: 'none',
                  fontSize: '13px'
                }}
              />
            </div>
          </div>
          <Table
            columns={countryColumns}
            data={stats.byCountry}
            emptyMessage="No data available."
            searchQuery={countrySearch}
            pagination={true}
          />
        </section>

        <section
          className={dashboardStyles.panel}
          aria-labelledby="city-heading"
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h2 id="city-heading" className={dashboardStyles.panelTitle} style={{ margin: 0 }}>
              Members by city
            </h2>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
              <Tooltip content="Export to Excel" position="top">
                <button 
                  onClick={() => {
                    const data = stats.byCity.map(r => ({ City: r.city, Country: r.country, Members: r.count }));
                    exportToExcel(data, "members_by_city");
                  }} 
                  className={styles.actionBtn}
                  style={{ padding: '8px', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                  aria-label="Export to Excel"
                >
                  <Download aria-hidden="true" size={16} />
                </button>
              </Tooltip>
              <input 
                type="search" 
                aria-label="Search members by city"
                placeholder="Search..." 
                value={citySearch}
                onChange={(e) => setCitySearch(e.target.value)}
                style={{ 
                  padding: '6px 10px', 
                  borderRadius: 'var(--radius-sm, 6px)', 
                  border: '1px solid var(--border-strong, #cbd5e1)', 
                  width: '150px',
                  outline: 'none',
                  fontSize: '13px'
                }}
              />
            </div>
          </div>
          <Table
            columns={cityColumns}
            data={stats.byCity.map((r) => ({
              id: `${r.city}-${r.country}`,
              ...r,
            }))}
            emptyMessage="No data available."
            searchQuery={citySearch}
            pagination={true}
          />
        </section>
      </div>

      <section
        className={dashboardStyles.panel}
        aria-labelledby="users-heading"
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h2 id="users-heading" className={dashboardStyles.panelTitle} style={{ margin: 0 }}>
            All members
          </h2>
          <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
            <Tooltip content="Export to Excel" position="top">
              <button 
                onClick={() => {
                  const data = users.map(u => ({
                    Name: u.displayName,
                    Email: u.email,
                    City: u.city || "",
                    Country: u.country || "",
                    AuthMethod: u.authMethod === "google" ? "Google" : "Email",
                    Joined: formatDate(u.createdAt),
                    Role: u.isAdmin ? "Admin" : "Member",
                    Status: u.isBlocked ? "Blocked" : "Active"
                  }));
                  exportToExcel(data, "all_members");
                }} 
                className={styles.actionBtn}
                style={{ padding: '8px', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                aria-label="Export to Excel"
              >
                <Download aria-hidden="true" size={16} />
              </button>
            </Tooltip>
            <input 
              type="search" 
              aria-label="Search all members"
              placeholder="Search members..." 
              value={memberSearch}
              onChange={(e) => setMemberSearch(e.target.value)}
              style={{ 
                padding: '8px 12px', 
                borderRadius: 'var(--radius-sm, 6px)', 
                border: '1px solid var(--border-strong, #cbd5e1)', 
                minWidth: '250px',
                outline: 'none'
              }}
            />
          </div>
        </div>
        <Table
          columns={userColumns}
          data={users}
          emptyMessage="No members found."
          getRowStyle={(u) => (u.isBlocked ? { opacity: 0.5 } : {})}
          minWidth="900px"
          searchQuery={memberSearch}
          pagination
        />
      </section>
    </>
  );
}

