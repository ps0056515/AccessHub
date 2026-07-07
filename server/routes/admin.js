const express = require('express');
const { query } = require('../db');
const { authMiddleware, adminMiddleware, adminUser } = require('../auth');

const router = express.Router();

const USER_SELECT =
  'SELECT id, email, display_name, google_id, country, city, is_admin, is_blocked, created_at, updated_at FROM users';

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

    const signupsByDate = (
      await query(
        `SELECT DATE(created_at)::text AS date, COUNT(*)::int AS count
         FROM users 
         WHERE created_at >= NOW() - INTERVAL '30 days'
         GROUP BY date 
         ORDER BY date ASC`
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
      signupsByDate,
    });
  } catch (err) {
    next(err);
  }
});

router.get('/analytics', async (req, res, next) => {
  try {
    const { timeframe } = req.query; // '7d', '30d', 'ytd', 'all'
    let dateFilter = "NOW() - INTERVAL '30 days'";
    if (timeframe === '7d') dateFilter = "NOW() - INTERVAL '7 days'";
    else if (timeframe === 'ytd') dateFilter = "DATE_TRUNC('year', NOW())";
    else if (timeframe === 'all') dateFilter = "'1970-01-01'";

    // KPIs
    const kpiResult = await query(`
      SELECT
        COUNT(DISTINCT COALESCE(user_id::text, visitor_id))::int AS unique_visitors,
        COUNT(id)::int AS total_sessions,
        COALESCE(SUM(page_count), 0)::int AS total_pageviews,
        CASE WHEN COUNT(*) > 0 
          THEN ROUND(AVG(is_bounce::int) * 100, 1)::float 
          ELSE 0 
        END AS bounce_rate,
        CASE WHEN COUNT(*) > 0
          THEN ROUND(AVG(EXTRACT(EPOCH FROM (ended_at - started_at))))::int
          ELSE 0
        END AS avg_session_duration
      FROM analytics_sessions
      WHERE started_at >= ${dateFilter}
    `);
    const kpis = {
      uniqueVisitors: kpiResult.rows[0].unique_visitors,
      totalSessions: kpiResult.rows[0].total_sessions,
      totalPageviews: kpiResult.rows[0].total_pageviews,
      bounceRate: kpiResult.rows[0].bounce_rate,
      avgSessionDuration: kpiResult.rows[0].avg_session_duration,
    };

    // Traffic Over Time
    const trafficOverTime = (await query(`
      WITH dates AS (
        SELECT generate_series(
          GREATEST(DATE(${dateFilter}), DATE(NOW() - INTERVAL '90 days')),
          DATE(NOW()),
          '1 day'::interval
        )::date AS date
      )
      SELECT
        d.date::text,
        COUNT(id)::int AS sessions,
        COALESCE(SUM(s.page_count), 0)::int AS pageviews
      FROM dates d
      LEFT JOIN analytics_sessions s ON DATE(s.started_at) = d.date AND s.started_at >= ${dateFilter}
      GROUP BY d.date
      ORDER BY d.date ASC
    `)).rows;

    // Top Pages
    const topPages = (await query(`
      SELECT
        pv.path,
        COUNT(*)::int AS views,
        COUNT(DISTINCT pv.session_id)::int AS "uniqueSessions"
      FROM analytics_page_views pv
      JOIN analytics_sessions s ON s.id = pv.session_id
      WHERE s.started_at >= ${dateFilter}
      GROUP BY pv.path
      ORDER BY views DESC
      LIMIT 10
    `)).rows;

    // Traffic Sources (by category)
    const trafficSources = (await query(`
      SELECT
        referrer_category AS name,
        COUNT(id)::int AS value
      FROM analytics_sessions
      WHERE started_at >= ${dateFilter}
      GROUP BY referrer_category
      ORDER BY value DESC
    `)).rows;

    // Top Referrers (individual domains)
    const topReferrers = (await query(`
      SELECT
        referrer_domain AS domain,
        COUNT(id)::int AS sessions
      FROM analytics_sessions
      WHERE started_at >= ${dateFilter} AND referrer_domain != 'Direct'
      GROUP BY referrer_domain
      ORDER BY sessions DESC
      LIMIT 10
    `)).rows;

    // Top Countries
    const topCountries = (await query(`
      SELECT
        country,
        COUNT(id)::int AS sessions
      FROM analytics_sessions
      WHERE started_at >= ${dateFilter} AND country != 'Unknown'
      GROUP BY country
      ORDER BY sessions DESC
      LIMIT 10
    `)).rows;

    // Devices
    const devices = (await query(`
      SELECT
        device_type AS name,
        COUNT(id)::int AS value
      FROM analytics_sessions
      WHERE started_at >= ${dateFilter}
      GROUP BY device_type
      ORDER BY value DESC
    `)).rows;

    // Browsers
    const browsers = (await query(`
      SELECT
        browser AS name,
        COUNT(id)::int AS value
      FROM analytics_sessions
      WHERE started_at >= ${dateFilter} AND browser != 'Unknown'
      GROUP BY browser
      ORDER BY value DESC
      LIMIT 5
    `)).rows;

    res.json({
      kpis,
      trafficOverTime,
      topPages,
      trafficSources,
      topReferrers,
      topCountries,
      devices,
      browsers,
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
      `UPDATE users SET is_admin = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *`,
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
      `UPDATE users SET is_blocked = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *`,
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
