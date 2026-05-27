import dashboardStyles from '../../AdminDashboard.module.css';
import styles from './ResourcesView.module.css';

export default function ResourcesView() {
  return (
    <>
      <header className={dashboardStyles.header}>
        <div>
          <p className={dashboardStyles.kicker}>CMS</p>
          <h1 className={dashboardStyles.title}>Manage Resources</h1>
          <p className={dashboardStyles.lead}>Add, edit, or delete articles, guides, and learning paths in the community library.</p>
        </div>
      </header>

      <section className={dashboardStyles.panel} aria-labelledby="resources-cms-title">
        <h2 id="resources-cms-title" className={dashboardStyles.panelTitle}>Curated Resources List</h2>
        <div className={styles.underConstruction}>
          <div className={styles.constructionIcon} aria-hidden="true">📚</div>
          <p className={styles.constructionTitle}>CMS Editor is under construction</p>
          <p className={styles.constructionDesc}>
            This panel will contain a searchable table of all community resources, category filters, and modal forms to create or edit items.
          </p>
        </div>
      </section>
    </>
  );
}
