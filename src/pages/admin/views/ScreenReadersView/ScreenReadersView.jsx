import { useState, useEffect } from 'react';
import { screenReadersApi } from 'api/client';
import ScreenReaderModal from './ScreenReaderModal';
import styles from './ScreenReadersView.module.css';

export default function ScreenReadersView({ showToast }) {
  const [guides, setGuides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingGuide, setEditingGuide] = useState(null);

  useEffect(() => {
    loadGuides();
  }, []);

  const loadGuides = async () => {
    try {
      setLoading(true);
      const res = await screenReadersApi.listAdmin();
      setGuides(res.data);
    } catch (err) {
      showToast?.('Failed to load screen readers', 'error');
    } finally {
      setLoading(false);
    }
  };

  const openModal = async (guide = null) => {
    if (guide) {
      try {
        const res = await screenReadersApi.getAdmin(guide.id);
        setEditingGuide(res);
      } catch (err) {
        showToast?.('Failed to load details', 'error');
        return;
      }
    } else {
      setEditingGuide(null);
    }
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingGuide(null);
  };

  const togglePublish = async (id, currentStatus) => {
    try {
      await screenReadersApi.togglePublish(id, !currentStatus);
      showToast?.(`Guide ${!currentStatus ? 'published' : 'unpublished'}`, 'success');
      loadGuides();
    } catch (err) {
      showToast?.('Failed to update status', 'error');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this guide?')) return;
    try {
      await screenReadersApi.delete(id);
      showToast?.('Guide deleted', 'success');
      loadGuides();
    } catch (err) {
      showToast?.('Failed to delete guide', 'error');
    }
  };

  if (loading) {
    return <div className={styles.container}>Loading screen readers...</div>;
  }

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>Screen Readers</h1>
        <button onClick={() => openModal()} className={styles.addBtn}>
          + New Guide
        </button>
      </header>

      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Title</th>
              <th>Status</th>
              <th>Created</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {guides.length === 0 ? (
              <tr>
                <td colSpan="4" style={{ textAlign: 'center', padding: '24px' }}>
                  No guides found. Click "New Guide" to create one.
                </td>
              </tr>
            ) : (
              guides.map(guide => (
                <tr key={guide.id}>
                  <td className={styles.titleCell}>{guide.title}</td>
                  <td>
                    <span className={`${styles.statusBadge} ${guide.is_published ? styles.statusPublished : styles.statusDraft}`}>
                      {guide.is_published ? 'Published' : 'Draft'}
                    </span>
                  </td>
                  <td>{new Date(guide.created_at).toLocaleDateString()}</td>
                  <td>
                    <div className={styles.actions}>
                      <button onClick={() => openModal(guide)} className={styles.editBtn}>Edit</button>
                      <button 
                        onClick={() => togglePublish(guide.id, guide.is_published)}
                        className={styles.editBtn}
                      >
                        {guide.is_published ? 'Unpublish' : 'Publish'}
                      </button>
                      <button onClick={() => handleDelete(guide.id)} className={styles.deleteBtn}>Delete</button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <ScreenReaderModal
        isOpen={modalOpen}
        onClose={closeModal}
        onSuccess={loadGuides}
        editingGuide={editingGuide}
        showToast={showToast}
      />
    </div>
  );
}
