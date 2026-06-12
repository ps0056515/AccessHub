const express = require('express');
const { query } = require('../db');
const { authorFromUser } = require('../posts');
const { authMiddleware } = require('../auth');

const router = express.Router();

router.get('/me/recently-viewed', authMiddleware, async (req, res, next) => {
  try {
    const { rows } = await query(
      `SELECT p.id, p.title, urv.viewed_at
       FROM user_recently_viewed urv
       JOIN posts p ON p.id = urv.post_id
       WHERE urv.user_id = $1
       ORDER BY urv.viewed_at DESC
       LIMIT 10`,
      [req.userId]
    );
    res.json({ recentPosts: rows.map(r => ({ id: r.id, title: r.title, viewedAt: r.viewed_at })) });
  } catch (err) {
    next(err);
  }
});

router.get('/:id/profile', async (req, res, next) => {
  const id = Number(req.params.id);
  if (!Number.isFinite(id)) {
    return res.status(400).json({ error: 'Invalid user id.' });
  }

  try {
    const { rows } = await query(
      'SELECT id, display_name, email, role, bio, avatar_url, company, designation, country, city, created_at FROM users WHERE id = $1', 
      [id]
    );
    const user = rows[0];
    
    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    const author = authorFromUser(user);
    
    // Check if they are top contributor
    const { rows: contribRows } = await query(`
      SELECT 
        u.id,
        (SELECT COUNT(*) FROM posts p WHERE p.user_id = u.id) + 
        (SELECT COUNT(*) FROM comments c WHERE c.user_id = u.id) AS total_contributions
      FROM users u
      ORDER BY total_contributions DESC
      LIMIT 5
    `);
    
    const isHot = contribRows.some(row => row.id === id);

    res.json({
      profile: {
        id: user.id,
        initials: author.author_initials,
        name: author.author_name,
        role: user.role || author.author_role,
        color: author.author_color,
        hot: isHot,
        bio: user.bio || 'Community member passionate about web accessibility. Joined to learn, connect with other practitioners, and share knowledge.',
        avatarUrl: user.avatar_url || null,
        email: user.email,
        company: user.company || null,
        designation: user.designation || null,
        country: user.country || null,
        city: user.city || null,
        createdAt: user.created_at,
      }
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
