import { useState, useRef, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "context/AuthContext";
import { useConfig } from "context/ConfigContext";
import Container from "components/common/Container/Container";
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
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setProfileOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

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
      <Container className={styles.inner}>
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
            <div ref={profileRef} style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <button
                type="button"
                onClick={() => setProfileOpen(!profileOpen)}
                aria-label="User Profile"
                style={{ 
                  background: 'none', border: '1px solid var(--border-strong, #cbd5e1)', borderRadius: '50%', 
                  width: '34px', height: '34px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: 'pointer', color: 'var(--text-muted, #475569)', padding: '0', transition: 'background 0.2s'
                }}
                onMouseOver={(e) => e.currentTarget.style.background = 'var(--bg-secondary, #f8fafc)'}
                onMouseOut={(e) => e.currentTarget.style.background = 'none'}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                  <circle cx="12" cy="7" r="4"></circle>
                </svg>
              </button>

              {profileOpen && (
                <div style={{
                  position: 'absolute', top: '100%', right: 0, marginTop: '8px',
                  background: 'var(--bg-card, #ffffff)', border: '1px solid var(--border, #e2e8f0)',
                  borderRadius: 'var(--radius-sm, 6px)', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                  minWidth: '220px', display: 'flex', flexDirection: 'column', zIndex: 1000
                }}>
                  <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border, #e2e8f0)' }}>
                    <span style={{ display: 'block', fontSize: '14px', fontWeight: 600, color: 'var(--text, #0f172a)' }}>
                      {user.displayName}
                    </span>
                    <span style={{ display: 'block', fontSize: '12px', color: 'var(--text-muted, #475569)', overflow: 'hidden', textOverflow: 'ellipsis' }} title={user.email}>
                      {user.email}
                    </span>
                  </div>
                  <div style={{ padding: '8px' }}>
                    {isAdmin && (
                      <button
                        type="button"
                        onClick={() => { setProfileOpen(false); navigate("/admin"); }}
                        style={{
                          width: '100%', textAlign: 'left', padding: '8px 12px', background: 'none', border: 'none',
                          fontSize: '14px', cursor: 'pointer', borderRadius: '4px', color: 'var(--text, #0f172a)'
                        }}
                        onMouseOver={(e) => e.currentTarget.style.background = 'var(--bg-secondary, #f8fafc)'}
                        onMouseOut={(e) => e.currentTarget.style.background = 'none'}
                      >
                        Admin dashboard
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={async () => {
                        setProfileOpen(false);
                        await signOut();
                        navigate("/sign-in", { replace: true });
                      }}
                      style={{
                        width: '100%', textAlign: 'left', padding: '8px 12px', background: 'none', border: 'none',
                        fontSize: '14px', cursor: 'pointer', borderRadius: '4px', color: 'var(--text, #0f172a)'
                      }}
                      onMouseOver={(e) => e.currentTarget.style.background = 'var(--bg-secondary, #f8fafc)'}
                      onMouseOut={(e) => e.currentTarget.style.background = 'none'}
                    >
                      Sign out
                    </button>
                  </div>
                </div>
              )}
            </div>
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
      </Container>

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
