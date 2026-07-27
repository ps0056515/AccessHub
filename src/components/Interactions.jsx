import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from 'context/AuthContext';
import { useAriaLive } from 'context/AriaLiveContext';
import { useToast } from 'context/ToastContext';
import { ThumbsUp, ThumbsDown, Edit2, Trash2 } from 'lucide-react';
import { COLOR_MAP } from 'data';
import styles from './Interactions.module.css';

export default function Interactions({
  id,
  type, // 'article' or 'blogpost'
  api,  // articlesApi or blogpostsApi
  initialVotes = 0,
  initialUserVote = 0
}) {
  const { user } = useAuth();
  const { announce } = useAriaLive();
  const { addToast } = useToast();
  const location = useLocation();

  const [votes, setVotes] = useState(initialVotes);
  const [userVote, setUserVote] = useState(initialUserVote);
  const [voting, setVoting] = useState(false);

  const [comments, setComments] = useState([]);
  const [loadingComments, setLoadingComments] = useState(true);
  
  const [newComment, setNewComment] = useState("");
  const [submittingComment, setSubmittingComment] = useState(false);
  const [commentError, setCommentError] = useState("");

  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editCommentBody, setEditCommentBody] = useState("");
  const [savingComment, setSavingComment] = useState(false);
  const [deletingCommentId, setDeletingCommentId] = useState(null);

  useEffect(() => {
    // Sync initial votes if they change from parent (e.g. after re-fetch)
    setVotes(initialVotes);
    setUserVote(initialUserVote);
  }, [initialVotes, initialUserVote]);

  useEffect(() => {
    // Fetch comments
    let isMounted = true;
    api.getComments(id)
      .then(res => {
        if (isMounted) {
          setComments(res.comments || []);
          setLoadingComments(false);
        }
      })
      .catch(err => {
        if (isMounted) {
          console.error("Failed to fetch comments", err);
          setLoadingComments(false);
        }
      });
    return () => { isMounted = false; };
  }, [id, api]);

  const handleVote = async (direction) => {
    if (!user) {
      addToast("Please log in to vote.", "error");
      return;
    }
    
    // Optimistic UI update
    const previousVotes = votes;
    const previousUserVote = userVote;
    
    let newVotes = votes;
    let newUserVote = direction;

    if (userVote === direction) {
      // Toggle off
      newUserVote = 0;
      newVotes -= direction;
    } else {
      // Change vote or new vote
      newVotes += direction;
      if (userVote !== 0) {
        // If changing from 1 to -1, or -1 to 1, we must adjust by 2 essentially
        // E.g., userVote was 1 (total included +1). Now userVote is -1. 
        // We remove the +1 and add the -1 -> total change is -2.
        // Wait, the newVotes logic above is `newVotes += direction`.
        // If userVote was 1, and direction is -1: `previousVotes - 1 (remove old) - 1 (add new)`
        newVotes = previousVotes - userVote + direction;
      }
    }

    setVotes(newVotes);
    setUserVote(newUserVote);
    announce(newUserVote === 1 ? "Upvoted" : newUserVote === -1 ? "Downvoted" : "Vote removed");

    setVoting(true);
    try {
      const res = await api.vote(id, direction);
      // Ensure sync with server truth
      setVotes(res.votes);
      setUserVote(res.userVote);
    } catch (err) {
      // Revert optimistic
      setVotes(previousVotes);
      setUserVote(previousUserVote);
      addToast(err.message || "Failed to submit vote.", "error");
    } finally {
      setVoting(false);
    }
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    
    setSubmittingComment(true);
    setCommentError("");
    try {
      const res = await api.addComment(id, newComment);
      setComments([res.comment, ...comments]);
      setNewComment("");
      announce("Comment posted successfully");
    } catch (err) {
      setCommentError(err.message || "Failed to post comment.");
      announce("Failed to post comment");
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleEditComment = async (commentId) => {
    if (!editCommentBody.trim()) return;
    setSavingComment(true);
    try {
      await api.updateComment(id, commentId, editCommentBody);
      setComments(comments.map(c => c.id === commentId ? { ...c, body: editCommentBody.trim() } : c));
      setEditingCommentId(null);
      announce("Comment updated successfully");
    } catch (err) {
      addToast(err.message || "Failed to update comment.", "error");
    } finally {
      setSavingComment(false);
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!window.confirm("Are you sure you want to delete this comment?")) return;
    setDeletingCommentId(commentId);
    try {
      await api.deleteComment(id, commentId);
      setComments(comments.filter(c => c.id !== commentId));
      announce("Comment deleted successfully");
    } catch (err) {
      addToast(err.message || "Failed to delete comment.", "error");
    } finally {
      setDeletingCommentId(null);
    }
  };

  const countClass = votes > 0 ? styles.positive : votes < 0 ? styles.negative : "";

  return (
    <section className={styles.container} aria-labelledby="interactions-heading">
      <div className={styles.header}>
        <h2 id="interactions-heading" className={styles.title}>Community Feedback</h2>
        
        <div 
          className={styles.voteGroup} 
          role="group" 
          aria-label="Vote on this content"
        >
          <button
            type="button"
            onClick={() => handleVote(1)}
            disabled={voting}
            className={`${styles.voteBtn} ${styles.upvote}`}
            aria-pressed={userVote === 1}
            aria-label="Upvote"
          >
            <ThumbsUp aria-hidden="true" size={18} />
          </button>
          
          <span 
            className={`${styles.voteCount} ${countClass}`} 
            aria-live="polite" 
            aria-atomic="true"
          >
            {votes}
            <span className="sr-only"> total votes</span>
          </span>
          
          <button
            type="button"
            onClick={() => handleVote(-1)}
            disabled={voting}
            className={`${styles.voteBtn} ${styles.downvote}`}
            aria-pressed={userVote === -1}
            aria-label="Downvote"
          >
            <ThumbsDown aria-hidden="true" size={18} />
          </button>
        </div>
      </div>

      <div className={styles.commentsSection}>
        {/* Comment List */}
        <div className={styles.commentList} aria-live="polite">
          {loadingComments ? (
            <p className={styles.emptyState}>Loading comments...</p>
          ) : comments.length === 0 ? (
            <p className={styles.emptyState}>No comments yet. Be the first to share your thoughts!</p>
          ) : (
            comments.map(comment => {
              const authorColor = comment.author_color || 'blue';
              const isAuthorOrAdmin = user?.id === comment.user_id || user?.is_admin;
              const isEditing = editingCommentId === comment.id;

              return (
                <article key={comment.id} className={styles.commentCard}>
                  <header className={styles.commentHeader}>
                    <div className={styles.authorInfo}>
                      <div 
                        className={styles.avatar} 
                        style={{ background: `var(--${authorColor}-bg, var(--surface-secondary))`, color: `var(--${authorColor}-text, var(--text-primary))` }}
                        aria-hidden="true"
                      >
                        {comment.author_initials}
                      </div>
                      <h3 className={styles.authorName}>{comment.author_name}</h3>
                    </div>
                    {isAuthorOrAdmin && !isEditing && (
                      <div className={styles.commentActions}>
                        <button 
                          className={styles.actionBtn} 
                          onClick={() => {
                            setEditingCommentId(comment.id);
                            setEditCommentBody(comment.body);
                          }}
                          aria-label={`Edit comment by ${comment.author_name}`}
                          title="Edit"
                        >
                          <Edit2 aria-hidden="true" size={16} />
                        </button>
                        <button 
                          className={`${styles.actionBtn} ${styles.actionBtnDelete}`} 
                          onClick={() => handleDeleteComment(comment.id)}
                          disabled={deletingCommentId === comment.id}
                          aria-label={`Delete comment by ${comment.author_name}`}
                          title="Delete"
                        >
                          <Trash2 aria-hidden="true" size={16} />
                        </button>
                      </div>
                    )}
                  </header>
                  
                  {isEditing ? (
                    <div className={styles.editCommentBox}>
                      <label htmlFor={`edit-comment-${comment.id}`} className="sr-only">Edit comment</label>
                      <textarea
                        id={`edit-comment-${comment.id}`}
                        className={styles.textarea}
                        value={editCommentBody}
                        onChange={(e) => setEditCommentBody(e.target.value)}
                        disabled={savingComment}
                        autoFocus
                        required
                        aria-required="true"
                      />
                      <div className={styles.editActions}>
                        <button 
                          className={styles.cancelBtn} 
                          onClick={() => setEditingCommentId(null)}
                          disabled={savingComment}
                        >
                          Cancel
                        </button>
                        <button 
                          className={styles.submitBtn} 
                          onClick={() => handleEditComment(comment.id)}
                          disabled={savingComment || !editCommentBody.trim()}
                        >
                          {savingComment ? "Saving..." : "Save"}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <p className={styles.commentBody}>{comment.body}</p>
                  )}
                </article>
              );
            })
          )}
        </div>

        {/* Comment Form */}
        {user ? (
          <form className={styles.addCommentBox} onSubmit={handleCommentSubmit} noValidate>
            <h3 className={styles.commentTitle}>Add a Comment</h3>
            {commentError && (
              <div className={styles.errorMsg} role="alert">
                {commentError}
              </div>
            )}
            <label htmlFor="new-comment" className="sr-only">Comment body</label>
            <textarea
              id="new-comment"
              className={styles.textarea}
              placeholder="What are your thoughts?"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              required
              aria-required="true"
            />
            <div className={styles.actions}>
              <button 
                type="submit" 
                className={styles.submitBtn}
                disabled={submittingComment || !newComment.trim()}
              >
                {submittingComment ? "Posting..." : "Post Comment"}
              </button>
            </div>
          </form>
        ) : (
          <div className={styles.loginPrompt}>
            <p>You must be logged in to leave a comment.</p>
            <Link to="/sign-in" state={{ from: location }} className={styles.loginBtn}>
              Log In
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}


