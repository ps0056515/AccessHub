import dashboardStyles from '../../AdminDashboard.module.css';
import styles from './EventsView.module.css';

export default function EventsView() {
  return (
    <>
      <header className={dashboardStyles.header}>
        <div>
          <p className={dashboardStyles.kicker}>CMS</p>
          <h1 className={dashboardStyles.title}>Manage Events</h1>
          <p className={dashboardStyles.lead}>Create workshops, webinars, and coordinate community office hour schedules.</p>
        </div>
      </header>

      <section className={dashboardStyles.panel} aria-labelledby="events-cms-title">
        <h2 id="events-cms-title" className={dashboardStyles.panelTitle}>Events Calendar List</h2>
        <div className={styles.underConstruction}>
          <div className={styles.constructionIcon} aria-hidden="true">📅</div>
          <p className={styles.constructionTitle}>CMS Editor is under construction</p>
          <p className={styles.constructionDesc}>
            This panel will manage upcoming community webinars and workshops, edit dates, and approve user-suggested events.
          </p>
        </div>
      </section>
    </>
  );
}
