import { useState } from 'react';
import dashboardStyles from '../../AdminDashboard.module.css';
import styles from './DiscussionsView.module.css';
import DiscussionsSettings from './DiscussionsSettings';
import DiscussionsModeration from './DiscussionsModeration';

export default function DiscussionsView({ showToast }) {
  const [activeTab, setActiveTab] = useState('discussions');

  return (
    <>
      <header className={dashboardStyles.header}>
        <div>
          <p className={dashboardStyles.kicker}>CMS</p>
          <h1 className={dashboardStyles.title}>Discussions Management</h1>
          <p className={dashboardStyles.lead}>Manage community discussion topics, placeholders, and moderate posts.</p>
        </div>
      </header>

      <div className={styles.tabs}>
        <button
          className={`${styles.tab} ${activeTab === 'discussions' ? styles.activeTab : ''}`}
          onClick={() => setActiveTab('discussions')}
        >
          Discussions
        </button>
        <button
          className={`${styles.tab} ${activeTab === 'settings' ? styles.activeTab : ''}`}
          onClick={() => setActiveTab('settings')}
        >
          Settings
        </button>
      </div>

      <div style={{ marginTop: '24px' }}>
        {activeTab === 'discussions' && <DiscussionsModeration showToast={showToast} />}
        {activeTab === 'settings' && <DiscussionsSettings showToast={showToast} />}
      </div>
    </>
  );
}
