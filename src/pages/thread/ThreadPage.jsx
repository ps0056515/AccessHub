import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { TAG_COLORS, COLOR_MAP } from 'data';
import { postsApi } from 'api/client';
import { voteDelta } from 'utils/voteDelta';
import { useAuth } from 'context/AuthContext';
import { useConfirm } from 'context/ConfirmContext';
import { useToast } from 'context/ToastContext';
import RelativeTime from 'components/common/RelativeTime/RelativeTime';
import { CountryFlag } from 'components/common/CountryFlag/CountryFlag';
import styles from './ThreadPage.module.css';
import { SITE_NAME } from 'brand';

function Tag({ label }) {
  const c = TAG_COLORS[label] || { bg: '#f3f2ef', text: '#4a4840' };
  return (
    <span className={styles.tag} style={{ background: c.bg, color: c.text }}>
      {label}
    </span>
  );
}

function Avatar({ initials, color, size = 40 }) {
  const c = COLOR_MAP[color] || COLOR_MAP.blue;
  return (
    <div
      className={styles.avatar}
      style={{
        width: size,
        height: size,
        fontSize: size * 0.36,
        background: c.bg,
        color: c.text,
      }}
      aria-hidden="true"
    >
      {initials}
    </div>
  );
}

export default function ThreadPage({ posts, setPosts, refreshPosts, returnToCommunity }) {
  const { postId } = useParams();
  const navigate = useNavigate();
  const confirm = useConfirm();
  const { addToast } = useToast();
  const { isAuthenticated, user } = useAuth();
  const id = useMemo(() => {
    const n = Number(postId);
    return Number.isFinite(n) ? n : null;
  }, [postId]);

  const cachedPost = useMemo(
    () => (id == null ? null : posts.find(p => p.id === id)),
    [posts, id]
  );

  const [post, setPost] = useState(cachedPost);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [votes, setVotes] = useState(cachedPost?.votes ?? 0);
  const [voted, setVoted] = useState(cachedPost?.userVote || null);
  const [voting, setVoting] = useState(false);
  const [voteError, setVoteError] = useState('');
  const [commentBody, setCommentBody] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [commentError, setCommentError] = useState('');

  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editBody, setEditBody] = useState('');
  const [editTags, setEditTags] = useState([]);
  const [editError, setEditError] = useState('');
  const [savingEdit, setSavingEdit] = useState(false);

  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editingCommentBody, setEditingCommentBody] = useState('');
  const [commentSaving, setCommentSaving] = useState(false);

  useEffect(() => {
    if (id == null) {
      setLoading(false);
      return undefined;
    }

    let cancelled = false;

    async function loadThread() {
      setLoading(true);
      setLoadError('');
      try {
        const { post: data, comments: threadComments } = await postsApi.get(id);
        if (!cancelled) {
          setPost(data);
          if (isAuthenticated) {
            postsApi.markViewed(id).catch(() => {});
          }
          setComments(threadComments);
          setVotes(data.votes);
          setVoted(data.userVote || null);
          setPosts(prev => {
            const exists = prev.some(p => p.id === data.id);
            if (exists) return prev.map(p => (p.id === data.id ? data : p));
            return [data, ...prev];
          });
        }
      } catch (err) {
        if (!cancelled) setLoadError(err.message || 'Could not load discussion.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadThread();
    return () => {
      cancelled = true;
    };
  }, [id, setPosts]);

  useEffect(() => {
    if (!post) return;
    document.title = `${post.title} · ${SITE_NAME}`;
    return () => {
      document.title = `${SITE_NAME} — accessibility community`;
    };
  }, [post]);

  const isOwner = isAuthenticated && user?.id && post?.userId === user.id;

  const startEdit = () => {
    setEditTitle(post.title);
    setEditBody(post.body || post.excerpt);
    setEditTags(post.tags || []);
    setEditError('');
    setIsEditing(true);
  };

  const handleEditSave = async (e) => {
    e.preventDefault();
    setEditError('');
    setSavingEdit(true);
    try {
      const { post: updatedPost } = await postsApi.update(id, {
        title: editTitle,
        body: editBody,
        tags: editTags,
      });
      setPost(updatedPost);
      setPosts((list) => list.map((p) => (p.id === id ? updatedPost : p)));
      setIsEditing(false);
      addToast("Discussion updated successfully!", "success");
      refreshPosts?.();
    } catch (err) {
      setEditError(err.message || 'Could not save changes.');
    } finally {
      setSavingEdit(false);
    }
  };

  const handleDelete = async () => {
    if (!(await confirm('Are you sure you want to delete this discussion?'))) return;
    try {
      await postsApi.delete(id);
      setPosts((list) => list.map((p) => (p.id === id ? { ...p, _deleted: true } : p)));
      addToast("Discussion deleted.", "success");
      refreshPosts?.();
      returnToCommunity ? returnToCommunity() : navigate('/');
    } catch (err) {
      addToast(err.message || 'Could not delete discussion.', "error");
    }
  };

  const addComment = async e => {
    e.preventDefault();
    const text = commentBody.trim();
    if (!text || id == null) return;

    if (!isAuthenticated) {
      navigate('/sign-in', { state: { from: `/thread/${id}` } });
      return;
    }

    setCommentError('');
    setSubmitting(true);
    try {
      const { comment } = await postsApi.addComment(id, { body: text });
      setComments(prev => [...prev, comment]);
      setPost(prev => {
        if (!prev) return prev;
        const updated = { ...prev, replies: (prev.replies || 0) + 1 };
        setPosts(list => list.map(p => (p.id === updated.id ? updated : p)));
        return updated;
      });
      setCommentBody('');
      addToast("Reply posted successfully!", "success");
      refreshPosts?.();
    } catch (err) {
      setCommentError(err.message || 'Could not post reply.');
    } finally {
      setSubmitting(false);
    }
  };

  const startEditComment = (c) => {
    setEditingCommentId(c.id);
    setEditingCommentBody(c.body);
  };

  const handleCommentEditSave = async (e, commentId) => {
    e.preventDefault();
    if (!editingCommentBody.trim()) return;
    setCommentSaving(true);
    try {
      const { comment } = await postsApi.updateComment(id, commentId, editingCommentBody.trim());
      setComments((list) => list.map((c) => (c.id === commentId ? comment : c)));
      setEditingCommentId(null);
      addToast("Reply updated successfully!", "success");
    } catch (err) {
      addToast(err.message || 'Could not update reply.', "error");
    } finally {
      setCommentSaving(false);
    }
  };

  const handleCommentDelete = async (commentId) => {
    if (!(await confirm('Are you sure you want to delete this reply?'))) return;
    try {
      await postsApi.deleteComment(id, commentId);
      setComments((list) => list.filter((c) => c.id !== commentId));
      setPost(prev => {
        if (!prev) return prev;
        const updated = { ...prev, replies: Math.max(0, (prev.replies || 0) - 1) };
        setPosts(list => list.map(p => (p.id === updated.id ? updated : p)));
        return updated;
      });
      addToast("Reply deleted.", "success");
      refreshPosts?.();
    } catch (err) {
      addToast(err.message || 'Could not delete reply.', "error");
    }
  };

  if (loading) {
    return (
      <div className={styles.page}>
        <p className={styles.notFound}>Loading discussion…</p>
      </div>
    );
  }

  if (id == null || !post) {
    return (
      <div className={styles.page}>
        <p className={styles.notFound}>{loadError || 'Discussion not found.'}</p>
        <button type="button" className={styles.backLink} onClick={returnToCommunity}>
          ← Back to community
        </button>
      </div>
    );
  }

  const vote = async (dir) => {
    if (voting || id == null) return;

    if (!isAuthenticated) {
      navigate('/sign-in', { state: { from: `/thread/${id}` } });
      return;
    }

    const prevVotes = votes;
    const prevVoted = voted;
    const { delta, userVote: nextVoted } = voteDelta(voted, dir);

    setVoteError('');
    setVotes(prevVotes + delta);
    setVoted(nextVoted);
    setVoting(true);

    try {
      const { votes: newVotes, userVote } = await postsApi.vote(id, {
        direction: dir,
      });
      setVotes(newVotes);
      setVoted(userVote);
      setPost((prev) => (prev ? { ...prev, votes: newVotes, userVote } : prev));
      setPosts((list) => list.map((p) => (p.id === id ? { ...p, votes: newVotes, userVote } : p)));
    } catch (err) {
      setVotes(prevVotes);
      setVoted(prevVoted);
      setVoteError(err.message || 'Could not save your vote.');
    } finally {
      setVoting(false);
    }
  };

  return (
    <div className={styles.page}>
      <nav className={styles.breadcrumb} aria-label="Breadcrumb">
        <button type="button" className={styles.crumbBtn} onClick={returnToCommunity}>
          Community
        </button>
        <span className={styles.crumbSep} aria-hidden="true">
          /
        </span>
        <span className={styles.crumbCurrent}>Discussion</span>
      </nav>

      <button type="button" className={styles.back} onClick={() => navigate(-1)}>
        ← Back
      </button>

      <article className={styles.rootPost}>
        <div className={styles.rootTop}>
          <div className={styles.voteCol}>
            <button
              type="button"
              className={`${styles.voteBtn} ${voted === 'up' ? styles.votedUp : ''}`}
              onClick={() => vote('up')}
              aria-label="Upvote"
              aria-pressed={voted === 'up'}
              disabled={voting}
            >
              ▲
            </button>
            <span className={styles.voteCount} aria-live="polite" aria-atomic="true">
              {votes}
            </span>
            <button
              type="button"
              className={`${styles.voteBtn} ${voted === 'down' ? styles.votedDown : ''}`}
              onClick={() => vote('down')}
              aria-label="Downvote"
              aria-pressed={voted === 'down'}
              disabled={voting}
            >
              ▼
            </button>
            {voteError ? (
              <p className={styles.voteError} role="alert">
                {voteError}
              </p>
            ) : null}
          </div>
          <Link 
            to={`/profile/${post.userId}`} 
            aria-label={`View ${post.author}'s profile`}
            style={{ textDecoration: 'none', display: 'flex' }}
          >
            <Avatar initials={post.initials} color={post.color} size={44} />
          </Link>
          <div className={styles.rootBody}>
            <p className={styles.meta}>
              <Link 
                to={`/profile/${post.userId}`} 
                className={styles.author} 
                style={{ textDecoration: 'none', color: 'inherit' }}
              >
                {post.author}
                <CountryFlag countryName={post.country} />
              </Link>
              <span className={styles.dot}>·</span>
              <RelativeTime rawTime={post.raw_time} fallback={post.time} />
              <span className={styles.dot}>·</span>
              <span>{post.replies} replies</span>
            </p>
            {isEditing ? (
              <form onSubmit={handleEditSave} className={styles.editForm}>
                {editError && <p className={styles.commentError}>{editError}</p>}
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className={styles.editInput}
                  disabled={savingEdit}
                  required
                />
                <textarea
                  value={editBody}
                  onChange={(e) => setEditBody(e.target.value)}
                  className={styles.textarea}
                  rows={6}
                  disabled={savingEdit}
                />
                <div className={styles.editActions}>
                  <button type="submit" className={styles.submit} disabled={savingEdit}>
                    {savingEdit ? 'Saving…' : 'Save'}
                  </button>
                  <button
                    type="button"
                    className={styles.cancelBtn}
                    onClick={() => setIsEditing(false)}
                    disabled={savingEdit}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <h1 className={styles.title}>{post.title}</h1>
                  {isOwner && (
                    <div className={styles.ownerActions}>
                      <button type="button" onClick={startEdit} className={styles.editBtn}>Edit</button>
                      <button type="button" onClick={handleDelete} className={styles.deleteBtn}>Delete</button>
                    </div>
                  )}
                </div>
                <div className={styles.tags}>
                  {post.tags.map(t => (
                    <Tag key={t} label={t} />
                  ))}
                </div>
                <div className={styles.prose}>
                  {post.body || post.excerpt}
                </div>
              </>
            )}
          </div>
        </div>
      </article>

      <section className={styles.replies} aria-labelledby="replies-heading">
        <h2 id="replies-heading" className={styles.repliesTitle}>
          Replies ({comments.length})
        </h2>
        <ol className={styles.replyList}>
          {comments.map(c => (
            <li key={c.id} className={styles.reply}>
              <Link 
                to={`/profile/${c.userId}`} 
                aria-label={`View ${c.author}'s profile`}
                style={{ textDecoration: 'none', display: 'flex' }}
              >
                <Avatar initials={c.initials} color={c.color} size={36} />
              </Link>
              <div className={styles.replyBody}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', width: '100%' }}>
                  <p className={styles.replyMeta}>
                    <Link 
                      to={`/profile/${c.userId}`} 
                      className={styles.author} 
                      style={{ textDecoration: 'none', color: 'inherit' }}
                    >
                      {c.author}
                      <CountryFlag countryName={c.country} />
                    </Link>
                    <span className={styles.dot}>·</span>
                    <RelativeTime rawTime={c.raw_time} fallback={c.time} />
                  </p>
                  {isAuthenticated && user?.id === c.userId && (
                    <div className={styles.ownerActions}>
                      <button type="button" onClick={() => startEditComment(c)} className={styles.editBtn}>Edit</button>
                      <button type="button" onClick={() => handleCommentDelete(c.id)} className={styles.deleteBtn}>Delete</button>
                    </div>
                  )}
                </div>
                {editingCommentId === c.id ? (
                  <form onSubmit={(e) => handleCommentEditSave(e, c.id)} className={styles.editForm}>
                    <textarea
                      value={editingCommentBody}
                      onChange={(e) => setEditingCommentBody(e.target.value)}
                      className={styles.textarea}
                      rows={3}
                      disabled={commentSaving}
                      required
                    />
                    <div className={styles.editActions}>
                      <button type="submit" className={styles.submit} disabled={commentSaving}>
                        {commentSaving ? 'Saving…' : 'Save'}
                      </button>
                      <button
                        type="button"
                        className={styles.cancelBtn}
                        onClick={() => setEditingCommentId(null)}
                        disabled={commentSaving}
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                ) : (
                  <p className={styles.replyText}>{c.body}</p>
                )}
              </div>
            </li>
          ))}
        </ol>
        {comments.length === 0 ? (
          <p className={styles.noReplies}>No replies yet — be the first.</p>
        ) : null}
      </section>

      <section className={styles.compose} aria-labelledby="reply-label">
        <h2 id="reply-label" className={styles.composeTitle}>
          Add a reply
        </h2>
        {commentError && (
          <p className={styles.commentError} role="alert">
            {commentError}
          </p>
        )}
        <form onSubmit={addComment}>
          <label htmlFor="reply-text" className="sr-only">
            Your reply
          </label>
          <textarea
            id="reply-text"
            className={styles.textarea}
            rows={4}
            value={commentBody}
            onChange={e => setCommentBody(e.target.value)}
            placeholder="Share context, examples, or questions…"
            disabled={submitting}
          />
          <button type="submit" className={styles.submit} disabled={!commentBody.trim() || submitting}>
            {submitting ? 'Posting…' : 'Post reply'}
          </button>
        </form>
      </section>
    </div>
  );
}
