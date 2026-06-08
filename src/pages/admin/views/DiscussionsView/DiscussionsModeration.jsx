import { useState, useEffect, useMemo } from 'react';
import { postsApi } from 'api/client';
import dashboardStyles from '../../AdminDashboard.module.css';
import DiscussionModal from './DiscussionModal';
import Table from 'components/common/Table/Table';
import styles from './DiscussionsView.module.css';
import { truncateText } from 'utils/commonUtils';

export default function DiscussionsModeration({ showToast }) {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalPost, setModalPost] = useState(null); // null = closed, {} = new, {id...} = edit
  const [isSaving, setIsSaving] = useState(false);
  const [discussionSearch, setDiscussionSearch] = useState("");

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const res = await postsApi.listAdmin();
      setPosts(res.posts || []);
    } catch (err) {
      showToast?.(err.message || 'Failed to load posts.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateNew = () => {
    setModalPost({});
  };

  const handleEdit = (post) => {
    setModalPost(post);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this discussion?')) return;
    try {
      await postsApi.deleteAdmin(id);
      setPosts(prev => prev.filter(p => p.id !== id));
      showToast?.('Discussion deleted.', 'success');
    } catch (err) {
      showToast?.(err.message || 'Failed to delete discussion.', 'error');
    }
  };

  const handleSaveModal = async (data) => {
    setIsSaving(true);
    try {
      if (modalPost.id) {
        // Edit
        const res = await postsApi.updateAdmin(modalPost.id, data);
        setPosts(prev => prev.map(p => p.id === modalPost.id ? res.post : p));
        showToast?.('Discussion updated.', 'success');
      } else {
        // Create
        const res = await postsApi.createAdmin(data);
        setPosts(prev => [res.post, ...prev]);
        showToast?.('Discussion created.', 'success');
      }
      setModalPost(null);
    } catch (err) {
      showToast?.(err.message || 'Failed to save discussion.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const uniqueTags = useMemo(() => {
    const tags = new Set();
    posts.forEach(p => {
      if (Array.isArray(p.tags)) {
        p.tags.forEach(t => tags.add(t));
      }
    });
    return Array.from(tags).sort();
  }, [posts]);

  const columns = [
    { 
      key: 'title', 
      label: 'Title', 
      filterOptions: uniqueTags.length > 0 ? uniqueTags : undefined,
      filterMatch: (row, val) => Array.isArray(row.tags) && row.tags.includes(val),
      render: (post) => (
      <>
        <p style={{ fontWeight: 600 }}>{truncateText(post.title, 50)}</p>
        {post.tags && post.tags.length > 0 && (
          <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px' }}>
            {post.tags.join(', ')}
          </div>
        )}
      </>
    )},
    { key: 'author', label: 'Author' },
    { key: 'votes', label: 'Votes' },
    { key: 'replies', label: 'Replies' },
    { key: 'time', label: 'Date', render: (post) => new Date(post.raw_time).toLocaleDateString() },
    { key: 'updated_at', label: 'Last Updated', render: (post) => post.updated_at ? new Date(post.updated_at).toLocaleString('en-US', { month: 'numeric', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' }).replace(',', '') : '—' },
    { key: 'actions', label: 'Actions', render: (post) => (
      <div style={{ display: 'flex', gap: '8px' }}>
        <button 
          className={styles.btnSecondary} 
          style={{ padding: '4px 8px', fontSize: '13px' }}
          onClick={() => handleEdit(post)}
        >
          Edit
        </button>
        <button 
          className={styles.btnDanger} 
          style={{ padding: '4px 8px', fontSize: '13px' }}
          onClick={() => handleDelete(post.id)}
        >
          Delete
        </button>
      </div>
    )}
  ];

  return (
    <section className={dashboardStyles.panel} aria-labelledby="discussions-mod-title">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h2 id="discussions-mod-title" className={dashboardStyles.panelTitle} style={{ margin: 0 }}>Discussions</h2>
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          <input
            type="text"
            placeholder="Search discussions..."
            value={discussionSearch}
            onChange={(e) => setDiscussionSearch(e.target.value)}
            style={{
              padding: '8px 12px',
              borderRadius: 'var(--radius-sm, 6px)',
              border: '1px solid var(--border-strong, #cbd5e1)',
              minWidth: '250px',
              outline: 'none'
            }}
          />
          <button className={styles.btnPrimary} onClick={handleCreateNew}>
            + Create Discussion
          </button>
        </div>
      </div>

      <Table 
        columns={columns} 
        data={posts} 
        loading={loading} 
        emptyMessage="No discussions found." 
        searchQuery={discussionSearch}
      />

      {modalPost && (
        <DiscussionModal
          post={modalPost.id ? modalPost : null}
          onClose={() => setModalPost(null)}
          onSave={handleSaveModal}
          isSaving={isSaving}
        />
      )}
    </section>
  );
}
