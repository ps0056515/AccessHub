import { useState, useEffect } from 'react';
import styles from './DiscussionsView.module.css';
import dashboardStyles from '../../AdminDashboard.module.css';
import { useConfig } from 'context/ConfigContext';
import MultiSelectDropdown from 'components/common/MultiSelectDropdown/MultiSelectDropdown';

export default function DiscussionModal({ post, onClose, onSave, isSaving }) {
  const { portalConfig } = useConfig();
  const [formData, setFormData] = useState({
    title: '',
    body: '',
    tags: []
  });

  useEffect(() => {
    if (post) {
      setFormData({
        title: post.title || '',
        body: post.body || '',
        tags: post.tags || []
      });
    }
  }, [post]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({
      title: formData.title,
      body: formData.body,
      tags: formData.tags
    });
  };

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent} role="dialog" aria-modal="true" aria-labelledby="modal-title">
        <header className={styles.modalHeader}>
          <h2 id="modal-title" className={styles.modalTitle}>
            {post ? 'Edit Discussion' : 'Create Discussion'}
          </h2>
          <button type="button" className={styles.closeBtn} onClick={onClose} aria-label="Close">
            ×
          </button>
        </header>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
          <div className={styles.modalBody}>
          <div className={styles.formGroup}>
            <label className={styles.label}>Title</label>
            <input
              type="text"
              className={styles.input}
              value={formData.title}
              onChange={e => setFormData({ ...formData, title: e.target.value })}
              required
              minLength={5}
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Tags</label>
            <MultiSelectDropdown 
              options={portalConfig?.askTopics || []}
              value={formData.tags}
              onChange={tags => setFormData({ ...formData, tags })}
              placeholder="Select tags..."
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Body</label>
            <textarea
              className={styles.textarea}
              value={formData.body}
              onChange={e => setFormData({ ...formData, body: e.target.value })}
              required
              minLength={10}
              style={{ minHeight: '200px' }}
            />
          </div>

          </div>

          <footer className={styles.modalFooter}>
            <button type="button" className={styles.btnSecondary} onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className={styles.btnPrimary} disabled={isSaving}>
              {isSaving ? 'Saving...' : 'Save'}
            </button>
          </footer>
        </form>
      </div>
    </div>
  );
}
