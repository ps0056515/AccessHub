import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { initialsFromName } from '../lib/userDisplay';
import {
  getCommentsForPost,
  TAG_COLORS,
  COLOR_MAP,
} from '../data';
import styles from './ThreadPage.module.css';
import { SITE_NAME } from '../brand';

const EXTRA_COMMENTS_KEY = 'aa-user-thread-comments';

function readExtraComments() {
  try {
    const raw = sessionStorage.getItem(EXTRA_COMMENTS_KEY);
    if (!raw) return {};
    const o = JSON.parse(raw);
    return typeof o === 'object' && o !== null ? o : {};
  } catch {
    return {};
  }
}

function writeExtraComments(byPost) {
  sessionStorage.setItem(EXTRA_COMMENTS_KEY, JSON.stringify(byPost));
}

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

export default function ThreadPage({ posts, setPosts, returnToCommunity }) {
  const { postId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const id = useMemo(() => {
    const n = Number(postId);
    return Number.isFinite(n) ? n : null;
  }, [postId]);

  const post = useMemo(
    () => (id == null ? null : posts.find(p => p.id === id)),
    [posts, id]
  );

  const [votes, setVotes] = useState(post?.votes ?? 0);
  const [voted, setVoted] = useState(null);
  const [extraByPost, setExtraByPost] = useState(readExtraComments);

  const [commentBody, setCommentBody] = useState('');

  useEffect(() => {
    setVotes(post?.votes ?? 0);
    setVoted(null);
  }, [post?.id, post?.votes]);

  useEffect(() => {
    if (!post) return;
    document.title = `${post.title} · ${SITE_NAME}`;
    return () => {
      document.title = `${SITE_NAME} — accessibility community`;
    };
  }, [post]);

  const baseComments = useMemo(() => (id == null ? [] : getCommentsForPost(id)), [id]);

  const mergedComments = useMemo(() => {
    if (id == null) return [];
    const extra = extraByPost[id] || [];
    return [...baseComments, ...extra];
  }, [id, baseComments, extraByPost]);

  const addComment = e => {
    e.preventDefault();
    const text = commentBody.trim();
    if (!text || id == null) return;

    const authorName = user?.displayName || user?.email || 'You';
    const entry = {
      id: `u-${Date.now()}`,
      author: authorName,
      initials: initialsFromName(authorName),
      color: 'blue',
      time: 'Just now',
      body: text,
    };

    setExtraByPost(prev => {
      const next = { ...prev, [id]: [...(prev[id] || []), entry] };
      writeExtraComments(next);
      return next;
    });

    setPosts(prev =>
      prev.map(p =>
        p.id === id ? { ...p, replies: (p.replies || 0) + 1 } : p
      )
    );

    setCommentBody('');
  };

  if (id == null || !post) {
    return (
      <div className={styles.page}>
        <p className={styles.notFound}>Discussion not found.</p>
        <button type="button" className={styles.backLink} onClick={returnToCommunity}>
          ← Back to community
        </button>
      </div>
    );
  }

  const vote = dir => {
    if (voted === dir) {
      setVotes(post.votes);
      setVoted(null);
    } else {
      setVotes(post.votes + (dir === 'up' ? 1 : -1));
      setVoted(dir);
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
            >
              ▲
            </button>
            <span className={styles.voteCount}>{votes}</span>
            <button
              type="button"
              className={`${styles.voteBtn} ${voted === 'down' ? styles.votedDown : ''}`}
              onClick={() => vote('down')}
              aria-label="Downvote"
            >
              ▼
            </button>
          </div>
          <Avatar initials={post.initials} color={post.color} size={44} />
          <div className={styles.rootBody}>
            <p className={styles.meta}>
              <span className={styles.author}>{post.author}</span>
              <span className={styles.dot}>·</span>
              <span>{post.time}</span>
              <span className={styles.dot}>·</span>
              <span>{post.replies} replies</span>
            </p>
            <h1 className={styles.title}>{post.title}</h1>
            <div className={styles.tags}>
              {post.tags.map(t => (
                <Tag key={t} label={t} />
              ))}
            </div>
            <div className={styles.prose}>
              {post.body || post.excerpt}
            </div>
          </div>
        </div>
      </article>

      <section className={styles.replies} aria-labelledby="replies-heading">
        <h2 id="replies-heading" className={styles.repliesTitle}>
          Replies ({mergedComments.length})
        </h2>
        <ol className={styles.replyList}>
          {mergedComments.map(c => (
            <li key={c.id} className={styles.reply}>
              <Avatar initials={c.initials} color={c.color} size={36} />
              <div className={styles.replyBody}>
                <p className={styles.replyMeta}>
                  <span className={styles.author}>{c.author}</span>
                  <span className={styles.dot}>·</span>
                  <span>{c.time}</span>
                </p>
                <p className={styles.replyText}>{c.body}</p>
              </div>
            </li>
          ))}
        </ol>
        {mergedComments.length === 0 ? (
          <p className={styles.noReplies}>No replies yet — be the first.</p>
        ) : null}
      </section>

      <section className={styles.compose} aria-labelledby="reply-label">
        <h2 id="reply-label" className={styles.composeTitle}>
          Add a reply
        </h2>
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
          />
          <button type="submit" className={styles.submit} disabled={!commentBody.trim()}>
            Post reply
          </button>
        </form>
      </section>
    </div>
  );
}
