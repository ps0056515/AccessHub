const express = require('express');
const { query } = require('../db');

const router = express.Router();

// Get all active games
router.get('/', async (req, res, next) => {
  try {
    const { rows } = await query(
      'SELECT id, title, description, slug, html_file_path, thumbnail, is_active, created_at, updated_at FROM games WHERE is_active = TRUE ORDER BY created_at DESC'
    );
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

// Get a single active game by slug
router.get('/:slug', async (req, res, next) => {
  try {
    const { rows } = await query(
      'SELECT id, title, description, slug, html_file_path, thumbnail, is_active, created_at, updated_at FROM games WHERE slug = $1 AND is_active = TRUE',
      [req.params.slug]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Game not found' });
    }

    res.json(rows[0]);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
