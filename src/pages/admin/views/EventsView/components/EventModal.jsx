import { useState, useEffect } from 'react';
import { eventsApi } from 'api/client';
import Modal from 'components/common/Modal/Modal';
import styles from './EventModals.module.css';

const BAND_OPTIONS = ['Free', 'Members only', 'In-person'];

const DEFAULT_FORM = {
  event_date: '',
  title: '',
  type: '',
  band: 'Free',
  tags: '',
};

export default function EventModal({ isOpen, event, onClose, onSave, showToast }) {
  const [formData, setFormData] = useState(DEFAULT_FORM);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      let parsedTags = '';
      if (event?.tags) {
        try {
          const t = JSON.parse(event.tags);
          if (Array.isArray(t)) parsedTags = t.join('\n');
        } catch (e) {
          console.error("Failed to parse tags", e);
        }
      }
      setFormData(event ? {
        // event_date comes as full ISO timestamp from Postgres; keep up to minutes (YYYY-MM-DDTHH:mm)
        event_date: event.event_date ? new Date(event.event_date).toISOString().slice(0, 16) : '',
        title: event.title || '',
        type: event.type || '',
        band: event.band || 'Free',
        tags: parsedTags,
      } : DEFAULT_FORM);
    }
  }, [event, isOpen]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    const { event_date, title, type, band, tags } = formData;
    if (!event_date || !title.trim() || !type.trim() || !band) {
      showToast?.('Please fill in all required fields.', 'error');
      return;
    }

    setSubmitting(true);
    const parsedTagsArray = tags.split('\n').map(t => t.trim()).filter(Boolean);
    const body = { event_date, title: title.trim(), type: type.trim(), band, tags: parsedTagsArray };

    try {
      if (event?._proposalId) {
        // Proposal approval — delegate to parent which calls approveProposal
        await onSave?.(body);
        onClose();
      } else if (event?.id) {
        // Regular edit
        await eventsApi.update(event.id, body);
        showToast?.(`Event "${body.title}" updated successfully!`, 'success');
        onSave?.();
        onClose();
      } else {
        // Plain create
        await eventsApi.create(body);
        showToast?.(`Event "${body.title}" created successfully!`, 'success');
        onSave?.();
        onClose();
      }
    } catch (err) {
      showToast?.(err.message || 'Failed to save event.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      title={event?.id && !event._proposalId ? '✏️ Edit Event' : '📅 Add New Event'}
      onClose={onClose}
      width="46%"
      footer={
        <>
          <button type="button" onClick={onClose} className={styles.cancelBtn}>
            Cancel
          </button>
          <button type="submit" form="event-form" disabled={submitting} className={styles.saveBtn}>
            {submitting ? 'Saving…' : 'Save Event'}
          </button>
        </>
      }
    >
      <form id="event-form" onSubmit={handleSave}>
        <div className={styles.formFields}>
          <div className={styles.formGroup}>
            <label htmlFor="event-date" className={styles.formLabel}>Date & Time (UTC) *</label>
            <input
              id="event-date"
              name="event_date"
              type="datetime-local"
              value={formData.event_date}
              onChange={handleChange}
              className={styles.formInput}
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="event-title" className={styles.formLabel}>Event Title *</label>
            <input
              id="event-title"
              name="title"
              type="text"
              value={formData.title}
              onChange={handleChange}
              className={styles.formInput}
              placeholder="e.g. WCAG 2.2 debrief"
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="event-type" className={styles.formLabel}>Type / Description *</label>
            <input
              id="event-type"
              name="type"
              type="text"
              value={formData.type}
              onChange={handleChange}
              className={styles.formInput}
              placeholder="e.g. Online · 60 min · Free"
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="event-band" className={styles.formLabel}>Band *</label>
            <select
              id="event-band"
              name="band"
              value={formData.band}
              onChange={handleChange}
              className={styles.formSelect}
              required
            >
              {BAND_OPTIONS.map(b => <option key={b} value={b}>{b}</option>)}
            </select>
          </div>
          
          <div className={styles.formGroup}>
            <label htmlFor="event-tags" className={styles.formLabel}>Tags (One per line)</label>
            <textarea
              id="event-tags"
              name="tags"
              value={formData.tags}
              onChange={handleChange}
              className={styles.formTextarea}
              placeholder="e.g. WCAG 2.2 implementations&#10;Screen reader testing"
              rows={4}
            />
          </div>
        </div>
      </form>
    </Modal>
  );
}
