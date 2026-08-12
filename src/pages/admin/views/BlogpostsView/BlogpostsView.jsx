import { useState, useEffect } from 'react';
import { Trash } from "lucide-react";
import ReactQuill, { Quill } from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import ImageResize from 'quill-image-resize-module-react';
import { blogpostsApi } from "api/client";
import Table from "pages/admin/components/Table/Table";
import { useConfirm } from "context/ConfirmContext";
import styles from "./BlogpostsView.module.css";
import { truncateText } from 'utils/commonUtils';

// Fix for React-Quill ImageResize module looking for window.Quill
window.Quill = Quill;
Quill.register('modules/imageResize', ImageResize);

// Allow javascript: links
const Link = Quill.import('formats/link');
const originalSanitize = Link.sanitize;
Link.sanitize = function (url) {
  if (url && url.startsWith('javascript:')) {
    return url;
  }
  return originalSanitize ? originalSanitize.call(Link, url) : url;
};

export default function BlogpostsView({ showToast }) {
  const confirm = useConfirm();
  const [blogposts, setBlogposts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [blogpostSearch, setBlogpostSearch] = useState("");
  const [selectedIds, setSelectedIds] = useState([]);
  
  // Editor state
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    id: null,
    title: '',
    author: '',
    content_html: '',
    is_published: false,
    published_date: '',
    cover_image: '',
    cover_image_file: null
  });

  const loadBlogposts = async () => {
    setLoading(true);
    try {
      const { blogposts: data } = await blogpostsApi.listAdmin();
      setBlogposts(data || []);
    } catch (err) {
      showToast?.(err.message || 'Failed to load blogposts', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBlogposts();
  }, []);

  const openEditor = async (blogpost = null) => {
    if (blogpost) {
      try {
        const { blogpost: fullBlogpost } = await blogpostsApi.getAdmin(blogpost.id);
        const dateStr = fullBlogpost.published_date ? new Date(fullBlogpost.published_date).toISOString().slice(0, 16) : '';
        setFormData({
          id: fullBlogpost.id,
          title: fullBlogpost.title,
          author: fullBlogpost.author,
          content_html: fullBlogpost.content_html,
          is_published: fullBlogpost.is_published,
          published_date: dateStr,
          cover_image: fullBlogpost.cover_image || '',
          cover_image_file: null
        });
        setIsEditing(true);
      } catch (err) {
        showToast?.('Failed to load blogpost details', 'error');
      }
    } else {
      setFormData({
        id: null,
        title: '',
        author: '',
        content_html: '',
        is_published: false,
        published_date: new Date().toISOString().slice(0, 16),
        cover_image: '',
        cover_image_file: null
      });
      setIsEditing(true);
    }
  };

  const closeEditor = () => {
    setIsEditing(false);
    setFormData({ id: null, title: '', author: '', content_html: '', is_published: false, published_date: '', cover_image: '', cover_image_file: null });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.author || !formData.content_html) {
      showToast?.('Title, Author, and Content are required.', 'error');
      return;
    }

    setSaving(true);
    try {
      let finalCoverImage = formData.cover_image;
      if (formData.cover_image_file) {
        const uploadRes = await blogpostsApi.uploadCover({
          data: formData.cover_image_file,
          filename: 'cover.png'
        });
        finalCoverImage = uploadRes.url;
      }

      const payload = {
        title: formData.title,
        author: formData.author,
        content_html: formData.content_html,
        is_published: formData.is_published,
        published_date: formData.published_date || undefined,
        cover_image: finalCoverImage
      };

      if (formData.id) {
        await blogpostsApi.update(formData.id, payload);
        showToast?.('Blogpost updated successfully!', 'success');
      } else {
        await blogpostsApi.create(payload);
        showToast?.('Blogpost created successfully!', 'success');
      }
      closeEditor();
      await loadBlogposts();
    } catch (err) {
      showToast?.(err.message || 'Failed to save blogpost.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleCoverChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      showToast?.('Cover image must be smaller than 2MB', 'error');
      e.target.value = '';
      return;
    }

    const reader = new FileReader();
    reader.onload = (ev) => {
      setFormData(prev => ({ ...prev, cover_image_file: ev.target.result }));
    };
    reader.readAsDataURL(file);
  };

  const togglePublish = async (blogpost) => {
    try {
      await blogpostsApi.togglePublish(blogpost.id, !blogpost.is_published);
      showToast?.(`Blogpost ${blogpost.is_published ? 'unpublished' : 'published'}!`, 'success');
      await loadBlogposts();
    } catch (err) {
      showToast?.(err.message || 'Failed to toggle publish status.', 'error');
    }
  };

  const handleDelete = async (id, title) => {
    if (!(await confirm(`Are you sure you want to delete "${title}"?`))) return;
    try {
      await blogpostsApi.delete(id);
      showToast?.('Blogpost deleted successfully!', 'success');
      await loadBlogposts();
      setTimeout(() => document.getElementById("admin-search-input")?.focus(), 0);
    } catch (err) {
      showToast?.(err.message || 'Failed to delete blogpost.', 'error');
    }
  };

  const handleBulkDelete = async () => {
    if (!(await confirm(`Are you sure you want to delete ${selectedIds.length} blogposts?`))) return;
    try {
      await Promise.all(selectedIds.map(id => blogpostsApi.delete(id)));
      showToast?.(`Successfully deleted ${selectedIds.length} blogposts.`, "success");
      setSelectedIds([]);
      await loadBlogposts();
      setTimeout(() => document.getElementById("admin-search-input")?.focus(), 0);
    } catch (err) {
      showToast?.(err.message || "Failed to bulk delete blogposts.", "error");
    }
  };

  const handleBulkPublish = async (publishState) => {
    if (!(await confirm(`Are you sure you want to ${publishState ? "publish" : "unpublish"} ${selectedIds.length} blogposts?`))) return;
    try {
      await Promise.all(selectedIds.map(id => blogpostsApi.togglePublish(id, publishState)));
      showToast?.(`Successfully ${publishState ? "published" : "unpublished"} ${selectedIds.length} blogposts.`, "success");
      setSelectedIds([]);
      await loadBlogposts();
      setTimeout(() => document.getElementById("admin-search-input")?.focus(), 0);
    } catch (err) {
      showToast?.(err.message || `Failed to bulk ${publishState ? "publish" : "unpublish"} blogposts.`, "error");
    }
  };

  // React-Quill toolbar config
  const modules = {
    toolbar: [
      [{ 'header': [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      ['blockquote', 'code-block'],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      ['link', 'image', 'video'],
      ['clean']
    ],
    keyboard: {
      bindings: {
        tab: false, // Prevents keyboard trap (SC 2.1.2)
      },
    },
    imageResize: {
      parchment: Quill.import('parchment'),
      modules: ['Resize', 'DisplaySize', 'Toolbar']
    }
  };

  const columns = [
    { key: 'title', label: 'Title', width: '35%', render: (row) => <span style={{ fontWeight: 500 }}>{truncateText( row.title, 50)}</span> },
    { key: 'author', label: 'Author', width: "20%" },
    { key: 'status', label: 'Status', render: (blogpost) => (
      <span className={`${styles.statusBadge} ${blogpost.is_published ? styles.statusPublished : styles.statusDraft}`}>
        {blogpost.is_published ? 'Published' : 'Draft'}
      </span>
    )},
    { key: 'date', label: 'Published Date', render: (blogpost) => new Date(blogpost.published_date).toLocaleDateString() },
    { key: 'updated_at', label: 'Last Updated', render: (blogpost) => blogpost.updated_at ? new Date(blogpost.updated_at).toLocaleString('en-US', { month: 'numeric', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' }).replace(',', '') : '—' },
    { key: 'actions', label: 'Actions', render: (blogpost) => (
      <div className={styles.actions}>
        <button
          type="button"
          className={blogpost.is_published ? styles.btnSecondary : styles.btnSuccess}
          onClick={() => togglePublish(blogpost)}
          aria-label={`${blogpost.is_published ? 'Unpublish' : 'Publish'} ${blogpost.title}`}
        >
          {blogpost.is_published ? 'Unpublish' : 'Publish'}
        </button>
        <button
          type="button"
          className={styles.btnSecondary}
          onClick={() => openEditor(blogpost)}
          aria-label={`Edit ${blogpost.title}`}
        >
          Edit
        </button>
        <button
          type="button"
          className={styles.btnDanger}
          onClick={() => handleDelete(blogpost.id, blogpost.title)}
          aria-label={`Delete ${blogpost.title}`}
        >
          Delete
        </button>
      </div>
    )}
  ];

  return (
    <div className={styles.container}>
      {!isEditing ? (
        <>
          <div className={styles.header} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h2 className={styles.title} style={{ margin: 0 }}>Blogposts & News</h2>
            <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
              <input
                id="admin-search-input"
                type="search"
                aria-label="Search blogposts"
                placeholder="Search blogposts..."
                value={blogpostSearch}
                onChange={(e) => setBlogpostSearch(e.target.value)}
                style={{
                  padding: '8px 12px',
                  borderRadius: 'var(--radius-sm, 6px)',
                  border: '1px solid var(--border-strong, #cbd5e1)',
                  minWidth: '250px',
                  outline: 'none'
                }}
              />
              {selectedIds.length > 0 && (
                <>
                  <button
                    type="button"
                    onClick={() => handleBulkPublish(true)}
                    className={styles.btnSuccess}
                    style={{ padding: '8px 12px', fontSize: '14px', borderRadius: '6px' }}
                  >
                    📢 Bulk Publish
                  </button>
                  <button
                    type="button"
                    onClick={() => handleBulkPublish(false)}
                    className={styles.btnSecondary}
                    style={{ padding: '8px 12px', fontSize: '14px', borderRadius: '6px' }}
                  >
                    🚫 Bulk Unpublish
                  </button>
                  <button
                    type="button"
                    onClick={handleBulkDelete}
                    className={styles.btnDanger}
                    style={{ padding: '8px 12px', fontSize: '14px', borderRadius: '6px' }}
                  >
                    <Trash aria-hidden="true" size={16} /> Bulk Delete ({selectedIds.length})
                  </button>
                </>
              )}
              <button type="button" onClick={() => openEditor()} className={styles.createBtn}>
                <span aria-hidden="true">➕</span> Create New Blogpost
              </button>
            </div>
          </div>

          <Table 
            columns={columns} 
            data={blogposts} 
            loading={loading} 
            emptyMessage="No blogposts found." 
            searchQuery={blogpostSearch}
            selectable
            selectedRowIds={selectedIds}
            onSelectChange={setSelectedIds}
            pagination={true}
          />
        </>
      ) : (
        <form onSubmit={handleSave} className={styles.form}>
          <h2 className={styles.formTitle}>{formData.id ? 'Edit Blogpost' : 'Create Blogpost'}</h2>
          
          <div className={styles.formGroup}>
            <label htmlFor="blogpost-title" className={styles.label}>
              Title<span className="required-asterisk" aria-hidden="true"> *</span>
            </label>
            <input
              id="blogpost-title"
              type="text"
              value={formData.title}
              onChange={e => setFormData({ ...formData, title: e.target.value })}
              className={styles.input}
              required
            />
          </div>

          <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
            <div className={styles.formGroup} style={{ flex: 1, minWidth: '200px' }}>
              <label htmlFor="blogpost-author" className={styles.label}>
                Author<span className="required-asterisk" aria-hidden="true"> *</span>
              </label>
              <input
                id="blogpost-author"
                type="text"
                value={formData.author}
                onChange={e => setFormData({ ...formData, author: e.target.value })}
                className={styles.input}
                required
              />
            </div>
            <div className={styles.formGroup} style={{ flex: 1, minWidth: '200px' }}>
              <label htmlFor="blogpost-publish-date" className={styles.label}>Publish Date</label>
              <input
                id="blogpost-publish-date"
                type="datetime-local"
                value={formData.published_date}
                onChange={e => setFormData({ ...formData, published_date: e.target.value })}
                className={styles.input}
              />
            </div>
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="blogpost-cover" className={styles.label}>Cover Image (Max 2MB)</label>
            <input
              id="blogpost-cover"
              type="file"
              accept="image/*"
              onChange={handleCoverChange}
              className={styles.input}
              style={{ padding: '8px' }}
            />
            <small style={{ color: "var(--text-faint, #64748b)", marginTop: "4px", display: "block" }}>
              Recommended size: 1920x1080 | 1280x720 | 16:9 aspect ratio
            </small>
            {(formData.cover_image_file || formData.cover_image) && (
              <img 
                src={formData.cover_image_file || formData.cover_image} 
                alt="Cover Preview" 
                style={{ marginTop: '12px', maxHeight: '200px', borderRadius: '8px', objectFit: 'cover' }} 
              />
            )}
          </div>

          <div className={styles.formGroup} style={{ flexDirection: 'row', alignItems: 'center', marginTop: '8px', marginBottom: '8px' }}>
            <input
              type="checkbox"
              id="is_published"
              checked={formData.is_published}
              onChange={e => setFormData({ ...formData, is_published: e.target.checked })}
              style={{ width: '16px', height: '16px', cursor: 'pointer' }}
            />
            <label htmlFor="is_published" className={styles.label} style={{ cursor: 'pointer', margin: 0 }}>
              Publish on website
            </label>
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="blogpost-content" className={styles.label}>
              Content<span className="required-asterisk" aria-hidden="true"> *</span>
            </label>
            <div className={styles.quillWrapper} id="blogpost-content">
              <ReactQuill 
                theme="snow" 
                value={formData.content_html} 
                onChange={val => setFormData({ ...formData, content_html: val })}
                modules={modules}
              />
            </div>
          </div>

          <div className={styles.formActions}>
            <button type="button" onClick={closeEditor} className={styles.cancelBtn}>Cancel</button>
            <button type="submit" disabled={saving} className={styles.saveBtn}>
              {saving ? 'Saving...' : 'Save Blogpost'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
