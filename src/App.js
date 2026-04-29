import { useState } from 'react';
import Navbar from './components/Navbar';
import Portal from './components/Portal';
import Resources from './components/Resources';
import Tools from './components/Tools';
import Events from './components/Events';
import NVDAGuide from './components/NVDAGuide';
import Footer from './components/Footer';

const PAGES = {
  portal: Portal,
  resources: Resources,
  tools: Tools,
  events: Events,
  guide: NVDAGuide,
};

export default function App() {
  const [activePage, setActivePage] = useState('portal');

  const Page = PAGES[activePage] || Portal;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <a
        href="#main-content"
        style={{
          position: 'absolute',
          top: '-100%',
          left: 16,
          background: '#1a6b4a',
          color: '#fff',
          padding: '10px 18px',
          borderRadius: 6,
          fontSize: 14,
          fontWeight: 500,
          zIndex: 9999,
          textDecoration: 'none',
          transition: 'top 0.1s',
        }}
        onFocus={e => { e.target.style.top = '16px'; }}
        onBlur={e => { e.target.style.top = '-100%'; }}
      >
        Skip to main content
      </a>
      <Navbar activePage={activePage} setActivePage={setActivePage} />
      <main id="main-content" style={{ flex: 1 }}>
        <Page setActivePage={setActivePage} />
      </main>
      <Footer />
    </div>
  );
}
