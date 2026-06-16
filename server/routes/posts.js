const express = require('express');
const { query } = require('../db');
const { authMiddleware, adminMiddleware, optionalAuthMiddleware } = require('../auth');
const { formatPost, formatComment, authorFromUser } = require('../posts');

const router = express.Router();

const POST_SELECT = `
  SELECT p.*,
    u.country,
    (SELECT COUNT(*)::int FROM comments c WHERE c.post_id = p.id) AS reply_count
  FROM posts p
  LEFT JOIN users u ON p.user_id = u.id
`;

router.get('/', optionalAuthMiddleware, async (req, res, next) => {
  try {
    let queryStr = `${POST_SELECT} ORDER BY p.created_at DESC`;
    let params = [];
    
    if (req.userId) {
      queryStr = `
        SELECT p.*,
          u.country,
          (SELECT COUNT(*)::int FROM comments c WHERE c.post_id = p.id) AS reply_count,
          (SELECT direction FROM post_votes pv WHERE pv.post_id = p.id AND pv.voter_key = $1 LIMIT 1) AS user_vote_direction
        FROM posts p
        LEFT JOIN users u ON p.user_id = u.id
        ORDER BY p.created_at DESC
      `;
      params.push(req.userId.toString());
    }
    
    const { rows } = await query(queryStr, params);
    res.json({ posts: rows.map(row => formatPost(row)) });
  } catch (err) {
    next(err);
  }
});

router.get('/top-contributors', async (_req, res, next) => {
  try {
    const { rows } = await query(`
      SELECT 
        u.id AS user_id, 
        u.display_name,
        u.country,
        (SELECT COUNT(*) FROM posts p WHERE p.user_id = u.id) + 
        (SELECT COUNT(*) FROM comments c WHERE c.user_id = u.id) AS total_contributions
      FROM users u
      WHERE 
        (SELECT COUNT(*) FROM posts p WHERE p.user_id = u.id) + 
        (SELECT COUNT(*) FROM comments c WHERE c.user_id = u.id) > 0
      ORDER BY total_contributions DESC
      LIMIT 5
    `);

    const contributors = rows.map((row, index) => {
      const author = authorFromUser({ display_name: row.display_name, country: row.country });
      return {
        id: row.user_id,
        initials: author.author_initials,
        name: author.author_name,
        role: author.author_role,
        color: author.author_color,
        hot: index === 0, // Top 1 is hot
        contributions: parseInt(row.total_contributions, 10)
      };
    });

    res.json({ contributors });
  } catch (err) {
    next(err);
  }
});

router.get('/admin', authMiddleware, adminMiddleware, async (_req, res, next) => {
  try {
    const { rows } = await query(`${POST_SELECT} ORDER BY p.created_at DESC`);
    res.json({ posts: rows.map(row => formatPost(row)) });
  } catch (err) {
    next(err);
  }
});

