import { useState, useLayoutEffect, useCallback, useEffect, useRef } from "react";
import { Routes, Route, useNavigate, useLocation } from "react-router-dom";
import Navbar from "components/layout/Navbar/Navbar";
import Footer from "components/layout/Footer/Footer";
import RequireAuth from "components/auth/RequireAuth";
import RequireAdmin from "components/auth/RequireAdmin";
import Portal from "pages/portal/Portal";
import Resources from "pages/resources/Resources";
import Tools from "pages/tools/Tools";
import Events from "pages/events/Events";
import ScreenReadersList from "pages/screen-readers/ScreenReadersList";
import ScreenReaderDetail from "pages/screen-readers/ScreenReaderDetail";
import ThreadPage from "pages/thread/ThreadPage";
import JoinCommunityPage from "pages/join/JoinCommunityPage";
import MemberProfilePage from "pages/profile/MemberProfilePage";
import MyProfilePage from "pages/profile/MyProfilePage";
import ArticlesList from "pages/articles/ArticlesList";
import ArticleDetail from "pages/articles/ArticleDetail";
import BlogList from "pages/blog/BlogList";
import BlogDetail from "pages/blog/BlogDetail";
import SignInPage from "pages/auth/SignInPage";
import SignUpPage from "pages/auth/SignUpPage";
import ForgotPasswordPage from "pages/auth/ForgotPasswordPage";
import ResetPasswordPage from "pages/auth/ResetPasswordPage";
import CompleteProfilePage from "pages/auth/CompleteProfilePage";
import GamesHub from "pages/games/GamesHub";
import GamePlayer from "pages/games/GamePlayer";
// Footer pages
import Privacy from "pages/footer-pages/Privacy/Privacy";
import Terms from "pages/footer-pages/Terms/Terms";
import AccessibilityStatement from "pages/footer-pages/AccessibilityStatement/AccessibilityStatement";
import News from "pages/footer-pages/News/News";
import Contact from "pages/footer-pages/Contact/Contact";
import Contribute from "pages/footer-pages/Contribute/Contribute";
import En301549 from "pages/footer-pages/En301549/En301549";
import AboutUs from "pages/footer-pages/AboutUs/AboutUs";
import AccessibilityJobs from "pages/footer-pages/AccessibilityJobs/AccessibilityJobs";
import Sitemap from "pages/footer-pages/Sitemap/Sitemap";
import { SITE_NAME } from "brand";
import { postsApi } from "api/client";
import { useAriaLive } from "context/AriaLiveContext";
import { useAuth } from "context/AuthContext";

const FOOTER_PAGE_TITLES = {
  "/news": `News · ${SITE_NAME}`,
  "/contact": `Contact · ${SITE_NAME}`,
  "/contribute": `Contribute · ${SITE_NAME}`,
  "/en-301-549": `EN 301 549 · ${SITE_NAME}`,
  "/privacy": `Privacy · ${SITE_NAME}`,
  "/terms": `Terms · ${SITE_NAME}`,
  "/accessibility": `Accessibility statement · ${SITE_NAME}`,
  "/about-us": `About Us · ${SITE_NAME}`,
  "/accessibility-jobs": `Accessibility Jobs · ${SITE_NAME}`,
  "/sitemap": `Sitemap · ${SITE_NAME}`,
};

const SECTION_PATHS = {
  portal: "/",
  resources: "/resources",
  tools: "/tools",
  events: "/events",
  guide: "/screen-readers",
  articles: "/articles",
  games: "/games",
};

const PAGE_TITLES = {
  portal: `Community · ${SITE_NAME}`,
  resources: `Resources · ${SITE_NAME}`,
  tools: `Tools · ${SITE_NAME}`,
  events: `Events · ${SITE_NAME}`,
  guide: `Screen Readers · ${SITE_NAME}`,
  articles: `Articles · ${SITE_NAME}`,
  games: `Games Arcade · ${SITE_NAME}`,
};

/** `html { scroll-behavior: smooth }` can animate `scrollTo`; route changes must jump instantly. */
function scrollWindowTopInstant() {
  const root = document.documentElement;
  const prev = root.style.scrollBehavior;
  root.style.scrollBehavior = "auto";
  window.scrollTo(0, 0);
  root.scrollTop = 0;
  document.body.scrollTop = 0;
  // Restore smooth scroll after the instant scroll has been processed
  requestAnimationFrame(() => {
    root.style.scrollBehavior = prev;
  });
}

