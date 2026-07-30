import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from 'context/AuthContext';
import { SITE_NAME } from 'brand';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import Tooltip from 'pages/admin/components/Tooltip/Tooltip';
import { useToast } from 'context/ToastContext';
import styles from './AdminDashboard.module.css';
import './AdminTheme.css';
import { AdminThemeProvider, useAdminTheme } from './context/AdminThemeContext';
import Avatar from 'components/common/Avatar/Avatar';

// Sub-page Views
import OverviewView from './views/OverviewView/OverviewView';
import ResourcesView from './views/ResourcesView/ResourcesView';
import ToolsView from './views/ToolsView/ToolsView';
import EventsView from './views/EventsView/EventsView';
import DiscussionsView from './views/DiscussionsView/DiscussionsView';
import ArticlesView from './views/ArticlesView/ArticlesView';
import BlogpostsView from './views/BlogpostsView/BlogpostsView';
import ScreenReadersView from './views/ScreenReadersView/ScreenReadersView';
import SettingsView from './views/SettingsView/SettingsView';
import AnalyticsView from './views/AnalyticsView/AnalyticsView';

const VIEWS = {
  overview: OverviewView,
  resources: ResourcesView,
  tools: ToolsView,
  events: EventsView,
  discussions: DiscussionsView,
  articles: ArticlesView,
  blogposts: BlogpostsView,
  screen_readers: ScreenReadersView,
  settings: SettingsView,
  analytics: AnalyticsView,
};

