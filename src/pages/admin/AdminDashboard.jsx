import { useState, useEffect, useRef, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "context/AuthContext";
import { SITE_NAME } from "brand";
import { ChevronLeft, ChevronRight, Search } from "lucide-react";
import Tooltip from "components/common/Tooltip/Tooltip";
import { useToast } from "context/ToastContext";
import { useAriaLive } from "context/AriaLiveContext";
import styles from "./AdminDashboard.module.css";

// Sub-page Views
import OverviewView from "./views/OverviewView/OverviewView";
import ResourcesView from "./views/ResourcesView/ResourcesView";
import ToolsView from "./views/ToolsView/ToolsView";
import EventsView from "./views/EventsView/EventsView";
import DiscussionsView from "./views/DiscussionsView/DiscussionsView";
import ArticlesView from "./views/ArticlesView/ArticlesView";
import BlogpostsView from "./views/BlogpostsView/BlogpostsView";
import ScreenReadersView from "./views/ScreenReadersView/ScreenReadersView";
import SettingsView from "./views/SettingsView/SettingsView";
import AnalyticsView from "./views/AnalyticsView/AnalyticsView";

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

export default function AdminDashboard({ goToPortal }) {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { announce } = useAriaLive();
  const [activeTab, setActiveTab] = useState(() => {
    return localStorage.getItem("adminDashboardTab") || "overview";
  });
  const [searchQuery, setSearchQuery] = useState("");
  const { addToast } = useToast();
  const [isCollapsed, setIsCollapsed] = useState(() => {
    return localStorage.getItem("adminDashboardCollapsed") === "true";
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
    }
  }, [activeTab]);

  useEffect(() => {
    document.title = `Admin  ${SITE_NAME}`;
  }, []);

  useEffect(() => {
    localStorage.setItem("adminDashboardTab", activeTab);
  }, [activeTab]);

  useEffect(() => {
    localStorage.setItem("adminDashboardCollapsed", isCollapsed);
  }, [isCollapsed]);

  const tabs = [
    { id: "overview", label: "Overview", icon: "📊" },
    { id: "analytics", label: "Analytics", icon: "📈" },
    { id: "resources", label: "Resources", icon: "📚" },
    { id: "tools", label: "Tools", icon: "🛠️" },
    { id: "events", label: "Events", icon: "📅" },
    { id: "discussions", label: "Discussions", icon: "💬" },
    { id: "articles", label: "Articles", icon: "📝" },
    { id: "blogposts", label: "Blogposts", icon: "📰" },
    { id: "screen_readers", label: "Screen Readers", icon: "🔊" },
    { id: "settings", label: "Settings", icon: "⚙️" },
  ];

  const filteredTabs = useMemo(() => {
    if (!searchQuery.trim()) return tabs;
    const q = searchQuery.toLowerCase();
    return tabs.filter((t) => t.label.toLowerCase().includes(q));
  }, [searchQuery]);

  useEffect(() => {
    if (!isInitialMount.current) {
      announce(`Found ${filteredTabs.length} admin modules`);
    }
  }, [filteredTabs.length, announce]);

  const handleSignOut = async () => {
    localStorage.removeItem("adminDashboardTab");
    localStorage.removeItem("adminDashboardCollapsed");
    await signOut();
    navigate("/sign-in", { replace: true });
  };

  const ActiveComponent = VIEWS[activeTab] || OverviewView;

  return (
    <div className={`${styles.cmsContainer} ${isCollapsed ? styles.cmsCollapsed : ""}`}>
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

        {!isCollapsed && (
          <div style={{ padding: "0 12px 12px 12px" }}>
            <label htmlFor="admin-search" className="sr-only">Quick find modules</label>
            <div style={{ position: "relative" }}>
              <Search aria-hidden="true" size={14} style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
              <input 
                id="admin-search"
                type="search"
                placeholder="Quick find..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: "100%",
                  padding: "6px 10px 6px 30px",
                  borderRadius: "4px",
                  border: "1px solid var(--border-color)",
                  backgroundColor: "var(--bg-default)",
                  color: "var(--text-primary)",
                  fontSize: "13px"
                }}
              />
            </div>
          </div>
        )}

        <nav className={styles.sidebarNav} aria-label="CMS Navigation Tabs">
          <ul className={styles.tabList}>
            {filteredTabs.map((t) => (
              <li key={t.id}>
                <Tooltip content={t.label} position="right" disabled={!isCollapsed} fullWidth>
                  <button
                    type="button"
                    role="tab"
                    aria-selected={activeTab === t.id}
                    onClick={() => setActiveTab(t.id)}
                    className={`${styles.tabItem} ${activeTab === t.id ? styles.tabItemActive : ""}`}
                  >
                    <span className={styles.tabIcon} aria-hidden="true">{t.icon}</span>
                    <span className={styles.tabLabel}>{t.label}</span>
                  </button>
                </Tooltip>
              </li>
            ))}
            {filteredTabs.length === 0 && !isCollapsed && (
              <li style={{ padding: "12px", fontSize: "13px", color: "var(--text-muted)", textAlign: "center" }}>
                No modules match "{searchQuery}"
              </li>
            )}
          </ul>
        </nav>

        <div className={styles.sidebarFooter}>
          <button 
            type="button" 
            onClick={goToPortal} 
            className={styles.backBtn}
            aria-label={isCollapsed ? "Back to Portal" : undefined}
          >
            <span aria-hidden="true">🔙</span>
            <span className={styles.tabLabel}>Back to Portal</span>
          </button>
          <button 
            type="button" 
            onClick={handleSignOut} 
            className={styles.logoutBtn}
            aria-label={isCollapsed ? "Sign Out" : undefined}
          >
            <span aria-hidden="true">🚪</span>
            <span className={styles.tabLabel}>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main id="cms-main-content" className={styles.mainContent} tabIndex={-1} ref={mainContentRef}>
        <ActiveComponent />
      </main>
    </div>
  );
}

