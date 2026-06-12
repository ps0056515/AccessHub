const express = require('express');
const { query, pool } = require('../db');
const { authMiddleware, adminMiddleware } = require('../auth');

const router = express.Router();

// GET /api/tools - Fetch all tools sorted by display_order
router.get('/', async (req, res, next) => {
  try {
    const { rows } = await query('SELECT * FROM tools ORDER BY display_order ASC, id ASC');
    const mapped = rows.map(r => {
      let compat = [];
      try {
        compat = r.compatibility ? JSON.parse(r.compatibility) : [];
      } catch (_) {
        compat = [];
      }
      return { ...r, compatibility: compat };
    });
    res.json(mapped);
  } catch (err) {
    next(err);
  }
});

// POST /api/tools/admin - Add a new tool (Admin only)
router.post('/admin', authMiddleware, adminMiddleware, async (req, res, next) => {
  const { icon, name, type, price, badge, badgeColor, url, compatibility } = req.body || {};
  if (!name || !price || !url) {
    res.status(400).json({ error: 'Name, price, and url are required.' });
    return;
  }

  try {
    const orderRes = await query('SELECT COALESCE(MAX(display_order), 0) as max_order FROM tools');
    const display_order = orderRes.rows[0].max_order + 1;

    const trimmedIcon = icon && icon.trim() ? icon.trim() : null;
    const trimmedType = type && type.trim() ? type.trim() : null;

    const insertRes = await query(
      'INSERT INTO tools (icon, name, type, price, badge, badge_color, url, display_order, compatibility) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *',
      [
        trimmedIcon,
        name.trim(),
        trimmedType,
        price.trim(),
        badge && badge.trim() ? badge.trim() : null,
        badgeColor && badgeColor.trim() ? badgeColor.trim() : null,
        url.trim(),
        display_order,
        JSON.stringify(compatibility || [])
      ]
    );
    const row = insertRes.rows[0];
    if (row) {
      try {
        row.compatibility = row.compatibility ? JSON.parse(row.compatibility) : [];
      } catch (_) {
        row.compatibility = [];
      }
    }
    res.json(row);
  } catch (err) {
    next(err);
  }
});


// PUT /api/tools/admin/reorder - Reorder tools (Admin only)
router.put('/admin/reorder', authMiddleware, adminMiddleware, async (req, res, next) => {
  const { toolIds } = req.body || {};
  if (!Array.isArray(toolIds)) {
    res.status(400).json({ error: 'toolIds array is required.' });
    return;
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    for (let i = 0; i < toolIds.length; i++) {
      await client.query('UPDATE tools SET display_order = $1 WHERE id = $2', [i + 1, toolIds[i]]);
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

// PUT /api/tools/admin/:id - Update an existing tool (Admin only)
router.put('/admin/:id', authMiddleware, adminMiddleware, async (req, res, next) => {
  const { id } = req.params;
  const { icon, name, type, price, badge, badgeColor, url, compatibility } = req.body || {};
  if (!name || !price || !url) {
    res.status(400).json({ error: 'Name, price, and url are required.' });
    return;
  }

  try {
    const trimmedIcon = icon && icon.trim() ? icon.trim() : null;
    const trimmedType = type && type.trim() ? type.trim() : null;

    const updateRes = await query(
      'UPDATE tools SET icon = $1, name = $2, type = $3, price = $4, badge = $5, badge_color = $6, url = $7, compatibility = $8, updated_at = CURRENT_TIMESTAMP WHERE id = $9 RETURNING *',
      [
        trimmedIcon,
        name.trim(),
        trimmedType,
        price.trim(),
        badge && badge.trim() ? badge.trim() : null,
        badgeColor && badgeColor.trim() ? badgeColor.trim() : null,
        url.trim(),
        JSON.stringify(compatibility || []),
        id
      ]
    );

    if (updateRes.rows.length === 0) {
      res.status(404).json({ error: 'Tool not found.' });
      return;
    }
    const row = updateRes.rows[0];
    if (row) {
      try {
        row.compatibility = row.compatibility ? JSON.parse(row.compatibility) : [];
      } catch (_) {
        row.compatibility = [];
      }
    }
    res.json(row);
  } catch (err) {
    next(err);
  }
});

// DELETE /api/tools/admin/:id - Delete a tool (Admin only)
router.delete('/admin/:id', authMiddleware, adminMiddleware, async (req, res, next) => {
  const { id } = req.params;
  try {
    const deleteRes = await query('DELETE FROM tools WHERE id = $1 RETURNING *', [id]);
    if (deleteRes.rowCount === 0) {
      res.status(404).json({ error: 'Tool not found.' });
      return;
    }
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