function AdminDashboardInner({ goToPortal }) {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { adminTheme } = useAdminTheme();
  const [activeTab, setActiveTab] = useState(() => {
    return localStorage.getItem('adminDashboardTab') || 'overview';
  });
  const { addToast } = useToast();
  const [isCollapsed, setIsCollapsed] = useState(() => {
    return localStorage.getItem('adminDashboardCollapsed') === 'true';
  });
  const isInitialMount = useRef(true);
  const mainContentRef = useRef(null);

  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    if (mainContentRef.current) {
      mainContentRef.current.focus({ preventScroll: true });
      
      const root = document.documentElement;
      const prev = root.style.scrollBehavior;
      root.style.scrollBehavior = 'auto';
      window.scrollTo(0, 0);
      root.scrollTop = 0;
      document.body.scrollTop = 0;
      requestAnimationFrame(() => {
        root.style.scrollBehavior = prev;
      });
    }
  }, [activeTab]);

  useEffect(() => {
    document.title = `Admin · ${SITE_NAME}`;
  }, []);

  useEffect(() => {
    localStorage.setItem('adminDashboardTab', activeTab);
  }, [activeTab]);

  useEffect(() => {
    localStorage.setItem('adminDashboardCollapsed', isCollapsed);
  }, [isCollapsed]);

  const tabs = [
    { id: 'overview', label: 'Overview', icon: '📊' },
    { id: 'analytics', label: 'Analytics', icon: '📈' },
    { id: 'resources', label: 'Resources', icon: '📚' },
    { id: 'tools', label: 'Tools', icon: '🛠️' },
    { id: 'events', label: 'Events', icon: '📅' },
    { id: 'discussions', label: 'Discussions', icon: '💬' },
    { id: 'articles', label: 'Articles', icon: '📝' },
    { id: 'blogposts', label: 'Blogposts', icon: '📰' },
    { id: 'screen_readers', label: 'Screen Readers', icon: '🔊' },
    { id: 'settings', label: 'Settings', icon: '⚙️' },
  ];

  const handleSignOut = async () => {
    localStorage.removeItem('adminDashboardTab');
    localStorage.removeItem('adminDashboardCollapsed');
    await signOut();
    navigate('/sign-in', { replace: true });
  };

  return (
    <div data-admin-theme={adminTheme} className={`admin-theme ${styles.cmsContainer} ${isCollapsed ? styles.cmsCollapsed : ''}`}>
      <a href="#cms-main-content" className="global-skip-link">
        Skip to main content
      </a>

      {/* Sidebar Navigation */}
      <aside className={styles.sidebar} aria-label="CMS Management Menu">
        <div className={styles.sidebarBrand}>
          <span className={styles.brandEmoji} aria-hidden="true">🛡️</span>
          <div className={styles.brandText}>
            <span className={styles.brandTitle}>AllCanAccess</span>
            <span className={styles.brandRole}>Admin Portal</span>
          </div>
          <Tooltip content={isCollapsed ? "Expand sidebar" : "Collapse sidebar"} position="right">
            <button 
              type="button" 
              onClick={() => setIsCollapsed(!isCollapsed)}
              className={styles.collapseToggle}
              aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              {isCollapsed ? <ChevronRight aria-hidden="true" size={16} /> : <ChevronLeft aria-hidden="true" size={16} />}
            </button>
          </Tooltip>
        </div>

        <nav className={styles.sidebarNav} aria-label="CMS Navigation Tabs">
          <ul className={styles.tabList}>
            {tabs.map(t => (
              <li key={t.id}>
                <Tooltip content={t.label} position="right" disabled={!isCollapsed} fullWidth>
                  <button
                    type="button"
                    className={`${styles.tabItem} ${activeTab === t.id ? styles.tabItemActive : ''}`}
                    onClick={() => setActiveTab(t.id)}
                    aria-current={activeTab === t.id ? 'page' : undefined}
                  >
                    <span className={styles.tabIcon} aria-hidden="true">{t.icon}</span>
                    <span className={styles.tabLabel}>{t.label}</span>
                  </button>
                </Tooltip>
              </li>
            ))}
          </ul>
        </nav>

        {/* Sidebar Profile Card */}
        {user && (
          <div className={styles.profileCard}>
            <Avatar 
              src={user.avatarUrl} 
              initials={user.displayName?.slice(0, 2).toUpperCase() || 'AD'}
              color={user.color || 'blue'}
              size={32}
              className={styles.profileAvatar}
              alt={`${user.displayName}'s avatar`}
            />
            <div className={styles.profileInfo}>
              <p className={styles.profileName}>{user.displayName}</p>
              <p className={styles.profileEmail} title={user.email}>{user.email}</p>
            </div>
            <Tooltip content="Sign out" position="right" disabled={!isCollapsed}>
              <button
                type="button"
                className={styles.logoutBtn}
                onClick={handleSignOut}
                aria-label="Sign out of Admin Panel"
                title={!isCollapsed ? "Sign out" : undefined}
              >
                ➡️
              </button>
            </Tooltip>
          </div>
        )}
      </aside>

      {/* Main CMS Display Frame */}
      <div className={styles.mainFrame}>
        <header className={styles.frameHeader}>
          <h1 className={styles.pathIndicator}>CMS / {activeTab}</h1>
          <button
            type="button"
            className={styles.backBtn}
            onClick={() => {
              localStorage.removeItem('adminDashboardTab');
              localStorage.removeItem('adminDashboardCollapsed');
              if (goToPortal) goToPortal();
              else navigate('/');
            }}
            aria-label="Return to the main community portal"
          >
            <span aria-hidden="true">← </span>Exit to site
          </button>
        </header>

        <main 
          ref={mainContentRef}
          className={styles.frameContent} 
          id="cms-main-content"
          tabIndex={-1}
          style={{ outline: 'none' }}
        >
          {activeTab === 'overview' && <OverviewView showToast={addToast} />}
          {activeTab === 'analytics' && <AnalyticsView showToast={addToast} />}
          {activeTab === 'resources' && <ResourcesView showToast={addToast} />}
          {activeTab === 'tools' && <ToolsView showToast={addToast} />}
          {activeTab === 'events' && <EventsView showToast={addToast} />}
          {activeTab === 'discussions' && <DiscussionsView showToast={addToast} />}
          {activeTab === 'articles' && <ArticlesView showToast={addToast} />}
          {activeTab === 'blogposts' && <BlogpostsView showToast={addToast} />}
          {activeTab === 'screen_readers' && <ScreenReadersView showToast={addToast} />}
          {activeTab === 'settings' && <SettingsView showToast={addToast} />}
        </main>
      </div>
    </div>
  );
}

export default function AdminDashboard(props) {
  return (
    <AdminThemeProvider>
      <AdminDashboardInner {...props} />
    </AdminThemeProvider>
  );
}
