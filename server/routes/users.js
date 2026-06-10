const express = require('express');
const { query } = require('../db');
const { authorFromUser } = require('../posts');

const router = express.Router();

router.get('/:id/profile', async (req, res, next) => {
  const id = Number(req.params.id);
  if (!Number.isFinite(id)) {
    return res.status(400).json({ error: 'Invalid user id.' });
  }

  try {
    const { rows } = await query('SELECT id, display_name FROM users WHERE id = $1', [id]);
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
        role: author.author_role,
        color: author.author_color,
        hot: isHot,
        bio: 'Community member passionate about web accessibility. Joined to learn, connect with other practitioners, and share knowledge.',
      }
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
