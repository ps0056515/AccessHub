import { useState, useEffect } from 'react';
import { toolsApi } from 'api/client';
import { COLOR_MAP } from 'data';
import ToolModal from './components/ToolModal';
import dashboardStyles from '../../AdminDashboard.module.css';
import styles from './ToolsView.module.css';

export default function ToolsView({ showToast }) {
  const [toolsList, setToolsList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTool, setEditingTool] = useState(null);
  const loadTools = async () => {
    setLoading(true);
    try {
      const data = await toolsApi.list();
      if (Array.isArray(data)) {
        setToolsList(data);
      }
    } catch (err) {
      showToast?.(err.message || 'Failed to load tools.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTools();
  }, []);

  const handleOpenCreateModal = () => {
    setEditingTool(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (tool) => {
    setEditingTool(tool);
    setIsModalOpen(true);
  };

  const handleDeleteTool = async (id, toolName) => {
    if (!window.confirm(`Are you sure you want to delete "${toolName}"?`)) {
      return;
    }
    try {
      await toolsApi.delete(id);
      showToast?.(`Tool "${toolName}" deleted successfully!`, 'success');
      loadTools();
    } catch (err) {
      showToast?.(err.message || 'Failed to delete tool.', 'error');
    }
  };

  const handleMoveTool = async (index, direction) => {
    const list = [...toolsList];
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= list.length) return;

    // Swap items
    const temp = list[index];
    list[index] = list[targetIndex];
    list[targetIndex] = temp;

    // Instantly update UI for snappy feel
    setToolsList(list);

    try {
      await toolsApi.reorder({ toolIds: list.map(t => t.id) });
      showToast?.('Tools reordered successfully!', 'success');
    } catch (err) {
      showToast?.(err.message || 'Failed to save reordered list.', 'error');
      loadTools(); // revert on error
    }
  };



  return (
    <>
      <header className={dashboardStyles.header}>
        <div>
          <p className={dashboardStyles.kicker}>CMS</p>
          <h1 className={dashboardStyles.title}>Manage Tools</h1>
          <p className={dashboardStyles.lead}>Manage the catalog of accessibility check, scan, and auditing software.</p>
        </div>
      </header>

      <section className={dashboardStyles.panel} aria-labelledby="tools-cms-title">
        <div className={styles.toolsHeader}>
          <h2 id="tools-cms-title" className={dashboardStyles.panelTitle}>Software Tools Directory</h2>
          <button type="button" onClick={handleOpenCreateModal} className={styles.addToolBtn}>
            ➕ Add Recommended Tool
          </button>
        </div>

        {loading && toolsList.length === 0 ? (
          <p className={dashboardStyles.loading}>Loading tools list…</p>
        ) : (
          <div className={styles.tableContainer}>
            <table className={dashboardStyles.table}>
              <thead>
                <tr>
                  <th scope="col" style={{ width: '60px' }}>Sort</th>
                  <th scope="col" style={{ width: '60px', textAlign: 'center' }}>Icon</th>
                  <th scope="col">Name</th>
                  <th scope="col">Type</th>
                  <th scope="col">Price</th>
                  <th scope="col">Badge</th>
                  <th scope="col">URL</th>
                  <th scope="col" style={{ width: '150px' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {toolsList.map((t, index) => {
                  const badgeCol = COLOR_MAP[t.badge_color || t.badgeColor] || COLOR_MAP.blue;
                  return (
                    <tr key={t.id}>
                      <td>
                        <div className={styles.sortButtons}>
                          <button
                            type="button"
                            disabled={index === 0}
                            onClick={() => handleMoveTool(index, -1)}
                            className={styles.sortBtn}
                            aria-label={`Move tool "${t.name}" up`}
                          >
                            ▲
                          </button>
                          <button
                            type="button"
                            disabled={index === toolsList.length - 1}
                            onClick={() => handleMoveTool(index, 1)}
                            className={styles.sortBtn}
                            aria-label={`Move tool "${t.name}" down`}
                          >
                            ▼
                          </button>
                        </div>
                      </td>
                      <td className={styles.toolIconCell}>{t.icon}</td>
                      <td><strong>{t.name}</strong></td>
                      <td>{t.type}</td>
                      <td>{t.price}</td>
                      <td>
                        {t.badge ? (
                          <span
                            className={styles.badgePill}
                            style={{ background: badgeCol.bg, color: badgeCol.text }}
                          >
                            {t.badge}
                          </span>
                        ) : (
                          <span style={{ color: 'var(--text-muted)' }}>—</span>
                        )}
                      </td>
                      <td>
                        <a href={t.url} target="_blank" rel="noopener noreferrer" style={{ wordBreak: 'break-all' }}>
                          {t.url}
                        </a>
                      </td>
                      <td>
                        <div className={styles.actionBtnGroup}>
                          <button
                            type="button"
                            onClick={() => handleOpenEditModal(t)}
                            className={styles.editBtn}
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteTool(t.id, t.name)}
                            className={styles.deleteBtn}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {toolsList.length === 0 && (
                  <tr>
                    <td colSpan="8" style={{ textAlign: 'center', padding: '24px', color: 'var(--text-muted)' }}>
                      No tools found in the directory. Click "Add Recommended Tool" to create one.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Accessible Edit/Create Modal Dialog */}
      <ToolModal
        isOpen={isModalOpen}
        tool={editingTool}
        onClose={() => setIsModalOpen(false)}
        onSave={loadTools}
        showToast={showToast}
      />
    </>
  );
}
