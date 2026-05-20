import { useState, useLayoutEffect, useCallback, useEffect } from 'react';
import { BrowserRouter, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Portal from './components/Portal';
import Resources from './components/Resources';
import Tools from './components/Tools';
import Events from './components/Events';
import NVDAGuide from './components/NVDAGuide';
import Footer from './components/Footer';
import ThreadPage from './components/ThreadPage';
import JoinCommunityPage from './components/JoinCommunityPage';
import MemberProfilePage from './components/MemberProfilePage';
import SignInPage from './components/SignInPage';
import SignUpPage from './components/SignUpPage';
import CompleteProfilePage from './components/CompleteProfilePage';
import AdminDashboard from './components/AdminDashboard';
import RequireAuth from './components/RequireAuth';
import RequireAdmin from './components/RequireAdmin';
import { AuthProvider } from './context/AuthContext';
import { postsApi } from './api/client';
import { SITE_NAME } from './brand';

const PAGE_TITLES = {
  portal: `Community · ${SITE_NAME}`,
  resources: `Resources · ${SITE_NAME}`,
  tools: `Tools · ${SITE_NAME}`,
  events: `Events · ${SITE_NAME}`,
  guide: `NVDA Guide · ${SITE_NAME}`,
};

/** `html { scroll-behavior: smooth }` can animate `scrollTo`; route changes must jump instantly. */
function scrollWindowTopInstant() {
  const root = document.documentElement;
  const prev = root.style.scrollBehavior;
  root.style.scrollBehavior = 'auto';
  window.scrollTo(0, 0);
  root.scrollTop = 0;
  document.body.scrollTop = 0;
  root.style.scrollBehavior = prev;
}

function AppShell() {
  const navigate = useNavigate();
  const location = useLocation();
  const [activePage, setActivePageState] = useState('portal');
  const [posts, setPosts] = useState([]);
  const [postsLoading, setPostsLoading] = useState(true);
  const [postsError, setPostsError] = useState('');

  const loadPosts = useCallback(async () => {
    setPostsLoading(true);
    setPostsError('');
    try {
      const { posts: data } = await postsApi.list();
      setPosts(data);
    } catch (err) {
      setPostsError(err.message || 'Could not load discussions.');
    } finally {
      setPostsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPosts();
  }, [loadPosts]);

  const isThreadRoute = location.pathname.startsWith('/thread/');
  const isProfileRoute = location.pathname.startsWith('/profile/');

  const PAGES = {
    portal: Portal,
    resources: Resources,
    tools: Tools,
    events: Events,
    guide: NVDAGuide,
  };

  const SECTION_IDS = ['portal', 'resources', 'tools', 'events', 'guide'];

  useLayoutEffect(() => {
    if (isThreadRoute) return;
    scrollWindowTopInstant();
    requestAnimationFrame(scrollWindowTopInstant);
  }, [activePage, isThreadRoute, location.pathname]);

  const refreshPosts = loadPosts;

  const setActivePage = useCallback(
    page => {
      setActivePageState(page);

      const onDedicatedRoute =
        isThreadRoute ||
        isProfileRoute ||
        location.pathname === '/join' ||
        location.pathname === '/sign-in' ||
        location.pathname === '/sign-up' ||
        location.pathname === '/complete-profile' ||
        location.pathname === '/admin';

      if (onDedicatedRoute) {
        navigate(page === 'events' ? '/events' : '/');
        return;
      }

      if (page === 'events') {
        navigate('/events');
        return;
      }
      if (location.pathname === '/events' && page !== 'events') {
        navigate('/');
      }
    },
    [navigate, isThreadRoute, location.pathname, isProfileRoute]
  );

  useLayoutEffect(() => {
    if (location.pathname === '/events') {
      setActivePageState('events');
    }
  }, [location.pathname]);

  useLayoutEffect(() => {
    if (isThreadRoute) return;
    if (location.pathname === '/join') {
      document.title = `Join · ${SITE_NAME}`;
      return;
    }
    if (location.pathname === '/sign-in') {
      document.title = `Sign in · ${SITE_NAME}`;
      return;
    }
    if (location.pathname === '/sign-up') {
      document.title = `Join community · ${SITE_NAME}`;
      return;
    }
    if (location.pathname === '/admin') {
      document.title = `Admin · ${SITE_NAME}`;
      return;
    }
    if (location.pathname === '/complete-profile') {
      document.title = `Complete profile · ${SITE_NAME}`;
      return;
    }
    if (isProfileRoute) {
      document.title = `Member profile · ${SITE_NAME}`;
      return;
    }
    if (location.pathname === '/events') {
      document.title = PAGE_TITLES.events;
      return;
    }
    document.title = PAGE_TITLES[activePage] || PAGE_TITLES.portal;
  }, [isThreadRoute, isProfileRoute, location.pathname, activePage]);

  const goToPortal = useCallback(() => {
    setActivePageState('portal');
    navigate('/');
    queueMicrotask(() => {
      scrollWindowTopInstant();
      requestAnimationFrame(scrollWindowTopInstant);
    });
  }, [navigate]);

  const goToSection = useCallback(
    page => {
      if (!SECTION_IDS.includes(page)) return;
      setActivePage(page);
      queueMicrotask(() => {
        scrollWindowTopInstant();
        requestAnimationFrame(scrollWindowTopInstant);
      });
    },
    [setActivePage]
  );

  const focusPortalDiscussionSearch = useCallback(() => {
    setActivePageState('portal');
    navigate('/');
    queueMicrotask(() => {
      window.dispatchEvent(new CustomEvent('allcanaccess:focus-discussion-search'));
    });
  }, [navigate]);

  const returnFromThread = useCallback(() => {
    setActivePageState('portal');
    navigate('/');
    queueMicrotask(() => {
      scrollWindowTopInstant();
      requestAnimationFrame(scrollWindowTopInstant);
    });
  }, [navigate]);

  const Page = PAGES[activePage] || Portal;
  const navActive =
    location.pathname === '/join'
      ? 'join'
      : location.pathname === '/sign-in' || location.pathname === '/sign-up'
        ? 'join'
      : location.pathname === '/events'
        ? 'events'
        : isThreadRoute || isProfileRoute
          ? 'portal'
          : activePage;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <a
        href="#main-content"
        style={{
          position: 'absolute',
          top: '-100%',
          left: 16,
          background: '#074a9e',
          color: '#fff',
          padding: '10px 18px',
          borderRadius: 6,
          fontSize: 14,
          fontWeight: 500,
          zIndex: 9999,
          textDecoration: 'none',
          transition: 'top 0.1s',
        }}
        onFocus={e => {
          e.target.style.top = '16px';
        }}
        onBlur={e => {
          e.target.style.top = '-100%';
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
              <RequireAuth>
                <JoinCommunityPage goToPortal={goToPortal} goToSection={goToSection} />
              </RequireAuth>
            }
          />
          <Route path="/sign-in" element={<SignInPage goToPortal={goToPortal} />} />
          <Route path="/sign-up" element={<SignUpPage goToPortal={goToPortal} />} />
          <Route
            path="/complete-profile"
            element={
              <RequireAuth>
                <CompleteProfilePage goToPortal={goToPortal} />
              </RequireAuth>
            }
          />
          <Route
            path="/admin"
            element={
              <RequireAdmin>
                <AdminDashboard goToPortal={goToPortal} />
              </RequireAdmin>
            }
          />
          <Route path="/events" element={<Events setActivePage={setActivePage} />} />
          <Route path="/profile/:memberId" element={<MemberProfilePage goToPortal={goToPortal} />} />
          <Route
            path="*"
            element={
              activePage === 'portal' ? (
                <Portal
                  setActivePage={setActivePage}
                  goToSection={goToSection}
                  posts={posts}
                  setPosts={setPosts}
                  postsLoading={postsLoading}
                  postsError={postsError}
                  onRetryPosts={loadPosts}
                />
              ) : (
                <Page setActivePage={setActivePage} />
              )
            }
          />
        </Routes>
      </main>
      <Footer goToSection={goToSection} goToPortal={goToPortal} />
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppShell />
      </AuthProvider>
    </BrowserRouter>
  );
}
