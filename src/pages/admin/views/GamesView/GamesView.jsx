import { useState, useEffect } from "react";
import { gamesApi } from "api/client";
import Table from "pages/admin/components/Table/Table";
import { useConfirm } from "context/ConfirmContext";
import styles from "./GamesView.module.css";
import { truncateText } from "utils/commonUtils";
import { SITE_NAME } from "brand";

export default function GamesView({ showToast }) {
  const confirm = useConfirm();
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  // Editor state
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  
  const [formData, setFormData] = useState({
    id: null,
    title: "",
    description: "",
    is_active: true,
  });
  
  const [htmlFile, setHtmlFile] = useState(null);
  const [thumbnailFile, setThumbnailFile] = useState(null);
  const [existingThumbnail, setExistingThumbnail] = useState(null);

  const loadGames = async () => {
    setLoading(true);
    try {
      const data = await gamesApi.listAdmin();
      setGames(data || []);
    } catch (err) {
      showToast?.(err.message || "Failed to load games", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadGames();
  }, []);

  const openEditor = (game = null) => {
    if (game) {
      setFormData({
        id: game.id,
        title: game.title,
        description: game.description || "",
        is_active: game.is_active,
      });
      setExistingThumbnail(game.thumbnail);
    } else {
      setFormData({
        id: null,
        title: "",
        description: "",
        is_active: true,
      });
      setExistingThumbnail(null);
    }
    setHtmlFile(null);
    setThumbnailFile(null);
    setIsEditing(true);
  };

  const closeEditor = () => {
    setIsEditing(false);
    setFormData({ id: null, title: "", description: "", is_active: true });
    setHtmlFile(null);
    setThumbnailFile(null);
    setExistingThumbnail(null);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!formData.title) {
      showToast?.("Title is required.", "error");
      return;
    }
    if (!formData.id && !htmlFile) {
      showToast?.("HTML file is required for new games.", "error");
      return;
    }

    setSaving(true);
    try {
      const formPayload = new FormData();
      formPayload.append("title", formData.title);
      formPayload.append("description", formData.description);
      formPayload.append("is_active", formData.is_active);
      
      if (htmlFile) formPayload.append("htmlFile", htmlFile);
      if (thumbnailFile) formPayload.append("thumbnail", thumbnailFile);

      if (formData.id) {
        await gamesApi.update(formData.id, formPayload);
        showToast?.("Game updated successfully!", "success");
      } else {
        await gamesApi.create(formPayload);
        showToast?.("Game created successfully!", "success");
      }
      closeEditor();
      await loadGames();
    } catch (err) {
      showToast?.(err.message || "Failed to save game.", "error");
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async (game) => {
    try {
      await gamesApi.toggleActive(game.id, !game.is_active);
      showToast?.(
        `Game ${game.is_active ? "disabled" : "activated"}!`,
        "success"
      );
      await loadGames();
    } catch (err) {
      showToast?.(err.message || "Failed to toggle status.", "error");
    }
  };

  const handleDelete = async (id, title) => {
    if (!(await confirm(`Are you sure you want to delete "${title}"? This cannot be undone.`))) return;
    try {
      await gamesApi.delete(id);
      showToast?.("Game deleted successfully!", "success");
      await loadGames();
    } catch (err) {
      showToast?.(err.message || "Failed to delete game.", "error");
    }
  };

  const columns = [
    {
      key: "title",
      label: "Game Title",
      width: "30%",
      render: (row) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {row.thumbnail ? (
            <img src={row.thumbnail} alt="" style={{ width: 40, height: 40, borderRadius: 6, objectFit: 'cover' }} />
          ) : (
            <div style={{ width: 40, height: 40, borderRadius: 6, backgroundColor: 'var(--bg-tertiary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>🎮</div>
          )}
          <span style={{ fontWeight: 600 }}>{truncateText(row.title, 50)}</span>
        </div>
      ),
    },
    {
      key: "status",
      label: "Status",
      render: (game) => (
        <span
          className={`${styles.statusBadge} ${game.is_active ? styles.statusActive : styles.statusDraft}`}
        >
          {game.is_active ? "Active" : "Disabled"}
        </span>
      ),
    },
    {
      key: "slug",
      label: "Slug",
      render: (a) => <span style={{ color: 'var(--text-faint)', fontSize: '13px' }}>{a.slug}</span>,
    },
    {
      key: "created_at",
      label: "Uploaded",
      render: (a) => new Date(a.created_at).toLocaleDateString(),
    },
    {
      key: "actions",
      label: "Actions",
      render: (game) => (
        <div className={styles.actions}>
          <button
            type="button"
            className={game.is_active ? styles.btnSecondary : styles.btnSuccess}
            onClick={() => toggleActive(game)}
            aria-label={`${game.is_active ? "Disable" : "Enable"} ${game.title}`}
          >
            {game.is_active ? "Disable" : "Enable"}
          </button>
          <button
            type="button"
            className={styles.btnSecondary}
            onClick={() => openEditor(game)}
            aria-label={`Edit ${game.title}`}
          >
            Edit
          </button>
          <button
            type="button"
            className={styles.btnDanger}
            onClick={() => handleDelete(game.id, game.title)}
            aria-label={`Delete ${game.title}`}
          >
            Delete
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className={styles.container}>
      {!isEditing ? (
        <>
          <div className={styles.header}>
            <h2 className={styles.title}>Games Management</h2>
            <div style={{ display: "flex", gap: "16px", alignItems: "center" }}>
              <input
                id="admin-search-input"
                type="search"
                aria-label="Search games"
                placeholder="Search games..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{
                  padding: "8px 12px",
                  borderRadius: "var(--radius-sm, 6px)",
                  border: "1px solid var(--border-strong)",
                  minWidth: "250px",
                  outline: "none",
                  backgroundColor: "var(--bg-card)",
                  color: "var(--text)",
                }}
              />
              <button
                type="button"
                onClick={() => openEditor()}
                className={styles.createBtn}
              >
                <span aria-hidden="true">🎮</span> Upload New Game
              </button>
            </div>
          </div>

          <Table
            columns={columns}
            data={games}
            loading={loading}
            emptyMessage="No games uploaded yet."
            searchQuery={search}
            pagination={true}
          />
        </>
      ) : (
        <form onSubmit={handleSave} className={styles.form}>
          <h2 className={styles.formTitle}>
            {formData.id ? "Edit Game Metadata" : "Upload HTML Game (V1)"}
          </h2>

          <div className={styles.formGroup}>
            <label htmlFor="game-title" className={styles.label}>
              Title<span className="required-asterisk" aria-hidden="true"> *</span>
            </label>
            <input
              id="game-title"
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className={styles.input}
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="game-desc" className={styles.label}>
              Description
            </label>
            <textarea
              id="game-desc"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className={`${styles.input} ${styles.textarea}`}
            />
          </div>

          {!formData.id && (
            <div className={styles.formGroup}>
              <label htmlFor="game-file" className={styles.label}>
                HTML Game File (.html)<span className="required-asterisk" aria-hidden="true"> *</span>
              </label>
              <input
                id="game-file"
                type="file"
                accept=".html"
                onChange={(e) => setHtmlFile(e.target.files[0])}
                className={styles.input}
                style={{ padding: "8px" }}
                required={!formData.id}
              />
              <small style={{ color: "var(--text-faint)" }}>
                For V1, upload a single self-contained .html file. (ZIP package support coming in V2).
              </small>
            </div>
          )}

          <div className={styles.formGroup}>
            <label htmlFor="game-thumb" className={styles.label}>
              Thumbnail Image
            </label>
            <input
              id="game-thumb"
              type="file"
              accept="image/*"
              onChange={(e) => setThumbnailFile(e.target.files[0])}
              className={styles.input}
              style={{ padding: "8px" }}
            />
            {(thumbnailFile || existingThumbnail) && (
              <img
                src={thumbnailFile ? URL.createObjectURL(thumbnailFile) : existingThumbnail}
                alt="Thumbnail preview"
                className={styles.thumbPreview}
              />
            )}
          </div>

          <div className={styles.formGroup} style={{ flexDirection: "row", alignItems: "center" }}>
            <input
              type="checkbox"
              id="is_active"
              checked={formData.is_active}
              onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
              style={{ width: "16px", height: "16px", cursor: "pointer" }}
            />
            <label htmlFor="is_active" className={styles.label} style={{ cursor: "pointer", margin: 0 }}>
              Active (Visible to public)
            </label>
          </div>

          <div className={styles.formActions}>
            <button type="button" onClick={closeEditor} className={styles.cancelBtn}>
              Cancel
            </button>
            <button type="submit" disabled={saving} className={styles.saveBtn}>
              {saving ? "Saving..." : formData.id ? "Save Changes" : "Upload Game"}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
