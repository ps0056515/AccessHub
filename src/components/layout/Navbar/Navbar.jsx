import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "context/AuthContext";
import { useConfig } from "context/ConfigContext";
import styles from "./Navbar.module.css";

const SECTION_PATHS = {
  portal: "/",
  resources: "/resources",
  tools: "/tools",
  events: "/events",
  screenReaders: "/screen-readers",
};

export default function Navbar({
  activePage,
  setActivePage,
  goToPortal,
  onSearch,
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { user, signOut, loading: authLoading, isAdmin } = useAuth();
  const { siteName, navbarLogoUrl, navigation } = useConfig();

  const visitPortal =
    typeof goToPortal === "function"
      ? goToPortal
      : () => setActivePage("portal");

  const goToJoin = () => {
    if (user) {
      navigate("/join");
      return;
    }
    navigate("/sign-up", { state: { from: "/join" } });
  };

  const getPageIdFromUrl = (url) => {
    if (url === '/') return 'portal';
    if (url === '/resources') return 'resources';
    if (url === '/tools') return 'tools';
    if (url === '/events') return 'events';
    if (url === '/screen-readers') return 'guide';
    if (url === '/articles' || url.startsWith('/articles/')) return 'articles';
    return '';
  };

  const links = (navigation.navbar || []).map((l, index) => ({
    id: getPageIdFromUrl(l.url) || `nav-item-${index}`,
    label: l.label,
    url: l.url,
    isExternal: l.isExternal,
  }));

  const handleLinkClick = (l) => {
    const pageId = getPageIdFromUrl(l.url);
    if (pageId) {
      setActivePage(pageId);
    } else {
      if (l.isExternal) {
        window.open(l.url, "_blank", "noopener,noreferrer");
      } else {
        navigate(l.url);
      }
    }
  };

  const isLinkActive = (l) => {
    const pageId = getPageIdFromUrl(l.url);
    if (pageId) return activePage === pageId;
    return location.pathname === l.url;
  };

  return (
    <header className={styles.header} role="banner">
      <div className={styles.inner}>
        <button
          type="button"
          className={styles.logo}
          onClick={() => visitPortal()}
          aria-label={`${siteName} home`}
        >
          <img
            src={navbarLogoUrl}
            alt=""
            className={styles.logoImg}
            width={128}
            height={40}
          />
          <span className={`sr-only ${styles.logoName}`}>{siteName}</span>
          <span className={styles.logoBadge}>Beta</span>
        </button>

        <nav className={styles.nav} aria-label="Main navigation">
          {links.map((l) => (
            <button
              key={l.id}
              className={`${styles.navLink} ${isLinkActive(l) ? styles.active : ""}`}
              onClick={() => handleLinkClick(l)}
              aria-current={isLinkActive(l) ? "page" : undefined}
            >
              {l.label}
            </button>
          ))}
        </nav>

        <div className={styles.actions}>
          <button
            type="button"
            className={styles.searchBtn}
            aria-label="Search discussions"
            onClick={() => onSearch?.()}
          >
            <svg
              width="15"
              height="15"
              viewBox="0 0 15 15"
              fill="none"
              aria-hidden="true"
            >
              <circle
                cx="6.5"
                cy="6.5"
                r="4.5"
                stroke="currentColor"
                strokeWidth="1.4"
              />
              <path
                d="M10 10L13.5 13.5"
                stroke="currentColor"
                strokeWidth="1.4"
                strokeLinecap="round"
              />
            </svg>
          </button>
          {!authLoading && !user && (
            <button
              className={styles.signInBtn}
              type="button"
              onClick={() => navigate("/sign-in")}
            >
              Sign in
            </button>
          )}
          {!authLoading && user && (
            <>
              {isAdmin && (
                <button
                  className={styles.adminBtn}
                  type="button"
                  onClick={() => navigate("/admin")}
                >
                  Admin
                </button>
              )}
              <span className={styles.userLabel} title={user.email}>
                {user.displayName}
              </span>
              <button
                className={styles.signOutBtn}
                type="button"
                onClick={async () => {
                  await signOut();
                  navigate("/sign-in", { replace: true });
                }}
              >
                Sign out
              </button>
            </>
          )}
          {!authLoading && !user && (
            <button className={styles.joinBtn} type="button" onClick={goToJoin}>
              Join community
            </button>
          )}
          <button
            className={styles.menuBtn}
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((o) => !o)}
          >
            <span
              className={`${styles.bar} ${menuOpen ? styles.barOpen1 : ""}`}
            />
            <span
              className={`${styles.bar} ${menuOpen ? styles.barOpen2 : ""}`}
            />
          </button>
        </div>
      </div>

      {menuOpen && (
        <nav className={styles.mobileNav} aria-label="Mobile navigation">
          {links.map((l) => (
            <button
              key={l.id}
              className={`${styles.mobileLink} ${isLinkActive(l) ? styles.mobileActive : ""}`}
              onClick={() => {
                handleLinkClick(l);
                setMenuOpen(false);
              }}
            >
              {l.label}
            </button>
          ))}
          {!authLoading && !user && (
            <button
              type="button"
              className={styles.mobileLink}
              onClick={() => {
                navigate("/sign-in");
                setMenuOpen(false);
              }}
            >
              Sign in
            </button>
          )}
          {!authLoading && user && (
            <>
              {isAdmin && (
                <button
                  type="button"
                  className={styles.mobileLink}
                  onClick={() => {
                    navigate("/admin");
                    setMenuOpen(false);
                  }}
                >
                  Admin dashboard
                </button>
              )}
              <span className={styles.mobileUser}>{user.displayName}</span>
              <button
                type="button"
                className={styles.mobileLink}
                onClick={async () => {
                  await signOut();
                  navigate("/sign-in", { replace: true });
                  setMenuOpen(false);
                }}
              >
                Sign out
              </button>
            </>
          )}
          {!authLoading && !user && (
            <button
              type="button"
              className={styles.mobileJoin}
              onClick={() => {
                goToJoin();
                setMenuOpen(false);
              }}
            >
              Join community
            </button>
          )}
        </nav>
      )}
    </header>
  );
}