export default function AppShell() {
  const navigate = useNavigate();
  const location = useLocation();
  const { announce } = useAriaLive();
  const { user } = useAuth();
  const [activePage, setActivePageState] = useState("portal");
  const [posts, setPosts] = useState([]);
  const [postsLoading, setPostsLoading] = useState(true);
  const [postsError, setPostsError] = useState("");

  const loadPosts = useCallback(async () => {
    setPostsLoading(true);
    setPostsError("");
    try {
      const { posts: data } = await postsApi.list();
      setPosts(data);
    } catch (err) {
      setPostsError(err.message || "Could not load discussions.");
    } finally {
      setPostsLoading(false);
    }
  }, []);

  // WCAG Focus Management: On route change, reset focus to the main content
  // so screen readers naturally read from the start of the new page.
  // We track the previous pathname to prevent focusing on the initial page load
  // or on StrictMode remounts, which would trap users and skip the navigation bar.
  const prevPathname = useRef(location.pathname);
  useEffect(() => {
    if (prevPathname.current === location.pathname) {
      return;
    }
    prevPathname.current = location.pathname;
    const mainContent = document.getElementById("main-content");
    if (mainContent) {
      mainContent.focus({ preventScroll: true });
    }
  }, [location.pathname]);

  useEffect(() => {
    loadPosts();
  }, [loadPosts, user?.id]);

  const isThreadRoute = location.pathname.startsWith("/thread/");
  const isProfileRoute = location.pathname.startsWith("/profile/");
  const isGameRoute = location.pathname.startsWith("/games/");

  const SECTION_IDS = ["portal", "resources", "tools", "events", "guide", "articles", "games"];

  const sectionFromPath = SECTION_IDS.find(
    (id) => id !== "portal" && location.pathname === SECTION_PATHS[id],
  );

  useLayoutEffect(() => {
    if (isThreadRoute) return;
    scrollWindowTopInstant();
    requestAnimationFrame(scrollWindowTopInstant);
  }, [activePage, isThreadRoute, location.pathname]);

  const refreshPosts = loadPosts;

  const setActivePage = useCallback(
    (page) => {
      if (!SECTION_PATHS[page]) return;
      setActivePageState(page);
      const target = SECTION_PATHS[page];
      if (location.pathname !== target) {
        navigate(target);
      }
    },
    [navigate, location.pathname],
  );

  useLayoutEffect(() => {
    if (sectionFromPath) {
      setActivePageState(sectionFromPath);
      return;
    }
    if (location.pathname === "/") {
      setActivePageState("portal");
    }
  }, [location.pathname, sectionFromPath]);

  useLayoutEffect(() => {
    if (isThreadRoute) return;
    
    let newTitle = PAGE_TITLES.portal;

    if (location.pathname === "/join") {
      newTitle = `Join · ${SITE_NAME}`;
    } else if (location.pathname === "/sign-in") {
      newTitle = `Sign in · ${SITE_NAME}`;
    } else if (location.pathname === "/sign-up") {
      newTitle = `Join community · ${SITE_NAME}`;
    } else if (location.pathname === "/forgot-password") {
      newTitle = `Forgot password · ${SITE_NAME}`;
    } else if (location.pathname === "/reset-password") {
      newTitle = `Reset password · ${SITE_NAME}`;
    } else if (location.pathname === "/admin") {
      newTitle = `Admin · ${SITE_NAME}`;
    } else if (location.pathname === "/my-profile") {
      newTitle = `My Profile · ${SITE_NAME}`;
    } else if (location.pathname === "/complete-profile") {
      newTitle = `Complete profile · ${SITE_NAME}`;
    } else if (isProfileRoute) {
      newTitle = `Member profile · ${SITE_NAME}`;
    } else if (sectionFromPath) {
      newTitle = PAGE_TITLES[sectionFromPath];
    } else if (FOOTER_PAGE_TITLES[location.pathname]) {
      newTitle = FOOTER_PAGE_TITLES[location.pathname];
    } else {
      newTitle = PAGE_TITLES[activePage] || PAGE_TITLES.portal;
    }
    
    document.title = newTitle;
    announce(`Navigated to ${newTitle.split(" · ")[0]}`);
  }, [
    isThreadRoute,
    isProfileRoute,
    location.pathname,
    activePage,
    sectionFromPath,
  ]);

  const goToPortal = useCallback(() => {
    setActivePageState("portal");
    navigate("/");
    queueMicrotask(() => {
      scrollWindowTopInstant();
      requestAnimationFrame(scrollWindowTopInstant);
    });
  }, [navigate]);

  const goToSection = useCallback(
    (page) => {
      if (!SECTION_IDS.includes(page)) return;
      setActivePage(page);
      queueMicrotask(() => {
        scrollWindowTopInstant();
        requestAnimationFrame(scrollWindowTopInstant);
      });
    },
    [setActivePage],
  );

  const focusPortalDiscussionSearch = useCallback(() => {
    setActivePageState("portal");
    navigate("/");
    setTimeout(() => {
      window.dispatchEvent(
        new CustomEvent("allcanaccess:focus-discussion-search"),
      );
    }, 100);
  }, [navigate]);

  const returnFromThread = useCallback(() => {
    setActivePageState("portal");
    navigate("/");
    queueMicrotask(() => {
      scrollWindowTopInstant();
      requestAnimationFrame(scrollWindowTopInstant);
    });
  }, [navigate]);

  const navActive =
    location.pathname === "/join"
      ? "join"
      : location.pathname === "/sign-in" ||
          location.pathname === "/sign-up" ||
          location.pathname === "/forgot-password" ||
          location.pathname === "/reset-password"
        ? "join"
        : sectionFromPath ||
          (isThreadRoute || isProfileRoute
            ? "portal"
            : location.pathname === "/"
              ? "portal"
              : activePage);

  return (
    <div
      style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}
    >
      <Navbar
        activePage={navActive}
        setActivePage={setActivePage}
        goToPortal={goToPortal}
        onSearch={focusPortalDiscussionSearch}
      />
      <main id="main-content" style={{ flex: 1, outline: "none" }} tabIndex={-1}>
        <Routes>
          <Route
            path="/sign-in"
            element={<SignInPage goToPortal={goToPortal} />}
          />
          <Route
            path="/sign-up"
            element={<SignUpPage goToPortal={goToPortal} />}
          />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          <Route
            path="/"
            element={
              <Portal
                setActivePage={setActivePage}
                goToSection={goToSection}
                posts={posts}
                setPosts={setPosts}
                postsLoading={postsLoading}
                postsError={postsError}
                onRetryPosts={loadPosts}
              />
            }
          />
          <Route
            path="/events"
            element={<Events setActivePage={setActivePage} />}
          />
          <Route
            path="/resources"
            element={<Resources setActivePage={setActivePage} />}
          />
          <Route
            path="/tools"
            element={<Tools setActivePage={setActivePage} />}
          />
          <Route
            path="/screen-readers"
            element={<ScreenReadersList />}
          />
          <Route
            path="/screen-readers/:id"
            element={<ScreenReaderDetail />}
          />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/accessibility" element={<AccessibilityStatement />} />
          <Route path="/games" element={<GamesHub />} />
          <Route path="/games/:slug" element={<GamePlayer />} />
          <Route path="/sitemap" element={<Sitemap />} />
          <Route path="/news" element={<News />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/contribute" element={<Contribute />} />
          <Route
            path="/articles"
            element={<ArticlesList setActivePage={setActivePage} />}
          />
          <Route path="/articles/:id" element={<ArticleDetail />} />
          <Route path="/blog" element={<BlogList />} />
          <Route path="/blog/:id" element={<BlogDetail />} />
          <Route path="/en-301-549" element={<En301549 />} />
          <Route path="/about-us" element={<AboutUs />} />

          <Route
            path="/join"
            element={
              <JoinCommunityPage
                goToPortal={goToPortal}
                goToSection={goToSection}
              />
            }
          />
          <Route element={<RequireAuth />}>
            <Route path="/accessibility-jobs" element={<AccessibilityJobs />} />
            <Route
              path="/thread/:postId"
              element={
                <ThreadPage
                  posts={posts}
                  setPosts={setPosts}
                  refreshPosts={refreshPosts}
                  returnToCommunity={returnFromThread}
                />
              }
            />

            <Route
              path="/complete-profile"
              element={<CompleteProfilePage goToPortal={goToPortal} />}
            />

            <Route
              path="/profile/:memberId"
              element={<MemberProfilePage goToPortal={goToPortal} />}
            />
            <Route
              path="/my-profile"
              element={<MyProfilePage />}
            />
          </Route>
        </Routes>
      </main>
      <Footer goToSection={goToSection} goToPortal={goToPortal} />
    </div>
  );
}
