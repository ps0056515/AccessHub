import { useState, useRef, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "context/AuthContext";
import { useConfig } from "context/ConfigContext";
import { useTheme } from "context/ThemeContext";
import useFocusTrap from "hooks/useFocusTrap";
import Container from "components/common/Container/Container";
import Avatar from "components/common/Avatar/Avatar";
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
  const profileBtnRef = useRef(null);
  const menuBtnRef = useRef(null);
  const profileMenuRef = useRef(null);
  const mobileNavRef = useRef(null);
  const { theme, toggleTheme } = useTheme();

  useFocusTrap(profileMenuRef, profileOpen);
  useFocusTrap(mobileNavRef, menuOpen);

  useEffect(() => {
    if (profileOpen && profileMenuRef.current) {
      const firstItem = profileMenuRef.current.querySelector('button');
      if (firstItem) firstItem.focus({ preventScroll: true });
    }
  }, [profileOpen]);

  useEffect(() => {
    if (menuOpen && mobileNavRef.current) {
      const firstItem = mobileNavRef.current.querySelector('button');
      if (firstItem) firstItem.focus({ preventScroll: true });
      
      const prevOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = prevOverflow;
      };
    }
  }, [menuOpen]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setProfileOpen(false);
      }
    }
    function handleEscape(event) {
      if (event.key === "Escape") {
        if (profileOpen) {
          setProfileOpen(false);
          profileBtnRef.current?.focus();
        }
        if (menuOpen) {
          setMenuOpen(false);
          menuBtnRef.current?.focus();
        }
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [profileOpen, menuOpen]);

  useEffect(() => {
    if (profileOpen) {
      setTimeout(() => {
        const btn = document.getElementById('my-profile-dropdown-btn');
        if (btn) {
          document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Tab' }));
          btn.focus();
        }
      }, 50);
    }
  }, [profileOpen]);

  const navigate = useNavigate();
  const location = useLocation();
  const { user, signOut, loading: authLoading, isAdmin } = useAuth();
  const { siteName, navbarLogoUrl, navigation } = useConfig();

  const visitPortal =
    typeof goToPortal === "function"
      ? goToPortal
      : () => setActivePage("portal");

  const goToJoin = () => {
    navigate("/sign-up", { state: { from: location.pathname } });
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

  const exactMatchLink = links.find((l) => location.pathname === l.url);

  const isLinkActive = (l) => {
    if (location.pathname === l.url) return true;
    if (exactMatchLink) return false;

    const pageId = getPageIdFromUrl(l.url);
    if (pageId) return activePage === pageId;
    return false;
  };

  return (
    <header 
      className={styles.header}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget)) {
          setMenuOpen(false);
        }
      }}
    >
      <a href="#main-content" className="global-skip-link">
        Skip to main content
      </a>
      <Container className={styles.inner}>
        <button
          type="button"
          className={styles.logo}
          onClick={() => visitPortal()}
          aria-label="AllCanAccess home"
        >
          <img
            src={navbarLogoUrl}
            alt=""
            className={styles.logoImg}
          />

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
            className={styles.themeToggle}
            onClick={toggleTheme}
            aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
            title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
          >
            {theme === "dark" ? (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <circle cx="12" cy="12" r="5" />
                <line x1="12" y1="1" x2="12" y2="3" />
                <line x1="12" y1="21" x2="12" y2="23" />
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
                <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                <line x1="1" y1="12" x2="3" y2="12" />
                <line x1="21" y1="12" x2="23" y2="12" />
                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
                <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
              </svg>
            ) : (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
              </svg>
            )}
          </button>
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
            <div 
              ref={profileRef} 
              className={styles.profileWrapper}
              onBlur={(e) => {
                if (!e.currentTarget.contains(e.relatedTarget)) {
                  setProfileOpen(false);
                }
              }}
            >
              <button
                type="button"
                ref={profileBtnRef}
                className={styles.avatarBtn}
                onClick={() => setProfileOpen(!profileOpen)}
                aria-label="User Profile"
                aria-expanded={profileOpen}
                aria-haspopup="dialog"
                aria-controls={profileOpen ? "profile-menu" : undefined}
              >
                <Avatar src={user.avatarUrl} initials={user.initials || (user.displayName ? user.displayName[0] : "U")} color={user.color || "blue"} size={32} />
              </button>

              {profileOpen && (
                <div id="profile-menu" ref={profileMenuRef} className={styles.profileDropdown} role="dialog" aria-label="User menu">
                  <div className={styles.dropdownHeader}>
                    <span className={styles.dropdownName}>
                      {user.displayName}
                    </span>
                    <span className={styles.dropdownEmail} title={user.email}>
                      {user.email}
                    </span>
                  </div>
                  <div className={styles.dropdownBody}>
                    <button
                      id="my-profile-dropdown-btn"
                      type="button"
                      className={styles.dropdownItem}
                      onClick={() => { setProfileOpen(false); navigate("/my-profile"); }}
                    >
                      My profile
                    </button>
                    {isAdmin && (
                      <button
                        type="button"
                        className={styles.dropdownItem}
                        onClick={() => { setProfileOpen(false); navigate("/admin"); }}
                      >
                        Admin dashboard
                      </button>
                    )}
                    <button
                      type="button"
                      className={styles.dropdownItem}
                      onClick={async () => {
                        setProfileOpen(false);
                        await signOut();
                        navigate("/sign-in", { replace: true });
                      }}
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
            ref={menuBtnRef}
            className={styles.menuBtn}
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
            aria-controls="mobile-nav-menu"
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
        <div 
          id="mobile-nav-menu"
          role="dialog" 
          aria-modal="true" 
          aria-label="Mobile navigation"
          ref={mobileNavRef} 
          className={styles.mobileNav}
        >
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
              <span className={styles.mobileUser}>{user.displayName}</span>
              <button
                type="button"
                className={styles.mobileLink}
                onClick={() => {
                  navigate("/my-profile");
                  setMenuOpen(false);
                }}
              >
                My profile
              </button>
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
        </div>
      )}
    </header>
  );
}
