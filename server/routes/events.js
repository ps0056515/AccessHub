const express = require('express');
const { query, pool } = require('../db');
const { authMiddleware, adminMiddleware, verifyToken } = require('../auth');
const { sendEventRsvpEmail } = require('../email');

const router = express.Router();

// GET /api/events - Fetch all events with RSVP counts
router.get('/', async (req, res, next) => {
  try {
    const { rows } = await query(`
      SELECT e.*,
        COUNT(r.id)::int AS rsvp_count
      FROM events e
      LEFT JOIN event_rsvps r ON r.event_id = e.id
      GROUP BY e.id
      ORDER BY e.created_at DESC
    `);
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

// POST /api/events/proposals - Submit a host proposal (public)
router.post('/proposals', async (req, res, next) => {
  const { title, format, proposedDate, email, details } = req.body || {};
  if (!title || !email) {
    return res.status(400).json({ error: 'Title and email are required.' });
  }
  try {
    const { rows } = await query(
      'INSERT INTO event_proposals (title, format, proposed_date, email, details) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [title.trim(), (format || 'webinar').trim(), proposedDate?.trim() || null, email.trim(), details?.trim() || null]
    );
    res.json(rows[0]);
  } catch (err) {
    next(err);
  }
});

// POST /api/events/:id/rsvp - RSVP to an event
router.post('/:id/rsvp', async (req, res, next) => {
  const { id } = req.params;
  const { email, displayName } = req.body || {};

  if (!email) {
    return res.status(400).json({ error: 'Email is required to RSVP.' });
  }

  let userId = null;
  const authHeader = req.headers['authorization'];
  if (authHeader) {
    try {
      const payload = verifyToken(authHeader.replace('Bearer ', ''));
      userId = payload?.userId || null;
    } catch {
      /* guest rsvp */
    }
  }

  try {
    const eventRes = await query('SELECT * FROM events WHERE id = $1', [id]);
    if (eventRes.rows.length === 0) {
      return res.status(404).json({ error: 'Event not found.' });
    }
    const event = eventRes.rows[0];

    await query(
      'INSERT INTO event_rsvps (event_id, user_id, email) VALUES ($1, $2, $3)',
      [id, userId, email.trim()]
    );

    sendEventRsvpEmail({ event, email: email.trim(), displayName: displayName || email.split('@')[0] })
      .catch(err => console.error('[rsvp-email]', err.message));

    res.json({ ok: true, message: "You're on the list! Check your email for a calendar invite." });
  } catch (err) {
    if (err.code === '23505') {
      return res.status(409).json({ error: 'You are already registered for this event.' });
    }
    next(err);
  }
});

// ─── Admin routes ──────────────────────────────────────────────────────────────

// GET /api/events/admin/:id/rsvps
router.get('/admin/:id/rsvps', authMiddleware, adminMiddleware, async (req, res, next) => {
  const { id } = req.params;
  try {
    const { rows } = await query(`
      SELECT r.id, r.email, u.display_name
      FROM event_rsvps r
      LEFT JOIN users u ON r.user_id = u.id
      WHERE r.event_id = $1
      ORDER BY r.created_at DESC
    `, [id]);
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

// GET /api/events/admin/proposals
router.get('/admin/proposals', authMiddleware, adminMiddleware, async (req, res, next) => {
  try {
    const { rows } = await query('SELECT * FROM event_proposals ORDER BY created_at DESC');
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

// POST /api/events/admin/proposals/:id/approve
router.post('/admin/proposals/:id/approve', authMiddleware, adminMiddleware, async (req, res, next) => {
  const { id } = req.params;
  const { event_date, title, type, band } = req.body || {};
  if (!event_date || !title || !type || !band) {
    return res.status(400).json({ error: 'event_date, title, type, and band are required.' });
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const orderRes = await client.query('SELECT COALESCE(MAX(display_order), 0) AS max FROM events');
    const display_order = orderRes.rows[0].max + 1;
    const eventRes = await client.query(
      'INSERT INTO events (event_date, title, type, band, display_order, tags) VALUES ($1,$2,$3,$4,$5,$6) RETURNING *',
      [event_date, title.trim(), type.trim(), band.trim(), display_order, '[]']
    );
    await client.query("UPDATE event_proposals SET status='approved' WHERE id=$1", [id]);
    await client.query('COMMIT');
    res.json(eventRes.rows[0]);
  } catch (err) {
    await client.query('ROLLBACK');
    next(err);
  } finally {
    client.release();
  }
});

// DELETE /api/events/admin/proposals/:id (reject)
router.delete('/admin/proposals/:id', authMiddleware, adminMiddleware, async (req, res, next) => {
  try {
    await query("UPDATE event_proposals SET status='rejected' WHERE id=$1", [req.params.id]);
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/events/admin/proposals/:id/force (permanently delete)
router.delete('/admin/proposals/:id/force', authMiddleware, adminMiddleware, async (req, res, next) => {
  try {
    const { rowCount } = await query("DELETE FROM event_proposals WHERE id=$1", [req.params.id]);
    if (rowCount === 0) return res.status(404).json({ error: 'Proposal not found.' });
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

// PUT /api/events/admin/reorder
router.put('/admin/reorder', authMiddleware, adminMiddleware, async (req, res, next) => {
  const { eventIds } = req.body || {};
  if (!Array.isArray(eventIds)) {
    return res.status(400).json({ error: 'eventIds array is required.' });
  }
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    for (let i = 0; i < eventIds.length; i++) {
      await client.query('UPDATE events SET display_order=$1 WHERE id=$2', [i + 1, eventIds[i]]);
    }
    await client.query('COMMIT');
    res.json({ ok: true });
  } catch (err) {
    await client.query('ROLLBACK');
    res.status(400).json({ error: err.message });
  } finally {
    client.release();
  }
});

// POST /api/events/admin
router.post('/admin', authMiddleware, adminMiddleware, async (req, res, next) => {
  const { event_date, title, type, band, tags } = req.body || {};
  if (!event_date || !title || !type || !band) {
    return res.status(400).json({ error: 'event_date, title, type, and band are required.' });
  }
  try {
    const orderRes = await query('SELECT COALESCE(MAX(display_order), 0) AS max FROM events');
    const display_order = orderRes.rows[0].max + 1;
    const { rows } = await query(
      'INSERT INTO events (event_date, title, type, band, display_order, tags) VALUES ($1,$2,$3,$4,$5,$6) RETURNING *',
      [event_date, title.trim(), type.trim(), band.trim(), display_order, JSON.stringify(tags || [])]
    );
    res.json(rows[0]);
  } catch (err) {
    next(err);
  }
});

// PUT /api/events/admin/:id
router.put('/admin/:id', authMiddleware, adminMiddleware, async (req, res, next) => {
  const { id } = req.params;
  const { event_date, title, type, band, tags } = req.body || {};
  if (!event_date || !title || !type || !band) {
    return res.status(400).json({ error: 'event_date, title, type, and band are required.' });
  }
  try {
    const { rows } = await query(
      'UPDATE events SET event_date=$1, title=$2, type=$3, band=$4, tags=$5, updated_at=CURRENT_TIMESTAMP WHERE id=$6 RETURNING *',
      [event_date, title.trim(), type.trim(), band.trim(), JSON.stringify(tags || []), id]
    );
    if (rows.length === 0) return res.status(404).json({ error: 'Event not found.' });
    res.json(rows[0]);
  } catch (err) {
    next(err);
  }
});

// DELETE /api/events/admin/:id
router.delete('/admin/:id', authMiddleware, adminMiddleware, async (req, res, next) => {
  const { id } = req.params;
  try {
    const { rowCount } = await query('DELETE FROM events WHERE id=$1', [id]);
    if (rowCount === 0) return res.status(404).json({ error: 'Event not found.' });
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
