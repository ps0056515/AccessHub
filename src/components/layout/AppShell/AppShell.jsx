import { useState, useLayoutEffect, useCallback, useEffect } from "react";
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
import ArticlesList from "pages/articles/ArticlesList";
import ArticleDetail from "pages/articles/ArticleDetail";
import BlogList from "pages/blog/BlogList";
import BlogDetail from "pages/blog/BlogDetail";
import SignInPage from "pages/auth/SignInPage";
import SignUpPage from "pages/auth/SignUpPage";
import ForgotPasswordPage from "pages/auth/ForgotPasswordPage";
import ResetPasswordPage from "pages/auth/ResetPasswordPage";
import CompleteProfilePage from "pages/auth/CompleteProfilePage";
// Footer pages
import Privacy from "pages/footer-pages/Privacy";
import Terms from "pages/footer-pages/Terms";
import AccessibilityStatement from "pages/footer-pages/AccessibilityStatement";
import News from "pages/footer-pages/News";
import Contact from "pages/footer-pages/Contact";
import Contribute from "pages/footer-pages/Contribute";
import En301549 from "pages/footer-pages/En301549";
import AboutUs from "pages/footer-pages/AboutUs";
import { SITE_NAME } from "brand";
import { postsApi } from "api/client";

const FOOTER_PAGE_TITLES = {
  "/news": `News · ${SITE_NAME}`,
  "/contact": `Contact · ${SITE_NAME}`,
  "/contribute": `Contribute · ${SITE_NAME}`,
  "/en-301-549": `EN 301 549 · ${SITE_NAME}`,
  "/privacy": `Privacy · ${SITE_NAME}`,
  "/terms": `Terms · ${SITE_NAME}`,
  "/accessibility": `Accessibility statement · ${SITE_NAME}`,
  "/about-us": `About Us · ${SITE_NAME}`,
};

const SECTION_PATHS = {
  portal: "/",
  resources: "/resources",
  tools: "/tools",
  events: "/events",
  guide: "/screen-readers",
  articles: "/articles",
};

const PAGE_TITLES = {
  portal: `Community · ${SITE_NAME}`,
  resources: `Resources · ${SITE_NAME}`,
  tools: `Tools · ${SITE_NAME}`,
  events: `Events · ${SITE_NAME}`,
  guide: `Screen Readers · ${SITE_NAME}`,
  articles: `Articles · ${SITE_NAME}`,
};

/** `html { scroll-behavior: smooth }` can animate `scrollTo`; route changes must jump instantly. */
function scrollWindowTopInstant() {
  const root = document.documentElement;
  const prev = root.style.scrollBehavior;
  root.style.scrollBehavior = "auto";
  window.scrollTo(0, 0);
  root.scrollTop = 0;
  document.body.scrollTop = 0;
  root.style.scrollBehavior = prev;
}

export default function AppShell() {
  const navigate = useNavigate();
  const location = useLocation();
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

  useEffect(() => {
    loadPosts();
  }, [loadPosts]);

  const isThreadRoute = location.pathname.startsWith("/thread/");
  const isProfileRoute = location.pathname.startsWith("/profile/");

  const SECTION_IDS = ["portal", "resources", "tools", "events", "guide", "articles"];

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
    if (location.pathname === "/join") {
      document.title = `Join · ${SITE_NAME}`;
      return;
    }
    if (location.pathname === "/sign-in") {
      document.title = `Sign in · ${SITE_NAME}`;
      return;
    }
    if (location.pathname === "/sign-up") {
      document.title = `Join community · ${SITE_NAME}`;
      return;
    }
    if (location.pathname === "/forgot-password") {
      document.title = `Forgot password · ${SITE_NAME}`;
      return;
    }
    if (location.pathname === "/reset-password") {
      document.title = `Reset password · ${SITE_NAME}`;
      return;
    }
    if (location.pathname === "/admin") {
      document.title = `Admin · ${SITE_NAME}`;
      return;
    }
    if (location.pathname === "/complete-profile") {
      document.title = `Complete profile · ${SITE_NAME}`;
      return;
    }
    if (isProfileRoute) {
      document.title = `Member profile · ${SITE_NAME}`;
      return;
    }
    if (sectionFromPath) {
      document.title = PAGE_TITLES[sectionFromPath];
      return;
    }
    if (FOOTER_PAGE_TITLES[location.pathname]) {
      document.title = FOOTER_PAGE_TITLES[location.pathname];
      return;
    }
    document.title = PAGE_TITLES[activePage] || PAGE_TITLES.portal;
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
      <a
        href="#main-content"
        style={{
          position: "absolute",
          top: "-100%",
          left: 16,
          background: "#074a9e",
          color: "#fff",
          padding: "10px 18px",
          borderRadius: 6,
          fontSize: 14,
          fontWeight: 500,
          zIndex: 9999,
          textDecoration: "none",
          transition: "top 0.1s",
        }}
        onFocus={(e) => {
          e.target.style.top = "16px";
        }}
        onBlur={(e) => {
          e.target.style.top = "-100%";
        }}
      >
        Skip to main content
      </a>
      <Navbar
        activePage={navActive}
        setActivePage={setActivePage}
        goToPortal={goToPortal}
        onSearch={focusPortalDiscussionSearch}
      />
      <main id="main-content" style={{ flex: 1 }}>
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
          <Route element={<RequireAuth />}>
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
              path="/join"
              element={
                <JoinCommunityPage
                  goToPortal={goToPortal}
                  goToSection={goToSection}
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
          </Route>
        </Routes>
      </main>
      <Footer goToSection={goToSection} goToPortal={goToPortal} />
    </div>
  );
}
