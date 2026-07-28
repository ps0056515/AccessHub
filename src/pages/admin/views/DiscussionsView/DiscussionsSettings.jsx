import { useState, useEffect } from 'react';
import { useConfig } from 'context/ConfigContext';
import { settingsApi } from 'api/client';
import dashboardStyles from '../../AdminDashboard.module.css';
import styles from './DiscussionsView.module.css';

export default function DiscussionsSettings({ showToast }) {
  const { portalConfig, refreshConfig } = useConfig();
  const [saving, setSaving] = useState(false);
  
  const [formData, setFormData] = useState({
    askPlaceholder: '',
    searchPlaceholder: '',
    askTopics: ''
  });

  useEffect(() => {
    setFormData({
      askPlaceholder: portalConfig.askPlaceholder || '',
      searchPlaceholder: portalConfig.searchPlaceholder || '',
      askTopics: (portalConfig.askTopics || []).join('\n')
    });
  }, [portalConfig]);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const topicsArray = formData.askTopics
        .split('\n')
        .map(t => t.trim())
        .filter(Boolean);

      await settingsApi.update({
        portal_ask_placeholder: formData.askPlaceholder,
        portal_search_placeholder: formData.searchPlaceholder,
        portal_ask_topics: topicsArray
      });

      await refreshConfig();
      showToast?.('Discussion settings updated successfully!', 'success');
    } catch (err) {
      showToast?.(err.message || 'Failed to update settings.', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className={dashboardStyles.panel} aria-labelledby="discussions-cms-title">
      <h2 id="discussions-cms-title" className={dashboardStyles.panelTitle}>Discussion Configuration</h2>
      <form onSubmit={handleSave} style={{ marginTop: '24px' }}>
        
        <div className={styles.formGroup}>
          <label htmlFor="settings-ask-placeholder" className={styles.label}>Ask Community Placeholder</label>
          <input
            id="settings-ask-placeholder"
            type="text"
            className={styles.input}
            value={formData.askPlaceholder}
            onChange={e => setFormData({ ...formData, askPlaceholder: e.target.value })}
            placeholder="e.g. What accessibility challenge are you working through?"
          />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="settings-search-placeholder" className={styles.label}>Search Discussions Placeholder</label>
          <input
            id="settings-search-placeholder"
            type="text"
            className={styles.input}
            value={formData.searchPlaceholder}
            onChange={e => setFormData({ ...formData, searchPlaceholder: e.target.value })}
            placeholder="e.g. Search discussions, topics, or members..."
          />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="settings-discussion-topics" className={styles.label}>Discussion Topics</label>
          <textarea
            id="settings-discussion-topics"
            className={styles.textarea}
            value={formData.askTopics}
            onChange={e => setFormData({ ...formData, askTopics: e.target.value })}
            placeholder="WCAG 2.2&#10;Screen readers&#10;Legal..."
          />
          <span className={styles.helperText}>Enter one topic per line. These will appear in the "Ask community" dropdown.</span>
        </div>

        <button type="submit" disabled={saving} className={styles.saveBtn}>
          {saving ? 'Saving...' : 'Save Settings'}
        </button>
      </form>
    </section>
  );
}
