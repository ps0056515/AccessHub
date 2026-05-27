import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from 'context/AuthContext';
import { SITE_NAME } from 'brand';
import styles from './AdminDashboard.module.css';

// Sub-page Views
import OverviewView from './views/OverviewView/OverviewView';
import ResourcesView from './views/ResourcesView/ResourcesView';
import ToolsView from './views/ToolsView/ToolsView';
import EventsView from './views/EventsView/EventsView';
import DiscussionsView from './views/DiscussionsView/DiscussionsView';
import SettingsView from './views/SettingsView/SettingsView';

export default function AdminDashboard({ goToPortal }) {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    document.title = `Admin · ${SITE_NAME}`;
  }, []);

  const addToast = (message, type = 'success') => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: '📊' },
    { id: 'resources', label: 'Resources', icon: '📚' },
    { id: 'tools', label: 'Tools', icon: '🛠️' },
    { id: 'events', label: 'Events', icon: '📅' },
    { id: 'discussions', label: 'Discussions', icon: '💬' },
    { id: 'settings', label: 'Settings', icon: '⚙️' },
  ];

  const handleSignOut = async () => {
    await signOut();
    navigate('/sign-in', { replace: true });
  };

  return (
    <div className={styles.cmsContainer}>
      <a href="#cms-main-content" className={styles.skipLink}>
        Skip to main content
      </a>

      {/* Sidebar Navigation */}
      <aside className={styles.sidebar} aria-label="CMS Management Menu">
        <div className={styles.sidebarBrand}>
          <span className={styles.brandEmoji} aria-hidden="true">🛡️</span>
          <div>
            <h2 className={styles.brandTitle}>AccessHub</h2>
            <span className={styles.brandRole}>Admin Portal</span>
          </div>
        </div>

        <nav className={styles.sidebarNav} aria-label="CMS Navigation Tabs">
          <ul className={styles.tabList}>
            {tabs.map(t => (
              <li key={t.id}>
                <button
                  type="button"
                  className={`${styles.tabItem} ${activeTab === t.id ? styles.tabItemActive : ''}`}
                  onClick={() => setActiveTab(t.id)}
                  aria-current={activeTab === t.id ? 'page' : undefined}
                >
                  <span className={styles.tabIcon} aria-hidden="true">{t.icon}</span>
                  <span className={styles.tabLabel}>{t.label}</span>
                </button>
              </li>
            ))}
          </ul>
        </nav>

        {/* Sidebar Profile Card */}
        {user && (
          <div className={styles.profileCard}>
            <div className={styles.profileAvatar} aria-hidden="true">
              {user.displayName?.slice(0, 2).toUpperCase() || 'AD'}
            </div>
            <div className={styles.profileInfo}>
              <p className={styles.profileName}>{user.displayName}</p>
              <p className={styles.profileEmail} title={user.email}>{user.email}</p>
            </div>
            <button
              type="button"
              className={styles.logoutBtn}
              onClick={handleSignOut}
              aria-label="Sign out of Admin Panel"
              title="Sign out"
            >
              🚪
            </button>
          </div>
        )}
      </aside>

      {/* Main CMS Display Frame */}
      <div className={styles.mainFrame}>
        <header className={styles.frameHeader}>
          <span className={styles.pathIndicator}>CMS / {activeTab}</span>
          <button
            type="button"
            className={styles.backBtn}
            onClick={() => goToPortal?.() || navigate('/')}
            aria-label="Return to the main community portal"
          >
            ← Exit to site
          </button>
        </header>

        <main className={styles.frameContent} id="cms-main-content">
          {activeTab === 'overview' && <OverviewView showToast={addToast} />}
          {activeTab === 'resources' && <ResourcesView showToast={addToast} />}
          {activeTab === 'tools' && <ToolsView showToast={addToast} />}
          {activeTab === 'events' && <EventsView showToast={addToast} />}
          {activeTab === 'discussions' && <DiscussionsView showToast={addToast} />}
          {activeTab === 'settings' && <SettingsView showToast={addToast} />}
        </main>
      </div>

      {/* Dynamic Toast Container */}
      <div className={styles.toastContainer} aria-live="polite">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`${styles.toast} ${
              toast.type === 'error' ? styles.toastError : styles.toastSuccess
            }`}
            role="alert"
          >
            <span className={styles.toastIcon} aria-hidden="true">
              {toast.type === 'error' ? '❌' : '✔'}
            </span>
            <div className={styles.toastContent}>{toast.message}</div>
            <button
              type="button"
              className={styles.toastCloseBtn}
              onClick={() => setToasts((prev) => prev.filter((t) => t.id !== toast.id))}
              aria-label="Close notification"
            >
              ✕
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
