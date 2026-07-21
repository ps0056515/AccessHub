import { useState, useEffect } from 'react';
import { screenReadersApi } from 'api/client';
import { useConfirm } from 'context/ConfirmContext';
import PhaseEditor from './PhaseEditor';
import Modal from 'components/common/Modal/Modal';
import styles from './ScreenReaderModal.module.css';

export default function ScreenReaderModal({ isOpen, onClose, onSuccess, editingGuide, showToast }) {
  const confirm = useConfirm();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isPublished, setIsPublished] = useState(false);
  const [phases, setPhases] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (editingGuide) {
        setTitle(editingGuide.title || '');
        setDescription(editingGuide.description || '');
        setPhases(editingGuide.content_json || []);
        setIsPublished(editingGuide.is_published || false);
      } else {
        setTitle('');
        setDescription('');
        setPhases([]);
        setIsPublished(false);
      }
    }
  }, [isOpen, editingGuide]);

  if (!isOpen) return null;

  const handleSave = async (e) => {
    e.preventDefault();

    if (!title || !description) {
      showToast?.('Title and Description are required', 'error');
      return;
    }

    // Validate phases minimally
    for (let i = 0; i < phases.length; i++) {
      if (!phases[i].id || !phases[i].label) {
        showToast?.(`Phase ${i + 1} must have an ID and Label`, 'error');
        return;
      }
    }

    try {
      setSubmitting(true);
      const payload = {
        title,
        description,
        content_json: phases,
        is_published: isPublished
      };

      if (editingGuide) {
        await screenReadersApi.update(editingGuide.id, payload);
        showToast?.('Guide updated successfully', 'success');
      } else {
        await screenReadersApi.create(payload);
        showToast?.('Guide created successfully', 'success');
      }
      onSuccess();
      onClose();
    } catch (err) {
      showToast?.(err.message || 'Failed to save guide', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleAddPhase = () => {
    setPhases([...phases, { id: '', label: '', type: 'steps' }]);
  };

  const handlePhaseChange = (index, updatedPhase) => {
    const newPhases = [...phases];
    newPhases[index] = updatedPhase;
    setPhases(newPhases);
  };

  const handleDeletePhase = async (index) => {
    if (await confirm('Remove this phase?')) {
      const newPhases = phases.filter((_, i) => i !== index);
      setPhases(newPhases);
    }
  };

  const handleMovePhase = (index, direction) => {
    const newIndex = index + direction;
    if (newIndex < 0 || newIndex >= phases.length) return;
    const newPhases = [...phases];
    const temp = newPhases[index];
    newPhases[index] = newPhases[newIndex];
    newPhases[newIndex] = temp;
    setPhases(newPhases);
  };

  const footer = (
    <>
      <button type="button" onClick={onClose} className={styles.cancelBtn}>Cancel</button>
      <button type="submit" form="guide-form" className={styles.saveBtn} disabled={submitting}>
        {submitting ? 'Saving...' : 'Save Guide'}
      </button>
    </>
  );

  return (
    <Modal
      title={editingGuide ? 'Edit Guide' : 'New Guide'}
      onClose={onClose}
      footer={footer}
      width="800px"
    >
      <form id="guide-form" onSubmit={handleSave}>
        <div className={styles.topSection}>
          <div className={styles.formGroup}>
            <label className={styles.label} htmlFor="screen-reader-title">Title (e.g. NVDA, JAWS)</label>
            <input 
              id="screen-reader-title"
              type="text" 
              className={styles.input} 
              value={title}
              onChange={e => setTitle(e.target.value)}
              required 
            />
          </div>
          
          <div className={styles.formGroup}>
            <label className={styles.label} htmlFor="screen-reader-description">Description (For the list view)</label>
            <textarea 
              id="screen-reader-description"
              className={styles.textarea} 
              value={description}
              onChange={e => setDescription(e.target.value)}
              required 
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.toggleLabel} htmlFor="screen-reader-publish">
              <input 
                id="screen-reader-publish"
                type="checkbox" 
                checked={isPublished}
                onChange={e => setIsPublished(e.target.checked)}
              />
              Publish immediately
            </label>
          </div>
        </div>

        <div className={styles.phasesSection}>
          <h3 className={styles.sectionTitle}>Content Phases</h3>
          <div className={styles.phasesList}>
            {phases.map((phase, index) => (
              <PhaseEditor 
                key={index} 
                phase={phase} 
                onChange={(updatedPhase) => handlePhaseChange(index, updatedPhase)} 
                onDelete={() => handleDeletePhase(index)} 
                onMoveUp={() => handleMovePhase(index, -1)}
                onMoveDown={() => handleMovePhase(index, 1)}
                isFirst={index === 0}
                isLast={index === phases.length - 1}
                index={index}
              />
            ))}
          </div>
          <button type="button" onClick={handleAddPhase} className={styles.addPhaseBtn}>
            + Add Phase
          </button>
        </div>
      </form>
    </Modal>
  );
}
