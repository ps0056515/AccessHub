const express = require('express');
const router = express.Router();
const { query } = require('../db');
const { adminMiddleware } = require('../auth');

// GET public published screen readers
router.get('/', async (req, res) => {
  try {
    const result = await query(
      'SELECT id, title, description, is_published, created_at, updated_at FROM screen_readers WHERE is_published = true ORDER BY created_at ASC'
    );
    res.json({ data: result.rows });
  } catch (error) {
    console.error('Error fetching screen readers:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET public published screen reader by id
router.get('/:id', async (req, res) => {
  try {
    const result = await query(
      'SELECT * FROM screen_readers WHERE id = $1 AND is_published = true',
      [req.params.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Not found' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching screen reader by id:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET admin list all screen readers
router.get('/admin/all', adminMiddleware, async (req, res) => {
  try {
    const result = await query(
      'SELECT id, title, description, is_published, created_at, updated_at FROM screen_readers ORDER BY created_at DESC'
    );
    res.json({ data: result.rows });
  } catch (error) {
    console.error('Error admin fetching screen readers:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET admin single screen reader
router.get('/admin/:id', adminMiddleware, async (req, res) => {
  try {
    const result = await query(
      'SELECT * FROM screen_readers WHERE id = $1',
      [req.params.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Not found' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error admin fetching screen reader:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST create screen reader
router.post('/', adminMiddleware, async (req, res) => {
  const { title, description, content_json, is_published } = req.body;
  if (!title || !description || !content_json) {
    return res.status(400).json({ error: 'Title, description, and content_json are required' });
  }
  
  try {
    const result = await query(
      'INSERT INTO screen_readers (title, description, content_json, is_published) VALUES ($1, $2, $3, $4) RETURNING *',
      [title, description, JSON.stringify(content_json), Boolean(is_published)]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating screen reader:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// PUT update screen reader
router.put('/:id', adminMiddleware, async (req, res) => {
  const { title, description, content_json, is_published } = req.body;
  
  try {
    const result = await query(
      `UPDATE screen_readers 
       SET title = $1, description = $2, content_json = $3, is_published = $4, updated_at = CURRENT_TIMESTAMP 
       WHERE id = $5 RETURNING *`,
      [title, description, JSON.stringify(content_json), Boolean(is_published), req.params.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Not found' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating screen reader:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// PATCH toggle publish status
router.patch('/:id/publish', adminMiddleware, async (req, res) => {
  const { is_published } = req.body;
  try {
    const result = await query(
      'UPDATE screen_readers SET is_published = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING id, is_published',
      [Boolean(is_published), req.params.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Not found' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error toggling publish status:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// DELETE screen reader
router.delete('/:id', adminMiddleware, async (req, res) => {
  try {
    const result = await query(
      'DELETE FROM screen_readers WHERE id = $1 RETURNING id',
      [req.params.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Not found' });
    }
    res.json({ message: 'Deleted successfully' });
  } catch (error) {
    console.error('Error deleting screen reader:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
