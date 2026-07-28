import { useState, useEffect } from "react";
import { toolsApi } from "api/client";
import { COLOR_MAP } from "data";
import ToolModal from "./components/ToolModal";
import dashboardStyles from "../../AdminDashboard.module.css";
import styles from "./ToolsView.module.css";
import Table from "pages/admin/components/Table/Table";
import Tooltip from "pages/admin/components/Tooltip/Tooltip";
import { truncateText } from "utils/commonUtils";
import { useConfirm } from "context/ConfirmContext";

export default function ToolsView({ showToast }) {
  const confirm = useConfirm();
  const [toolsList, setToolsList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTool, setEditingTool] = useState(null);
  const [toolSearch, setToolSearch] = useState("");
  const [selectedIds, setSelectedIds] = useState([]);
  
  const loadTools = async () => {
    setLoading(true);
    try {
      const data = await toolsApi.list();
      if (Array.isArray(data)) {
        setToolsList(data);
      }
    } catch (err) {
      showToast?.(err.message || "Failed to load tools.", "error");
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
    if (!(await confirm(`Are you sure you want to delete "${toolName}"?`))) {
      return;
    }
    try {
      await toolsApi.delete(id);
      showToast?.(`Tool "${toolName}" deleted successfully!`, "success");
      loadTools();
      setTimeout(() => document.getElementById("admin-search-input")?.focus(), 0);
    } catch (err) {
      showToast?.(err.message || "Failed to delete tool.", "error");
    }
  };

  const handleBulkDelete = async () => {
    if (!(await confirm(`Are you sure you want to delete ${selectedIds.length} tools?`))) return;
    try {
      await Promise.all(selectedIds.map(id => toolsApi.delete(id)));
      showToast?.(`Successfully deleted ${selectedIds.length} tools.`, "success");
      setSelectedIds([]);
      loadTools();
      setTimeout(() => document.getElementById("admin-search-input")?.focus(), 0);
    } catch (err) {
      showToast?.(err.message || "Failed to bulk delete tools.", "error");
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
      await toolsApi.reorder({ toolIds: list.map((t) => t.id) });
      showToast?.("Tools reordered successfully!", "success");
    } catch (err) {
      showToast?.(err.message || "Failed to save reordered list.", "error");
      loadTools(); // revert on error
    }
  };

  const columns = [
    {
      key: "sort",
      label: "Sort",
      render: (t, index) => (
        <div className={styles.sortButtons}>
          <Tooltip content="Move up" position="top" disabled={index === 0}>
            <button
              type="button"
              disabled={index === 0}
              onClick={() => handleMoveTool(index, -1)}
              className={styles.sortBtn}
              aria-label={`Move ${t.name} up in list`}
            >
              ▲
            </button>
          </Tooltip>
          <Tooltip content="Move down" position="bottom" disabled={index === toolsList.length - 1}>
            <button
              type="button"
              disabled={index === toolsList.length - 1}
              onClick={() => handleMoveTool(index, 1)}
              className={styles.sortBtn}
              aria-label={`Move ${t.name} down in list`}
            >
              ▼
            </button>
          </Tooltip>
        </div>
      ),
    },
    {
      key: "icon",
      label: "Icon",
      render: (t) => <span className={styles.toolIconCell}>{t.icon}</span>,
    },
    { key: "name", label: "Name", render: (t) => <strong>{t.name}</strong> },
    { key: "type", label: "Type" },
    { key: "price", label: "Price" },
    {
      key: "compatibility",
      label: "Compatibility",
      render: (t) => {
        const list = Array.isArray(t.compatibility) ? t.compatibility : [];
        return list.length > 0 ? (
          <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
            {list.map(c => (
              <span key={c} style={{ fontSize: '11px', background: '#e2e8f0', color: '#1e293b', padding: '2px 6px', borderRadius: '4px', fontWeight: '500' }}>
                {c}
              </span>
            ))}
          </div>
        ) : (
          <span style={{ color: "var(--text-muted)" }}>—</span>
        );
      }
    },
    {
      key: "badge",
      label: "Badge",
      render: (t) => {
        const badgeCol =
          COLOR_MAP[t.badge_color || t.badgeColor] || COLOR_MAP.blue;
        return t.badge ? (
          <span
            className={styles.badgePill}
            style={{ background: badgeCol.bg, color: badgeCol.text }}
          >
            {t.badge}
          </span>
        ) : (
          <span style={{ color: "var(--text-muted)" }}>—</span>
        );
      },
    },
    {
      key: "url",
      label: "URL",
      render: (t) => (
        
        <a
          href={t.url}
          target="_blank"
          rel="noopener noreferrer"
          style={{ wordBreak: "break-all" }}
        >
          {truncateText(t.url)}
        </a>
      ),
    },
    { key: 'updated_at', label: 'Last Updated', render: (t) => t.updated_at ? new Date(t.updated_at).toLocaleString('en-US', { month: 'numeric', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' }).replace(',', '') : '—' },
    {
      key: "actions",
      label: "Actions",
      render: (t) => (
        <div className={styles.actionBtnGroup}>
          <button
            type="button"
            onClick={() => handleOpenEditModal(t)}
            className={styles.editBtn}
            aria-label={`Edit ${t.name}`}
          >
            Edit
          </button>
          <button
            type="button"
            onClick={() => handleDeleteTool(t.id, t.name)}
            className={styles.deleteBtn}
            aria-label={`Delete ${t.name}`}
          >
            Delete
          </button>
        </div>
      ),
    },
  ];

  return (
    <>
      <header className={dashboardStyles.header}>
        <div>
          <p className={dashboardStyles.kicker}>CMS</p>
          <h1 className={dashboardStyles.title}>Manage Tools</h1>
          <p className={dashboardStyles.lead}>
            Manage the catalog of accessibility check, scan, and auditing
            software.
          </p>
        </div>
      </header>

      <section
        className={dashboardStyles.panel}
        aria-labelledby="tools-cms-title"
      >
        <div className={styles.toolsHeader} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <h2 id="tools-cms-title" className={dashboardStyles.panelTitle} style={{ margin: 0 }}>
            Software Tools Directory
          </h2>
          <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
            <input
              id="admin-search-input"
              type="search"
              placeholder="Search tools..."
              value={toolSearch}
              onChange={(e) => setToolSearch(e.target.value)}
              style={{
                padding: '8px 12px',
                borderRadius: 'var(--radius-sm, 6px)',
                border: '1px solid var(--border-strong, #cbd5e1)',
                minWidth: '250px',
                outline: 'none'
              }}
            />
            {selectedIds.length > 0 && (
              <button
                type="button"
                onClick={handleBulkDelete}
                className={styles.deleteBtn}
                style={{ padding: '8px 12px', fontSize: '14px', borderRadius: '6px' }}
              >
                🗑 Bulk Delete ({selectedIds.length})
              </button>
            )}
            <button
              type="button"
              onClick={handleOpenCreateModal}
              className={styles.addToolBtn}
            >
              ➕ Add Recommended Tool
            </button>
          </div>
        </div>

        {loading && toolsList.length === 0 ? (
          <p className={dashboardStyles.loading} role="status">Loading tools list…</p>
        ) : (
          <Table
            columns={columns}
            data={toolsList}
            emptyMessage='No tools found in the directory. Click "Add Recommended Tool" to create one.'
            searchQuery={toolSearch}
            selectable
            selectedRowIds={selectedIds}
            onSelectChange={setSelectedIds}
            pagination={true}
          />
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

