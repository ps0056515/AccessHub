import { useState, useEffect } from 'react';
import ReactQuill, { Quill } from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import ImageResize from 'quill-image-resize-module-react';
import { articlesApi } from 'api/client';
import styles from './ArticlesView.module.css';

// Fix for React-Quill ImageResize module looking for window.Quill
window.Quill = Quill;
Quill.register('modules/imageResize', ImageResize);

export default function ArticlesView({ showToast }) {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  
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

  const loadArticles = async () => {
    setLoading(true);
    try {
      const { articles: data } = await articlesApi.listAdmin();
      setArticles(data || []);
    } catch (err) {
      showToast?.(err.message || 'Failed to load articles', 'error');
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
        const dateStr = fullArticle.published_date ? new Date(fullArticle.published_date).toISOString().slice(0, 16) : '';
        setFormData({
          id: fullArticle.id,
          title: fullArticle.title,
          author: fullArticle.author,
          content_html: fullArticle.content_html,
          is_published: fullArticle.is_published,
          published_date: dateStr,
          cover_image: fullArticle.cover_image || '',
          cover_image_file: null
        });
        setIsEditing(true);
      } catch (err) {
        showToast?.('Failed to load article details', 'error');
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
        const uploadRes = await articlesApi.uploadCover({
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
        await articlesApi.update(formData.id, payload);
        showToast?.('Article updated successfully!', 'success');
      } else {
        await articlesApi.create(payload);
        showToast?.('Article created successfully!', 'success');
      }
      closeEditor();
      await loadArticles();
    } catch (err) {
      showToast?.(err.message || 'Failed to save article.', 'error');
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

  const togglePublish = async (article) => {
    try {
      await articlesApi.togglePublish(article.id, !article.is_published);
      showToast?.(`Article ${article.is_published ? 'unpublished' : 'published'}!`, 'success');
      await loadArticles();
    } catch (err) {
      showToast?.(err.message || 'Failed to toggle publish status.', 'error');
    }
  };

  const handleDelete = async (id, title) => {
    if (!window.confirm(`Are you sure you want to delete "${title}"?`)) return;
    try {
      await articlesApi.delete(id);
      showToast?.('Article deleted successfully!', 'success');
      await loadArticles();
    } catch (err) {
      showToast?.(err.message || 'Failed to delete article.', 'error');
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

  return (
    <div className={styles.container}>
      {!isEditing ? (
        <>
          <div className={styles.header}>
            <h2 className={styles.title}>Articles & News</h2>
            <button type="button" onClick={() => openEditor()} className={styles.createBtn}>
              ➕ Create New Article
            </button>
          </div>

          <div className={styles.tableWrap}>
            {loading ? (
              <p className={styles.emptyState}>Loading articles...</p>
            ) : articles.length > 0 ? (
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Author</th>
                    <th>Status</th>
                    <th>Published Date</th>
                    <th style={{ width: '140px' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {articles.map(article => (
                    <tr key={article.id}>
                      <td style={{ fontWeight: 500 }}>{article.title}</td>
                      <td>{article.author}</td>
                      <td>
                        <span style={{ 
                          padding: '4px 8px', 
                          borderRadius: '12px', 
                          fontSize: '12px', 
                          fontWeight: '600',
                          background: article.is_published ? '#dcfce7' : '#f1f5f9',
                          color: article.is_published ? '#166534' : '#64748b'
                        }}>
                          {article.is_published ? 'Published' : 'Draft'}
                        </span>
                      </td>
                      <td>{new Date(article.published_date).toLocaleDateString()}</td>
                      <td>
                        <div className={styles.actions}>
                          <button
                            type="button"
                            className={styles.editBtn}
                            onClick={() => togglePublish(article)}
                            title={article.is_published ? 'Unpublish' : 'Publish'}
                          >
                            {article.is_published ? '👁️‍🗨️' : '👁️'}
                          </button>
                          <button
                            type="button"
                            className={styles.editBtn}
                            onClick={() => openEditor(article)}
                            title="Edit"
                          >
                            ✏️
                          </button>
                          <button
                            type="button"
                            className={styles.deleteBtn}
                            onClick={() => handleDelete(article.id, article.title)}
                            title="Delete"
                          >
                            🗑
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p className={styles.emptyState}>No articles found. Click "Create New Article" to start.</p>
            )}
          </div>
        </>
      ) : (
        <form onSubmit={handleSave} className={styles.form}>
          <h2 className={styles.formTitle}>{formData.id ? 'Edit Article' : 'Create Article'}</h2>
          
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
              {saving ? 'Saving...' : 'Save Article'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