router.post('/admin', authMiddleware, adminMiddleware, async (req, res, next) => {
  const { title, body, tags, votes, created_at } = req.body || {};
  const trimmedTitle = title?.trim();
  const trimmedBody = body?.trim();
  const parsedVotes = Math.max(0, parseInt(votes, 10) || 0);
  const parsedDate = created_at ? new Date(created_at).toISOString() : new Date().toISOString();

  if (!trimmedTitle || trimmedTitle.length < 5) {
    return res.status(400).json({ error: 'Title must be at least 5 characters.' });
  }
  if (!trimmedBody || trimmedBody.length < 10) {
    return res.status(400).json({ error: 'Please add more detail to your question.' });
  }

  try {
    const { rows: users } = await query('SELECT id, display_name FROM users WHERE id = $1', [req.userId]);
    const user = users[0];

    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    const author = authorFromUser(user);
    const tagList = Array.isArray(tags) ? tags.filter(Boolean) : ['WCAG 2.2'];
    const excerpt = trimmedBody.length > 160 ? `${trimmedBody.slice(0, 157).trim()}…` : trimmedBody;

    const inserted = await query(
      `INSERT INTO posts (
        user_id, title, excerpt, body, author_name, author_initials, author_color,
        author_role, votes, tags, created_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
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
        parsedVotes,
        JSON.stringify(tagList),
        parsedDate
      ]
    );

    const { rows } = await query(`${POST_SELECT} WHERE p.id = $1`, [inserted.rows[0].id]);
    res.status(201).json({ post: formatPost(rows[0]) });
  } catch (err) {
    next(err);
  }
});

router.put('/admin/:id', authMiddleware, adminMiddleware, async (req, res, next) => {
  const id = Number(req.params.id);
  const { title, body, tags, votes, created_at } = req.body || {};
  const trimmedTitle = title?.trim();
  const trimmedBody = body?.trim() || "";
  const parsedVotes = Math.max(0, parseInt(votes, 10) || 0);
  const parsedDate = created_at ? new Date(created_at).toISOString() : undefined;

  if (!Number.isFinite(id)) {
    return res.status(400).json({ error: 'Invalid post id.' });
  }
  if (!trimmedTitle || trimmedTitle.length < 5) {
    return res.status(400).json({ error: 'Title must be at least 5 characters.' });
  }
  if (!trimmedBody || trimmedBody.length < 10) {
    return res.status(400).json({ error: 'Please add more detail to your question.' });
  }

  const tagList = Array.isArray(tags) ? tags.filter(Boolean) : ['WCAG 2.2'];
  const excerpt = trimmedBody.length > 160 ? `${trimmedBody.slice(0, 157).trim()}…` : trimmedBody;

  try {
    const updateFields = [trimmedTitle, trimmedBody, excerpt, JSON.stringify(tagList), parsedVotes];
    let queryStr = `UPDATE posts SET title = $1, body = $2, excerpt = $3, tags = $4, votes = $5, updated_at = CURRENT_TIMESTAMP`;
    if (parsedDate) {
      queryStr += `, created_at = $6 WHERE id = $7`;
      updateFields.push(parsedDate, id);
    } else {
      queryStr += ` WHERE id = $6`;
      updateFields.push(id);
    }

    const { rowCount } = await query(queryStr, updateFields);

    if (rowCount === 0) {
      return res.status(404).json({ error: 'Discussion not found.' });
    }

    const { rows } = await query(`${POST_SELECT} WHERE p.id = $1`, [id]);
    res.json({ post: formatPost(rows[0]) });
  } catch (err) {
    next(err);
  }
});

router.delete('/admin/:id', authMiddleware, adminMiddleware, async (req, res, next) => {
  const id = Number(req.params.id);
  if (!Number.isFinite(id)) {
    return res.status(400).json({ error: 'Invalid post id.' });
  }

  try {
    const { rowCount } = await query(`DELETE FROM posts WHERE id = $1`, [id]);
    if (rowCount === 0) {
      return res.status(404).json({ error: 'Discussion not found.' });
    }
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

router.put('/admin/:postId/comments/:commentId', authMiddleware, adminMiddleware, async (req, res, next) => {
  const commentId = Number(req.params.commentId);
  const { body, created_at } = req.body || {};
  const trimmedBody = body?.trim();
  const parsedDate = created_at ? new Date(created_at).toISOString() : undefined;

  if (!Number.isFinite(commentId) || !trimmedBody) {
    return res.status(400).json({ error: 'Invalid comment data.' });
  }

  try {
    let rowCount;
    if (parsedDate) {
      const result = await query(
        'UPDATE comments SET body = $1, created_at = $2, updated_at = CURRENT_TIMESTAMP WHERE id = $3',
        [trimmedBody, parsedDate, commentId]
      );
      rowCount = result.rowCount;
    } else {
      const result = await query(
        'UPDATE comments SET body = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
        [trimmedBody, commentId]
      );
      rowCount = result.rowCount;
    }
    if (rowCount === 0) {
      return res.status(404).json({ error: 'Comment not found.' });
    }
    const { rows } = await query('SELECT * FROM comments WHERE id = $1', [commentId]);
    res.json({ comment: formatComment(rows[0]) });
  } catch (err) {
    next(err);
  }
});

router.delete('/admin/:postId/comments/:commentId', authMiddleware, adminMiddleware, async (req, res, next) => {
  const commentId = Number(req.params.commentId);
  if (!Number.isFinite(commentId)) {
    return res.status(400).json({ error: 'Invalid comment id.' });
  }
  try {
    const { rowCount } = await query('DELETE FROM comments WHERE id = $1', [commentId]);
    if (rowCount === 0) {
      return res.status(404).json({ error: 'Comment not found.' });
    }
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

router.get('/:id', optionalAuthMiddleware, async (req, res, next) => {
  const id = Number(req.params.id);
  if (!Number.isFinite(id)) {
    res.status(400).json({ error: 'Invalid post id.' });
    return;
  }

  try {
    let queryStr = `${POST_SELECT} WHERE p.id = $1`;
    let params = [id];

    if (req.userId) {
      queryStr = `
        SELECT p.*,
          u.country,
          (SELECT COUNT(*)::int FROM comments c WHERE c.post_id = p.id) AS reply_count,
          (SELECT direction FROM post_votes pv WHERE pv.post_id = p.id AND pv.voter_key = $2 LIMIT 1) AS user_vote_direction
        FROM posts p
        LEFT JOIN users u ON p.user_id = u.id
        WHERE p.id = $1
      `;
      params.push(req.userId.toString());
    }

    const { rows } = await query(queryStr, params);
    const row = rows[0];
    if (!row) {
      res.status(404).json({ error: 'Discussion not found.' });
      return;
    }

    const { rows: comments } = await query(
      `SELECT c.*, u.country 
       FROM comments c 
       LEFT JOIN users u ON c.user_id = u.id 
       WHERE c.post_id = $1 
       ORDER BY c.created_at ASC`,
      [id],
    );

    res.json({ post: formatPost(row), comments: comments.map(formatComment) });
  } catch (err) {
    next(err);
  }
});

router.put('/:id', authMiddleware, async (req, res, next) => {
  const id = Number(req.params.id);
  const { title, body, tags } = req.body || {};
  const trimmedTitle = title?.trim();
  const trimmedBody = body?.trim();

  if (!Number.isFinite(id)) {
    return res.status(400).json({ error: 'Invalid post id.' });
  }
  if (!trimmedTitle || trimmedTitle.length < 5) {
    return res.status(400).json({ error: 'Title must be at least 5 characters.' });
  }
  if (!trimmedBody || trimmedBody.length < 10) {
    return res.status(400).json({ error: 'Please add more detail to your question.' });
  }

  const tagList = Array.isArray(tags) ? tags.filter(Boolean) : ['WCAG 2.2'];
  const excerpt = trimmedBody.length > 160 ? `${trimmedBody.slice(0, 157).trim()}…` : trimmedBody;

  try {
    const { rows } = await query('SELECT user_id FROM posts WHERE id = $1', [id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Discussion not found.' });
    }
    if (rows[0].user_id !== req.userId) {
      return res.status(403).json({ error: 'You do not have permission to edit this discussion.' });
    }

    await query(
      `UPDATE posts SET title = $1, body = $2, excerpt = $3, tags = $4, updated_at = CURRENT_TIMESTAMP WHERE id = $5`,
      [trimmedTitle, trimmedBody, excerpt, JSON.stringify(tagList), id]
    );

    const updated = await query(`${POST_SELECT} WHERE p.id = $1`, [id]);
    res.json({ post: formatPost(updated.rows[0]) });
  } catch (err) {
    next(err);
  }
});

router.delete('/:id', authMiddleware, async (req, res, next) => {
  const id = Number(req.params.id);
  if (!Number.isFinite(id)) {
    return res.status(400).json({ error: 'Invalid post id.' });
  }

  try {
    const { rows } = await query('SELECT user_id FROM posts WHERE id = $1', [id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Discussion not found.' });
    }
    if (rows[0].user_id !== req.userId) {
      return res.status(403).json({ error: 'You do not have permission to delete this discussion.' });
    }

    await query('DELETE FROM posts WHERE id = $1', [id]);
    res.json({ ok: true });
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
    const excerpt = trimmedBody
      ? trimmedBody.length > 160
        ? `${trimmedBody.slice(0, 157).trim()}…`
        : trimmedBody
      : "";

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

router.post('/:id/vote', authMiddleware, async (req, res, next) => {
  const id = Number(req.params.id);
  const { direction } = req.body || {};

  if (!Number.isFinite(id)) {
    res.status(400).json({ error: 'Invalid post id.' });
    return;
  }
  if (direction !== 'up' && direction !== 'down') {
    res.status(400).json({ error: 'Direction must be "up" or "down".' });
    return;
  }

  const voteValue = direction === 'up' ? 1 : -1;
  const key = req.userId.toString();

  try {
    const { rows: posts } = await query('SELECT id, votes FROM posts WHERE id = $1', [id]);
    if (posts.length === 0) {
      res.status(404).json({ error: 'Discussion not found.' });
      return;
    }

    const { rows: existing } = await query(
      'SELECT direction FROM post_votes WHERE post_id = $1 AND voter_key = $2',
      [id, key],
    );

    let userVote = null;
    let delta = 0;

    if (existing.length > 0) {
      const current = existing[0].direction;
      if (current === voteValue) {
        await query('DELETE FROM post_votes WHERE post_id = $1 AND voter_key = $2', [id, key]);
        delta = -voteValue;
      } else {
        await query(
          'UPDATE post_votes SET direction = $1 WHERE post_id = $2 AND voter_key = $3',
          [voteValue, id, key],
        );
        delta = voteValue === 1 ? 2 : -2; // Switching from -1 to 1 is +2, switching from 1 to -1 is -2.
        userVote = direction;
      }
    } else {
      await query(
        'INSERT INTO post_votes (post_id, voter_key, direction) VALUES ($1, $2, $3)',
        [id, key, voteValue],
      );
      delta = voteValue;
      userVote = direction;
    }

    const { rows: totals } = await query(
      'UPDATE posts SET votes = votes + $1 WHERE id = $2 RETURNING votes',
      [delta, id],
    );

    res.json({ votes: totals[0].votes, userVote });
  } catch (err) {
    next(err);
  }
});

router.post('/:id/view', authMiddleware, async (req, res, next) => {
  const id = Number(req.params.id);
  if (!Number.isFinite(id)) {
    return res.status(400).json({ error: 'Invalid post id.' });
  }

  try {
    const { rows: posts } = await query('SELECT id FROM posts WHERE id = $1', [id]);
    if (posts.length === 0) {
      return res.status(404).json({ error: 'Discussion not found.' });
    }

    await query(
      `INSERT INTO user_recently_viewed (user_id, post_id, viewed_at)
       VALUES ($1, $2, NOW())
       ON CONFLICT (user_id, post_id) DO UPDATE SET viewed_at = NOW()`,
      [req.userId, id]
    );

    await query(
      `DELETE FROM user_recently_viewed
       WHERE user_id = $1
       AND post_id NOT IN (
         SELECT post_id FROM user_recently_viewed
         WHERE user_id = $1
         ORDER BY viewed_at DESC
         LIMIT 10
       )`,
      [req.userId]
    );

    res.json({ ok: true });
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
