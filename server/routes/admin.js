const express = require('express');
const { query } = require('../db');
const { authMiddleware, adminMiddleware, adminUser } = require('../auth');

const router = express.Router();

const USER_SELECT =
  'SELECT id, email, display_name, google_id, country, city, created_at FROM users';

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

module.exports = router;
