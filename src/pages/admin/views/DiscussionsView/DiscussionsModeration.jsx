import { useState, useEffect } from 'react';
import { postsApi } from 'api/client';
import dashboardStyles from '../../AdminDashboard.module.css';
import DiscussionModal from './DiscussionModal';
import Table from 'components/common/Table/Table';
import styles from './DiscussionsView.module.css';

export default function DiscussionsModeration({ showToast }) {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalPost, setModalPost] = useState(null); // null = closed, {} = new, {id...} = edit
  const [isSaving, setIsSaving] = useState(false);

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
        // Create (we'll just use the public create endpoint for admins too, it expects title, body, tags)
        const res = await postsApi.create(data);
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

  const columns = [
    { key: 'title', label: 'Title', render: (post) => (
      <>
        <div style={{ fontWeight: 500 }}>{post.title}</div>
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
    { key: 'time', label: 'Date' },
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
        <h2 id="discussions-mod-title" className={dashboardStyles.panelTitle}>Discussions</h2>
        <button className={styles.btnPrimary} onClick={handleCreateNew}>
          + Create Discussion
        </button>
      </div>

      <Table 
        columns={columns} 
        data={posts} 
        loading={loading} 
        emptyMessage="No discussions found." 
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
