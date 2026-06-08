import { useState, useEffect } from 'react';
import ReactQuill, { Quill } from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import ImageResize from 'quill-image-resize-module-react';
import { blogpostsApi } from 'api/client';
import Table from 'components/common/Table/Table';
import styles from './BlogpostsView.module.css';
import { truncateText } from 'utils/commonUtils';

// Fix for React-Quill ImageResize module looking for window.Quill
window.Quill = Quill;
Quill.register('modules/imageResize', ImageResize);

export default function BlogpostsView({ showToast }) {
  const [blogposts, setBlogposts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [blogpostSearch, setBlogpostSearch] = useState("");
  
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
    if (!window.confirm(`Are you sure you want to delete "${title}"?`)) return;
    try {
      await blogpostsApi.delete(id);
      showToast?.('Blogpost deleted successfully!', 'success');
      await loadBlogposts();
    } catch (err) {
      showToast?.(err.message || 'Failed to delete blogpost.', 'error');
    }
  };

  // React-Quill toolbar config
  const modules = {
    toolbar: [
      [{ 'header': [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      ['link', 'image', 'video'],
      ['clean']
    ],
    imageResize: {
      parchment: Quill.import('parchment'),
      modules: ['Resize', 'DisplaySize', 'Toolbar']
    }
  };

  const columns = [
    { key: 'title', label: 'Title', width: '35%', render: (row) => <span style={{ fontWeight: 500 }}>{truncateText( row.title, 50)}</span> },
    { key: 'author', label: 'Author', width: "20%" },
    { key: 'status', label: 'Status', render: (blogpost) => (
      <span style={{ 
        padding: '4px 8px', 
        borderRadius: '12px', 
        fontSize: '12px', 
        fontWeight: '600',
        background: blogpost.is_published ? '#dcfce7' : '#f1f5f9',
        color: blogpost.is_published ? '#166534' : '#64748b'
      }}>
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
        >
          {blogpost.is_published ? 'Unpublish' : 'Publish'}
        </button>
        <button
          type="button"
          className={styles.btnSecondary}
          onClick={() => openEditor(blogpost)}
        >
          Edit
        </button>
        <button
          type="button"
          className={styles.btnDanger}
          onClick={() => handleDelete(blogpost.id, blogpost.title)}
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
                type="text"
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
              <button type="button" onClick={() => openEditor()} className={styles.createBtn}>
                ➕ Create New Blogpost
              </button>
            </div>
          </div>

          <Table 
            columns={columns} 
            data={blogposts} 
            loading={loading} 
            emptyMessage="No blogposts found." 
            searchQuery={blogpostSearch}
          />
        </>
      ) : (
        <form onSubmit={handleSave} className={styles.form}>
          <h2 className={styles.formTitle}>{formData.id ? 'Edit Blogpost' : 'Create Blogpost'}</h2>
          
          <div className={styles.formGroup}>
            <label className={styles.label}>Title *</label>
            <input
              type="text"
              value={formData.title}
              onChange={e => setFormData({ ...formData, title: e.target.value })}
              className={styles.input}
              required
            />
          </div>

          <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
            <div className={styles.formGroup} style={{ flex: 1, minWidth: '200px' }}>
              <label className={styles.label}>Author *</label>
              <input
                type="text"
                value={formData.author}
                onChange={e => setFormData({ ...formData, author: e.target.value })}
                className={styles.input}
                required
              />
            </div>
            <div className={styles.formGroup} style={{ flex: 1, minWidth: '200px' }}>
              <label className={styles.label}>Publish Date</label>
              <input
                type="datetime-local"
                value={formData.published_date}
                onChange={e => setFormData({ ...formData, published_date: e.target.value })}
                className={styles.input}
              />
            </div>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Cover Image (Max 2MB)</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleCoverChange}
              className={styles.input}
              style={{ padding: '8px' }}
            />
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
            <label className={styles.label}>Content *</label>
            <div className={styles.quillWrapper}>
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
