import dashboardStyles from '../../AdminDashboard.module.css';
import styles from './DiscussionsView.module.css';

export default function DiscussionsView() {
  return (
    <>
      <header className={dashboardStyles.header}>
        <div>
          <p className={dashboardStyles.kicker}>CMS</p>
          <h1 className={dashboardStyles.title}>Moderate Discussions</h1>
          <p className={dashboardStyles.lead}>Review flagged content, manage community discussion threads, and pin important announcements.</p>
        </div>
      </header>

      <section className={dashboardStyles.panel} aria-labelledby="discussions-cms-title">
        <h2 id="discussions-cms-title" className={dashboardStyles.panelTitle}>Content Moderation Queue</h2>
        <div className={styles.underConstruction}>
          <div className={styles.constructionIcon} aria-hidden="true">💬</div>
          <p className={styles.constructionTitle}>CMS Editor is under construction</p>
          <p className={styles.constructionDesc}>
            This panel will list flagged comments and posts requiring review, enabling thread pinning, locking, or deactivation.
          </p>
        </div>
      </section>
    </>
  );
}
