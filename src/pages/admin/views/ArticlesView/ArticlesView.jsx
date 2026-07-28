import { useState, useEffect } from "react";
import ReactQuill, { Quill } from "react-quill";
import "react-quill/dist/quill.snow.css";
import ImageResize from "quill-image-resize-module-react";
import { articlesApi } from "api/client";
import Table from "pages/admin/components/Table/Table";
import { useConfirm } from "context/ConfirmContext";
import { Trash } from "lucide-react";
import styles from "./ArticlesView.module.css";
import { truncateText } from "utils/commonUtils";

// Fix for React-Quill ImageResize module looking for window.Quill
window.Quill = Quill;
Quill.register("modules/imageResize", ImageResize);

// Allow javascript: links
const Link = Quill.import("formats/link");
const originalSanitize = Link.sanitize;
Link.sanitize = function (url) {
  if (url && url.startsWith("javascript:")) {
    return url;
  }
  return originalSanitize ? originalSanitize.call(Link, url) : url;
};

export default function ArticlesView({ showToast }) {
  const confirm = useConfirm();
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [articleSearch, setArticleSearch] = useState("");
  const [selectedIds, setSelectedIds] = useState([]);

  // Editor state
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    id: null,
    title: "",
    author: "",
    content_html: "",
    is_published: false,
    published_date: "",
    cover_image: "",
    cover_image_file: null,
  });

  const loadArticles = async () => {
    setLoading(true);
    try {
      const { articles: data } = await articlesApi.listAdmin();
      setArticles(data || []);
    } catch (err) {
      showToast?.(err.message || "Failed to load articles", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadArticles();
  }, []);

  const openEditor = async (article = null) => {
    if (article) {
      try {
        const { article: fullArticle } = await articlesApi.getAdmin(article.id);
        const dateStr = fullArticle.published_date
          ? new Date(fullArticle.published_date).toISOString().slice(0, 16)
          : "";
        setFormData({
          id: fullArticle.id,
          title: fullArticle.title,
          author: fullArticle.author,
          content_html: fullArticle.content_html,
          is_published: fullArticle.is_published,
          published_date: dateStr,
          cover_image: fullArticle.cover_image || "",
          cover_image_file: null,
        });
        setIsEditing(true);
      } catch (err) {
        showToast?.("Failed to load article details", "error");
      }
    } else {
      setFormData({
        id: null,
        title: "",
        author: "",
        content_html: "",
        is_published: false,
        published_date: new Date().toISOString().slice(0, 16),
        cover_image: "",
        cover_image_file: null,
      });
      setIsEditing(true);
    }
  };

  const closeEditor = () => {
    setIsEditing(false);
    setFormData({
      id: null,
      title: "",
      author: "",
      content_html: "",
      is_published: false,
      published_date: "",
      cover_image: "",
      cover_image_file: null,
    });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.author || !formData.content_html) {
      showToast?.("Title, Author, and Content are required.", "error");
      return;
    }

    setSaving(true);
    try {
      let finalCoverImage = formData.cover_image;
      if (formData.cover_image_file) {
        const uploadRes = await articlesApi.uploadCover({
          data: formData.cover_image_file,
          filename: "cover.png",
        });
        finalCoverImage = uploadRes.url;
      }

      const payload = {
        title: formData.title,
        author: formData.author,
        content_html: formData.content_html,
        is_published: formData.is_published,
        published_date: formData.published_date || undefined,
        cover_image: finalCoverImage,
      };

      if (formData.id) {
        await articlesApi.update(formData.id, payload);
        showToast?.("Article updated successfully!", "success");
      } else {
        await articlesApi.create(payload);
        showToast?.("Article created successfully!", "success");
      }
      closeEditor();
      await loadArticles();
    } catch (err) {
      showToast?.(err.message || "Failed to save article.", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleCoverChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      showToast?.("Cover image must be smaller than 2MB", "error");
      e.target.value = "";
      return;
    }

    const reader = new FileReader();
    reader.onload = (ev) => {
      setFormData((prev) => ({ ...prev, cover_image_file: ev.target.result }));
    };
    reader.readAsDataURL(file);
  };

  const togglePublish = async (article) => {
    try {
      await articlesApi.togglePublish(article.id, !article.is_published);
      showToast?.(
        `Article ${article.is_published ? "unpublished" : "published"}!`,
        "success",
      );
      await loadArticles();
    } catch (err) {
      showToast?.(err.message || "Failed to toggle publish status.", "error");
    }
  };

  const handleDelete = async (id, title) => {
    if (!(await confirm(`Are you sure you want to delete "${title}"?`))) return;
    try {
      await articlesApi.delete(id);
      showToast?.("Article deleted successfully!", "success");
      await loadArticles();
      setTimeout(() => document.getElementById("admin-search-input")?.focus(), 0);
    } catch (err) {
      showToast?.(err.message || "Failed to delete article.", "error");
    }
  };

  const handleBulkDelete = async () => {
    if (
      !(await confirm(
        `Are you sure you want to delete ${selectedIds.length} articles?`,
      ))
    )
      return;
    try {
      await Promise.all(selectedIds.map((id) => articlesApi.delete(id)));
      showToast?.(
        `Successfully deleted ${selectedIds.length} articles.`,
        "success",
      );
      setSelectedIds([]);
      await loadArticles();
      setTimeout(() => document.getElementById("admin-search-input")?.focus(), 0);
    } catch (err) {
      showToast?.(err.message || "Failed to bulk delete articles.", "error");
    }
  };

  const handleBulkPublish = async (publishState) => {
    if (
      !(await confirm(
        `Are you sure you want to ${publishState ? "publish" : "unpublish"} ${selectedIds.length} articles?`,
      ))
    )
      return;
    try {
      await Promise.all(
        selectedIds.map((id) => articlesApi.togglePublish(id, publishState)),
      );
      showToast?.(
        `Successfully ${publishState ? "published" : "unpublished"} ${selectedIds.length} articles.`,
        "success",
      );
      setSelectedIds([]);
      await loadArticles();
      setTimeout(() => document.getElementById("admin-search-input")?.focus(), 0);
    } catch (err) {
      showToast?.(
        err.message ||
          `Failed to bulk ${publishState ? "publish" : "unpublish"} articles.`,
        "error",
      );
    }
  };

  // React-Quill toolbar config
  const modules = {
    toolbar: [
      [{ header: [1, 2, 3, false] }],
      ["bold", "italic", "underline", "strike"],
      ["blockquote", "code-block"],
      [{ list: "ordered" }, { list: "bullet" }],
      ["link", "image", "video"],
      ["clean"],
    ],
    keyboard: {
      bindings: {
        tab: false, // Prevents keyboard trap (SC 2.1.2)
      },
    },
    imageResize: {
      parchment: Quill.import("parchment"),
      modules: ["Resize", "DisplaySize", "Toolbar"],
    },
  };

  const columns = [
    {
      key: "title",
      label: "Title",
      width: "35%",
      render: (row) => (
        <span style={{ fontWeight: 500 }}>{truncateText(row.title, 50)}</span>
      ),
    },
    { key: "author", label: "Author", width: "20%" },
    {
      key: "status",
      label: "Status",
      render: (article) => (
        <span
          className={`${styles.statusBadge} ${article.is_published ? styles.statusPublished : styles.statusDraft}`}
        >
          {article.is_published ? "Published" : "Draft"}
        </span>
      ),
    },
    {
      key: "published",
      label: "Published",
      render: (a) => new Date(a.published_date).toLocaleDateString(),
    },
    {
      key: "updated_at",
      label: "Last Updated",
      render: (a) =>
        a.updated_at
          ? new Date(a.updated_at)
              .toLocaleString("en-US", {
                month: "numeric",
                day: "numeric",
                year: "numeric",
                hour: "numeric",
                minute: "2-digit",
              })
              .replace(",", "")
          : "—",
    },
    {
      key: "actions",
      label: "Actions",
      render: (article) => (
        <div className={styles.actions}>
          <button
            type="button"
            className={
              article.is_published ? styles.btnSecondary : styles.btnSuccess
            }
            onClick={() => togglePublish(article)}
            aria-label={`${article.is_published ? "Unpublish" : "Publish"} ${article.title}`}
          >
            {article.is_published ? "Unpublish" : "Publish"}
          </button>
          <button
            type="button"
            className={styles.btnSecondary}
            onClick={() => openEditor(article)}
            aria-label={`Edit ${article.title}`}
          >
            Edit
          </button>
          <button
            type="button"
            className={styles.btnDanger}
            onClick={() => handleDelete(article.id, article.title)}
            aria-label={`Delete ${article.title}`}
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
          <div
            className={styles.header}
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "16px",
            }}
          >
            <h2 className={styles.title} style={{ margin: 0 }}>
              Articles & News
            </h2>
            <div style={{ display: "flex", gap: "16px", alignItems: "center" }}>
              <input
                id="admin-search-input"
                type="search"
                aria-label="Search articles"
                placeholder="Search articles..."
                value={articleSearch}
                onChange={(e) => setArticleSearch(e.target.value)}
                style={{
                  padding: "8px 12px",
                  borderRadius: "var(--radius-sm, 6px)",
                  border: "1px solid var(--border-strong, #cbd5e1)",
                  minWidth: "250px",
                  outline: "none",
                }}
              />
              {selectedIds.length > 0 && (
                <>
                  <button
                    type="button"
                    onClick={() => handleBulkPublish(true)}
                    className={styles.btnSuccess}
                    style={{
                      padding: "8px 12px",
                      fontSize: "14px",
                      borderRadius: "6px",
                    }}
                  >
                    📢 Bulk Publish
                  </button>
                  <button
                    type="button"
                    onClick={() => handleBulkPublish(false)}
                    className={styles.btnSecondary}
                    style={{
                      padding: "8px 12px",
                      fontSize: "14px",
                      borderRadius: "6px",
                    }}
                  >
                    🚫 Bulk Unpublish
                  </button>
                  <button
                    type="button"
                    onClick={handleBulkDelete}
                    className={styles.btnDanger}
                    style={{
                      padding: "8px 12px",
                      fontSize: "14px",
                      borderRadius: "6px",
                    }}
                  >
                    <Trash aria-hidden="true" size={16} /> Bulk Delete ({selectedIds.length})
                  </button>
                </>
              )}
              <button
                type="button"
                onClick={() => openEditor()}
                className={styles.createBtn}
              >
                ➕ Create New Article
              </button>
            </div>
          </div>

          <Table
            columns={columns}
            data={articles}
            loading={loading}
            emptyMessage="No articles found."
            searchQuery={articleSearch}
            selectable
            selectedRowIds={selectedIds}
            onSelectChange={setSelectedIds}
            pagination={true}
          />
        </>
      ) : (
        <form onSubmit={handleSave} className={styles.form}>
          <h2 className={styles.formTitle}>
            {formData.id ? "Edit Article" : "Create Article"}
          </h2>

          <div className={styles.formGroup}>
            <label htmlFor="article-title" className={styles.label}>
              Title<span className="required-asterisk" aria-hidden="true"> *</span>
            </label>
            <input
              id="article-title"
              type="text"
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              className={styles.input}
              required
            />
          </div>

          <div style={{ display: "flex", gap: "16px", flexWrap: "wrap" }}>
            <div
              className={styles.formGroup}
              style={{ flex: 1, minWidth: "200px" }}
            >
              <label htmlFor="article-author" className={styles.label}>
                Author<span className="required-asterisk" aria-hidden="true"> *</span>
              </label>
              <input
                id="article-author"
                type="text"
                value={formData.author}
                onChange={(e) =>
                  setFormData({ ...formData, author: e.target.value })
                }
                className={styles.input}
                required
              />
            </div>
            <div
              className={styles.formGroup}
              style={{ flex: 1, minWidth: "200px" }}
            >
              <label htmlFor="article-publish-date" className={styles.label}>Publish Date</label>
              <input
                id="article-publish-date"
                type="datetime-local"
                value={formData.published_date}
                onChange={(e) =>
                  setFormData({ ...formData, published_date: e.target.value })
                }
                className={styles.input}
              />
            </div>
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="article-cover" className={styles.label}>Cover Image (Max 2MB)</label>
            <input
              id="article-cover"
              type="file"
              accept="image/*"
              onChange={handleCoverChange}
              className={styles.input}
              style={{ padding: "8px" }}
            />
            <small
              style={{
                color: "var(--text-faint, #64748b)",
                marginTop: "4px",
                display: "block",
              }}
            >
              Recommended size: 1920x1080 | 1280x720 | 16:9 aspect ratio
            </small>
            {(formData.cover_image_file || formData.cover_image) && (
              <img
                src={formData.cover_image_file || formData.cover_image}
                alt="Cover Preview"
                style={{
                  marginTop: "12px",
                  maxHeight: "200px",
                  borderRadius: "8px",
                  objectFit: "cover",
                }}
              />
            )}
          </div>

          <div
            className={styles.formGroup}
            style={{
              flexDirection: "row",
              alignItems: "center",
              marginTop: "8px",
              marginBottom: "8px",
            }}
          >
            <input
              type="checkbox"
              id="is_published"
              checked={formData.is_published}
              onChange={(e) =>
                setFormData({ ...formData, is_published: e.target.checked })
              }
              style={{ width: "16px", height: "16px", cursor: "pointer" }}
            />
            <label
              htmlFor="is_published"
              className={styles.label}
              style={{ cursor: "pointer", margin: 0 }}
            >
              Publish on website
            </label>
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="article-content" className={styles.label}>
              Content<span className="required-asterisk" aria-hidden="true"> *</span>
            </label>
            <div className={styles.quillWrapper} id="article-content">
              <ReactQuill
                theme="snow"
                value={formData.content_html}
                onChange={(val) =>
                  setFormData({ ...formData, content_html: val })
                }
                modules={modules}
              />
            </div>
          </div>

          <div className={styles.formActions}>
            <button
              type="button"
              onClick={closeEditor}
              className={styles.cancelBtn}
            >
              Cancel
            </button>
            <button type="submit" disabled={saving} className={styles.saveBtn}>
              {saving ? "Saving..." : "Save Article"}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
