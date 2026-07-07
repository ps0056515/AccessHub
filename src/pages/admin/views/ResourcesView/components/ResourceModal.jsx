import { useState, useEffect } from 'react';
import { resourcesApi } from 'api/client';
import Modal from 'components/common/Modal/Modal';
import styles from '../ResourcesView.module.css';

const COLORS = ['blue', 'purple', 'green', 'amber', 'red', 'pink', 'gray'];

const DEFAULT_FORM = {
  title: '',
  view_url: '',
  icon: '📄',
  desc: '',
  color: 'blue',
  category: 'Standards',
};

export default function ResourceModal({ isOpen, resource, existingResources = [], onClose, onSave, showToast }) {
  const [formData, setFormData] = useState(DEFAULT_FORM);
  const [submitting, setSubmitting] = useState(false);

  const dynamicCategories = existingResources
    .map(r => r.category)
    .filter((c, i, arr) => c && arr.indexOf(c) === i)
    .sort();

  useEffect(() => {
    if (isOpen) {
      setFormData(resource ? {
        title: resource.title || '',
        view_url: resource.view_url || resource.url || '',
        icon: resource.icon || '📄',
        desc: resource.desc || resource.note || '',
        color: resource.color || 'blue',
        category: resource.category || 'Standards',
      } : DEFAULT_FORM);
    }
  }, [resource, isOpen]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    const { title, view_url, icon, desc, color, category } = formData;
    if (!title.trim() || !view_url.trim() || !icon.trim() || !category) {
      showToast?.('Please fill in all required fields.', 'error');
      return;
    }

    setSubmitting(true);
    const body = { title: title.trim(), view_url: view_url.trim(), icon: icon.trim(), desc: desc.trim(), color, category };

    try {
      if (resource?._proposalId) {
        await onSave?.(body);
        onClose();
      } else if (resource?.id) {
        await resourcesApi.update(resource.id, body);
        showToast?.(`Resource "${body.title}" updated successfully!`, 'success');
        onSave?.();
        onClose();
      } else {
        await resourcesApi.create(body);
        showToast?.(`Resource "${body.title}" created successfully!`, 'success');
        onSave?.();
        onClose();
      }
    } catch (err) {
      showToast?.(err.message || 'Failed to save resource.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      title={resource?.id && !resource._proposalId ? '✏️ Edit Resource' : '📚 Add New Resource'}
      onClose={onClose}
      width="46%"
      footer={
        <>
          <button type="button" onClick={onClose} className={styles.cancelBtn}>
            Cancel
          </button>
          <button type="submit" form="resource-form" disabled={submitting} className={styles.saveBtn}>
            {submitting ? 'Saving…' : 'Save Resource'}
          </button>
        </>
      }
    >
      <form id="resource-form" onSubmit={handleSave}>
        <div className={styles.formFields}>
          
          <div className={styles.formGroup}>
            <label htmlFor="res-title" className={styles.formLabel}>Title *</label>
            <input
              id="res-title"
              name="title"
              type="text"
              value={formData.title}
              onChange={handleChange}
              className={styles.formInput}
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="res-url" className={styles.formLabel}>URL *</label>
            <input
              id="res-url"
              name="view_url"
              type="url"
              value={formData.view_url}
              onChange={handleChange}
              className={styles.formInput}
              required
            />
          </div>
          
          <div className={styles.formGroup}>
            <label htmlFor="res-desc" className={styles.formLabel}>Description (optional)</label>
            <textarea
              id="res-desc"
              name="desc"
              value={formData.desc}
              onChange={handleChange}
              className={styles.formInput}
              rows={3}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className={styles.formGroup}>
              <label htmlFor="res-icon" className={styles.formLabel}>Icon Emoji *</label>
              <input
                id="res-icon"
                name="icon"
                type="text"
                value={formData.icon}
                onChange={handleChange}
                className={styles.formInput}
                required
              />
            </div>
            
            <div className={styles.formGroup}>
              <label htmlFor="res-color" className={styles.formLabel}>Color *</label>
              <select
                id="res-color"
                name="color"
                value={formData.color}
                onChange={handleChange}
                className={styles.formSelect}
                required
              >
                {COLORS.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="res-category" className={styles.formLabel}>Category *</label>
            <input
              list="category-options"
              id="res-category"
              name="category"
              value={formData.category}
              onChange={handleChange}
              className={styles.formInput}
              autoComplete="off"
              required
            />
            <datalist id="category-options">
              {dynamicCategories.map(c => <option key={c} value={c} />)}
            </datalist>
          </div>

        </div>
      </form>
    </Modal>
  );
}
