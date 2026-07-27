import { useState, useEffect } from 'react';
import { postsApi } from 'api/client';
import { useConfirm } from 'context/ConfirmContext';
import { useToast } from 'context/ToastContext';
import styles from './DiscussionsView.module.css';
import dashboardStyles from '../../AdminDashboard.module.css';
import { useConfig } from 'context/ConfigContext';
import MultiSelectDropdown from 'components/common/MultiSelectDropdown/MultiSelectDropdown';
import Modal from 'components/common/Modal/Modal';

// Helper to format ISO strings or Date objects for datetime-local input (YYYY-MM-DDThh:mm)
function toDatetimeLocal(isoString) {
  if (!isoString) return '';
  try {
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return '';
    const pad = n => n.toString().padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  } catch {
    return '';
  }
}

export default function DiscussionModal({ post, onClose, onSave, isSaving }) {
  const { portalConfig } = useConfig();
  const confirm = useConfirm();
  const { addToast } = useToast();
  const [formData, setFormData] = useState({
    title: '',
    body: '',
    tags: [],
    votes: 0,
    created_at: ''
  });

  const [comments, setComments] = useState([]);
  const [loadingComments, setLoadingComments] = useState(false);
  const [newReply, setNewReply] = useState('');
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editCommentBody, setEditCommentBody] = useState('');
  const [editCommentDate, setEditCommentDate] = useState('');
  const [commentError, setCommentError] = useState('');

  useEffect(() => {
    if (post) {
      setFormData({
        title: post.title || '',
        body: post.body || '',
        tags: post.tags || [],
        votes: post.votes || 0,
        created_at: toDatetimeLocal(post.raw_time)
      });
      if (post.id) {
        fetchFullPost(post.id);
      }
    }
  }, [post]);

  const fetchFullPost = async (id) => {
    try {
      setLoadingComments(true);
      const res = await postsApi.get(id);
      if (res.comments) {
        setComments(res.comments);
      }
    } catch (err) {
      console.error('Failed to fetch comments', err);
    } finally {
      setLoadingComments(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({
      title: formData.title,
      body: formData.body,
      tags: formData.tags,
      votes: Math.max(0, parseInt(formData.votes, 10) || 0),
      created_at: formData.created_at ? new Date(formData.created_at).toISOString() : undefined
    });
  };

  const handleAddReply = async () => {
    if (!newReply.trim()) return;
    try {
      setCommentError('');
      const res = await postsApi.addComment(post.id, { body: newReply });
      setComments(prev => [...prev, res.comment]);
      setNewReply('');
    } catch (err) {
      setCommentError(err.message || 'Failed to add reply.');
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!(await confirm('Are you sure you want to delete this reply?'))) return;
    try {
      await postsApi.deleteCommentAdmin(post.id, commentId);
      setComments(prev => prev.filter(c => c.id !== commentId));
    } catch (err) {
      addToast(err.message || 'Failed to delete reply.', 'error');
    }
  };

  const handleSaveEditComment = async (commentId) => {
    if (!editCommentBody.trim()) return;

    if (editCommentDate && formData.created_at) {
      if (new Date(editCommentDate) < new Date(formData.created_at)) {
        addToast('Reply date cannot be earlier than the original post date.', 'error');
        return;
      }
    }

    try {
      const payload = { body: editCommentBody };
      if (editCommentDate) {
        payload.created_at = new Date(editCommentDate).toISOString();
      }
      const res = await postsApi.updateCommentAdmin(post.id, commentId, payload);
      setComments(prev => prev.map(c => c.id === commentId ? res.comment : c));
      setEditingCommentId(null);
      setEditCommentBody('');
      setEditCommentDate('');
    } catch (err) {
      addToast(err.message || 'Failed to update reply.', 'error');
    }
  };

  const footer = (
    <>
      <button type="button" className={styles.btnSecondary} onClick={onClose} aria-label="Cancel discussion edit">
        Cancel
      </button>
      <button type="submit" form="discussion-form" className={styles.btnPrimary} disabled={isSaving}>
        {isSaving ? 'Saving...' : 'Save Discussion'}
      </button>
    </>
  );

  return (
    <Modal
      title={post && post.id ? 'Edit Discussion' : 'Create Discussion'}
      onClose={onClose}
      footer={footer}
      width="800px"
    >
      <div style={{ overflowY: 'auto', display: 'flex', gap: '32px' }}>
        
        <form id="discussion-form" onSubmit={handleSubmit} style={{ flex: 1, display: 'flex', flexDirection: 'column',  }}>
          <div className={styles.formGroup}>
            <label htmlFor="discussion-title" className={styles.label}>Title <span className="required-asterisk" aria-hidden="true">*</span></label>
            <input
              id="discussion-title"
              type="text"
              className={styles.input}
              value={formData.title}
              onChange={e => setFormData({ ...formData, title: e.target.value })}
              required
              aria-required="true"
              minLength={5}
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Tags</label>
            <MultiSelectDropdown 
              options={portalConfig?.askTopics || []}
              value={formData.tags}
              onChange={tags => setFormData({ ...formData, tags })}
              placeholder="Select tags..."
            />
          </div>

          <div style={{ display: 'flex', gap: '16px' }}>
            <div className={styles.formGroup} style={{ flex: 1 }}>
              <label htmlFor="discussion-votes" className={styles.label}>Votes</label>
              <input
                id="discussion-votes"
                type="number"
                className={styles.input}
                value={formData.votes}
                onChange={e => setFormData({ ...formData, votes: e.target.value })}
                min="0"
              />
            </div>
            <div className={styles.formGroup} style={{ flex: 1 }}>
              <label htmlFor="discussion-date" className={styles.label}>Date</label>
              <input
                id="discussion-date"
                type="datetime-local"
                className={styles.input}
                value={formData.created_at}
                onChange={e => setFormData({ ...formData, created_at: e.target.value })}
              />
            </div>
          </div>

          <div className={styles.formGroup} style={{ flex: 1 }}>
            <label htmlFor="discussion-body" className={styles.label}>Body</label>
            <textarea
              id="discussion-body"
              className={styles.textarea}
              value={formData.body}
              onChange={e => setFormData({ ...formData, body: e.target.value })}
              style={{ minHeight: '200px', flex: 1 }}
            />
          </div>
        </form>

        {post && post.id && (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', borderLeft: '1px solid var(--border-color)', paddingLeft: '32px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '16px' }}>Replies</h3>
            
            <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '16px', paddingRight: '8px' }}>
              {loadingComments ? (
                <p style={{ color: 'var(--text-secondary)' }}>Loading replies...</p>
              ) : comments.length === 0 ? (
                <p style={{ color: 'var(--text-secondary)' }}>No replies yet.</p>
              ) : (
                comments.map(comment => (
                  <div key={comment.id} style={{ background: 'var(--surface-color-alt)', padding: '12px', borderRadius: '8px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <span style={{ fontWeight: 500, fontSize: '13px' }}>{comment.author}</span>
                      <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{comment.time}</span>
                    </div>
                    
                    {editingCommentId === comment.id ? (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <input
                          type="datetime-local"
                          className={styles.input}
                          value={editCommentDate}
                          min={formData.created_at}
                          onChange={e => setEditCommentDate(e.target.value)}
                        />
                        <textarea 
                          className={styles.textarea}
                          style={{ minHeight: '80px' }}
                          value={editCommentBody}
                          onChange={e => setEditCommentBody(e.target.value)}
                        />
                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                          <button type="button" className={styles.btnSecondary} style={{ padding: '4px 8px', fontSize: '12px' }} onClick={() => setEditingCommentId(null)} aria-label="Cancel comment edit">Cancel</button>
                          <button type="button" className={styles.btnPrimary} style={{ padding: '4px 8px', fontSize: '12px' }} onClick={() => handleSaveEditComment(comment.id)}>Save</button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <p style={{ fontSize: '14px', whiteSpace: 'pre-wrap', marginBottom: '12px' }}>{comment.body}</p>
                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                          <button 
                            type="button" 
                            className={styles.btnSecondary} 
                            style={{ padding: '4px 12px', fontSize: '12px', borderRadius: '4px' }}
                            onClick={() => { 
                              setEditingCommentId(comment.id); 
                              setEditCommentBody(comment.body);
                              setEditCommentDate(toDatetimeLocal(comment.raw_time));
                            }}
                          >
                            Edit
                          </button>
                          <button 
                            type="button" 
                            className={styles.btnDanger} 
                            style={{ padding: '4px 12px', fontSize: '12px', borderRadius: '4px' }}
                            onClick={() => handleDeleteComment(comment.id)}
                          >
                            Delete
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                ))
              )}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label htmlFor="add-reply" className="visually-hidden" style={{ display: 'none' }}>Add a reply</label>
              <textarea
                id="add-reply"
                className={styles.textarea}
                placeholder="Add a reply..."
                value={newReply}
                onChange={e => setNewReply(e.target.value)}
                style={{ minHeight: '80px' }}
                aria-label="Add a reply"
              />
              {commentError && <div style={{ color: 'var(--error-color)', fontSize: '13px' }}>{commentError}</div>}
              <button type="button" className={styles.btnPrimary} onClick={handleAddReply} disabled={!newReply.trim()}>
                Add Reply
              </button>
            </div>

          </div>
        )}

      </div>
    </Modal>
  );
}
