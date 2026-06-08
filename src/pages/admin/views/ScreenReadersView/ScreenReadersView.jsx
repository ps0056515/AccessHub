import { useState, useEffect } from 'react';
import { screenReadersApi } from 'api/client';
import ScreenReaderModal from './ScreenReaderModal';
import Table from 'components/common/Table/Table';
import styles from './ScreenReadersView.module.css';

export default function ScreenReadersView({ showToast }) {
  const [guides, setGuides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingGuide, setEditingGuide] = useState(null);
  const [screenReaderSearch, setScreenReaderSearch] = useState("");

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

  const columns = [
    { key: 'title', label: 'Title', render: (guide) => <span className={styles.titleCell}>{guide.title}</span> },
    { key: 'status', label: 'Status', render: (guide) => (
      <span className={`${styles.statusBadge} ${guide.is_published ? styles.statusPublished : styles.statusDraft}`}>
        {guide.is_published ? 'Published' : 'Draft'}
      </span>
    )},
    { key: 'created', label: 'Created', render: (guide) => new Date(guide.created_at).toLocaleDateString() },
    { key: 'updated_at', label: 'Last Updated', render: (guide) => guide.updated_at ? new Date(guide.updated_at).toLocaleString('en-US', { month: 'numeric', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' }).replace(',', '') : '—' },
    { key: 'actions', label: 'Actions', render: (guide) => (
      <div className={styles.actions}>
        <button onClick={() => openModal(guide)} className={styles.btnSecondary}>Edit</button>
        <button 
          onClick={() => togglePublish(guide.id, guide.is_published)}
          className={guide.is_published ? styles.btnSecondary : styles.btnSuccess}
        >
          {guide.is_published ? 'Unpublish' : 'Publish'}
        </button>
        <button onClick={() => handleDelete(guide.id)} className={styles.btnDanger}>Delete</button>
      </div>
    )}
  ];

  return (
    <div className={styles.container}>
      <header className={styles.header} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h1 className={styles.title} style={{ margin: 0 }}>Screen Readers</h1>
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          <input
            type="text"
            placeholder="Search guides..."
            value={screenReaderSearch}
            onChange={(e) => setScreenReaderSearch(e.target.value)}
            style={{
              padding: '8px 12px',
              borderRadius: 'var(--radius-sm, 6px)',
              border: '1px solid var(--border-strong, #cbd5e1)',
              minWidth: '250px',
              outline: 'none'
            }}
          />
          <button onClick={() => openModal()} className={styles.addBtn}>
            + New Guide
          </button>
        </div>
      </header>

      <Table 
        columns={columns} 
        data={guides} 
        emptyMessage='No guides found. Click "New Guide" to create one.' 
        searchQuery={screenReaderSearch}
      />

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
