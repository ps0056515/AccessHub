const express = require('express');
const { query } = require('../db');
const { authMiddleware, adminMiddleware, adminUser } = require('../auth');

const router = express.Router();

const USER_SELECT =
  'SELECT id, email, display_name, google_id, country, city, is_admin, is_blocked, created_at FROM users';

router.use(authMiddleware, adminMiddleware);

router.get('/stats', async (_req, res, next) => {
  try {
    const totalUsers = (await query('SELECT COUNT(*)::int AS n FROM users')).rows[0].n;
    const googleUsers = (
      await query('SELECT COUNT(*)::int AS n FROM users WHERE google_id IS NOT NULL')
    ).rows[0].n;
    const emailUsers = totalUsers - googleUsers;
    const recentSignups = (
      await query(
        `SELECT COUNT(*)::int AS n FROM users WHERE created_at >= NOW() - INTERVAL '7 days'`,
      )
    ).rows[0].n;
    const withLocation = (
      await query(
        'SELECT COUNT(*)::int AS n FROM users WHERE country IS NOT NULL AND city IS NOT NULL',
      )
    ).rows[0].n;

    const byCountry = (
      await query(
        `SELECT COALESCE(country, 'Not set') AS country, COUNT(*)::int AS count
         FROM users GROUP BY country ORDER BY count DESC, country ASC`,
      )
    ).rows;

    const byCity = (
      await query(
        `SELECT COALESCE(city, 'Not set') AS city,
                COALESCE(country, 'Not set') AS country,
                COUNT(*)::int AS count
         FROM users GROUP BY city, country ORDER BY count DESC, city ASC`,
      )
    ).rows;

    res.json({
      totalUsers,
      googleUsers,
      emailUsers,
      recentSignups,
      withLocation,
      countriesCount: byCountry.filter((r) => r.country !== 'Not set').length,
      byCountry,
      byCity,
    });
  } catch (err) {
    next(err);
  }
});

router.get('/users', async (_req, res, next) => {
  try {
    const { rows } = await query(`${USER_SELECT} ORDER BY created_at DESC`);
    res.json({ users: rows.map(adminUser) });
  } catch (err) {
    next(err);
  }
});

router.patch('/users/:id/role', async (req, res, next) => {
  const { is_admin } = req.body;
  if (typeof is_admin !== 'boolean') {
    return res.status(400).json({ error: 'is_admin must be a boolean.' });
  }

  try {
    // Prevent self-revocation to avoid locking out the last admin accidentally
    if (!is_admin && parseInt(req.params.id, 10) === req.adminUser.id) {
      return res.status(400).json({ error: 'You cannot revoke your own admin access.' });
    }

    const { rows } = await query(
      `UPDATE users SET is_admin = $1 WHERE id = $2 RETURNING *`,
      [is_admin, req.params.id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: 'User not found.' });
    }

    res.json({ user: adminUser(rows[0]) });
  } catch (err) {
    next(err);
  }
});

router.patch('/users/:id/block', async (req, res, next) => {
  const { is_blocked } = req.body;
  if (typeof is_blocked !== 'boolean') {
    return res.status(400).json({ error: 'is_blocked must be a boolean.' });
  }

  try {
    if (is_blocked && parseInt(req.params.id, 10) === req.adminUser.id) {
      return res.status(400).json({ error: 'You cannot block your own account.' });
    }

    const { rows } = await query(
      `UPDATE users SET is_blocked = $1 WHERE id = $2 RETURNING *`,
      [is_blocked, req.params.id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: 'User not found.' });
    }

    res.json({ user: adminUser(rows[0]) });
  } catch (err) {
    next(err);
  }
});

router.delete('/users/:id', async (req, res, next) => {
  try {
    if (parseInt(req.params.id, 10) === req.adminUser.id) {
      return res.status(400).json({ error: 'You cannot delete your own account from the dashboard.' });
    }

    const { rowCount } = await query('DELETE FROM users WHERE id = $1', [req.params.id]);
    
    if (rowCount === 0) {
      return res.status(404).json({ error: 'User not found.' });
    }

    res.json({ success: true });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
