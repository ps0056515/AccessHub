const express = require('express');
const { query } = require('../db');
const { authMiddleware } = require('../auth');
const { formatPost, formatComment, authorFromUser } = require('../posts');

const router = express.Router();

const POST_SELECT = `
  SELECT p.*,
    (SELECT COUNT(*)::int FROM comments c WHERE c.post_id = p.id) AS reply_count
  FROM posts p
`;

router.get('/', async (_req, res, next) => {
  try {
    const { rows } = await query(`${POST_SELECT} ORDER BY p.created_at DESC`);
    res.json({ posts: rows.map(row => formatPost(row)) });
  } catch (err) {
    next(err);
  }
});

router.get('/:id', async (req, res, next) => {
  const id = Number(req.params.id);
  if (!Number.isFinite(id)) {
    res.status(400).json({ error: 'Invalid post id.' });
    return;
  }

  try {
    const { rows } = await query(`${POST_SELECT} WHERE p.id = $1`, [id]);
    const row = rows[0];
    if (!row) {
      res.status(404).json({ error: 'Discussion not found.' });
      return;
    }

    const { rows: comments } = await query(
      'SELECT * FROM comments WHERE post_id = $1 ORDER BY created_at ASC',
      [id],
    );

    res.json({ post: formatPost(row), comments: comments.map(formatComment) });
  } catch (err) {
    next(err);
  }
});

router.post('/', authMiddleware, async (req, res, next) => {
  const { title, body, tags } = req.body || {};
  const trimmedTitle = title?.trim();
  const trimmedBody = body?.trim();

  if (!trimmedTitle || trimmedTitle.length < 5) {
    res.status(400).json({ error: 'Title must be at least 5 characters.' });
    return;
  }
  if (!trimmedBody || trimmedBody.length < 10) {
    res.status(400).json({ error: 'Please add more detail to your question.' });
    return;
  }

  try {
    const { rows: users } = await query(
      'SELECT id, display_name FROM users WHERE id = $1',
      [req.userId],
    );
    const user = users[0];

    if (!user) {
      res.status(404).json({ error: 'User not found.' });
      return;
    }

    const author = authorFromUser(user);
    const tagList = Array.isArray(tags) ? tags.filter(Boolean) : ['WCAG 2.2'];
    const excerpt =
      trimmedBody.length > 160 ? `${trimmedBody.slice(0, 157).trim()}…` : trimmedBody;

    const inserted = await query(
      `INSERT INTO posts (
        user_id, title, excerpt, body, author_name, author_initials, author_color,
        author_role, votes, tags
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 0, $9)
      RETURNING id`,
      [
        user.id,
        trimmedTitle,
        excerpt,
        trimmedBody,
        author.author_name,
        author.author_initials,
        author.author_color,
        author.author_role,
        JSON.stringify(tagList),
      ],
    );

    const { rows } = await query(`${POST_SELECT} WHERE p.id = $1`, [inserted.rows[0].id]);
    res.status(201).json({ post: formatPost(rows[0]) });
  } catch (err) {
    next(err);
  }
});

router.post('/:id/comments', authMiddleware, async (req, res, next) => {
  const id = Number(req.params.id);
  const { body } = req.body || {};
  const trimmedBody = body?.trim();

  if (!Number.isFinite(id)) {
    res.status(400).json({ error: 'Invalid post id.' });
    return;
  }
  if (!trimmedBody) {
    res.status(400).json({ error: 'Reply cannot be empty.' });
    return;
  }

  try {
    const { rows: posts } = await query('SELECT id FROM posts WHERE id = $1', [id]);
    if (posts.length === 0) {
      res.status(404).json({ error: 'Discussion not found.' });
      return;
    }

    const { rows: users } = await query(
      'SELECT id, display_name FROM users WHERE id = $1',
      [req.userId],
    );
    const user = users[0];

    if (!user) {
      res.status(404).json({ error: 'User not found.' });
      return;
    }

    const author = authorFromUser(user);
    const inserted = await query(
      `INSERT INTO comments (
        post_id, user_id, author_name, author_initials, author_color, body
      ) VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *`,
      [id, user.id, author.author_name, author.author_initials, author.author_color, trimmedBody],
    );

    res.status(201).json({ comment: formatComment(inserted.rows[0]) });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
