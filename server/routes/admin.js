const express = require('express');
const { getDb } = require('../db');
const { authMiddleware, adminMiddleware, adminUser } = require('../auth');

const router = express.Router();

const USER_SELECT =
  'SELECT id, email, display_name, google_id, country, city, created_at FROM users';

router.use(authMiddleware, adminMiddleware);

router.get('/stats', (_req, res) => {
  const db = getDb();

  const totalUsers = db.prepare('SELECT COUNT(*) AS n FROM users').get().n;
  const googleUsers = db.prepare('SELECT COUNT(*) AS n FROM users WHERE google_id IS NOT NULL').get().n;
  const emailUsers = totalUsers - googleUsers;
  const recentSignups = db
    .prepare("SELECT COUNT(*) AS n FROM users WHERE created_at >= datetime('now', '-7 days')")
    .get().n;
  const withLocation = db
    .prepare('SELECT COUNT(*) AS n FROM users WHERE country IS NOT NULL AND city IS NOT NULL')
    .get().n;

  const byCountry = db
    .prepare(
      `SELECT COALESCE(country, 'Not set') AS country, COUNT(*) AS count
       FROM users GROUP BY country ORDER BY count DESC, country ASC`
    )
    .all();

  const byCity = db
    .prepare(
      `SELECT COALESCE(city, 'Not set') AS city,
              COALESCE(country, 'Not set') AS country,
              COUNT(*) AS count
       FROM users GROUP BY city, country ORDER BY count DESC, city ASC`
    )
    .all();

  res.json({
    totalUsers,
    googleUsers,
    emailUsers,
    recentSignups,
    withLocation,
    countriesCount: byCountry.filter(r => r.country !== 'Not set').length,
    byCountry,
    byCity,
  });
});

router.get('/users', (_req, res) => {
  const db = getDb();
  const users = db
    .prepare(`${USER_SELECT} ORDER BY created_at DESC`)
    .all()
    .map(adminUser);

  res.json({ users });
});

module.exports = router;
