const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const { query } = require('../db');
const { authMiddleware, adminMiddleware } = require('../auth');

const router = express.Router();

router.use(authMiddleware, adminMiddleware);

// Ensure upload directories exist
const gamesUploadDir = path.join(__dirname, '..', 'uploads', 'games');
const thumbUploadDir = path.join(__dirname, '..', 'uploads', 'games', 'thumbnails');
if (!fs.existsSync(gamesUploadDir)) fs.mkdirSync(gamesUploadDir, { recursive: true });
if (!fs.existsSync(thumbUploadDir)) fs.mkdirSync(thumbUploadDir, { recursive: true });

// Configure Multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (file.fieldname === 'htmlFile') {
      cb(null, gamesUploadDir);
    } else if (file.fieldname === 'thumbnail') {
      cb(null, thumbUploadDir);
    } else {
      cb(new Error('Unknown field'), false);
    }
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + ext);
  }
});

const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    if (file.fieldname === 'htmlFile') {
      if (file.mimetype === 'text/html' || path.extname(file.originalname).toLowerCase() === '.html') {
        cb(null, true);
      } else {
        cb(new Error('Only .html files are allowed for the game file.'), false);
      }
    } else if (file.fieldname === 'thumbnail') {
      if (file.mimetype.startsWith('image/')) {
        cb(null, true);
      } else {
        cb(new Error('Only images are allowed for the thumbnail.'), false);
      }
    }
  }
});

function generateSlug(title) {
  return title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '') + '-' + crypto.randomBytes(3).toString('hex');
}

// Get all games (including disabled/drafts) for Admin
router.get('/', async (req, res, next) => {
  try {
    const { rows } = await query(
      'SELECT id, title, description, slug, html_file_path, thumbnail, is_active, created_at, updated_at FROM games ORDER BY created_at DESC'
    );
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

// Upload a new game
router.post('/', upload.fields([{ name: 'htmlFile', maxCount: 1 }, { name: 'thumbnail', maxCount: 1 }]), async (req, res, next) => {
  try {
    const { title, description } = req.body;
    
    if (!title) {
      return res.status(400).json({ error: 'Title is required' });
    }
    if (!req.files || !req.files['htmlFile'] || !req.files['htmlFile'][0]) {
      return res.status(400).json({ error: 'HTML file is required' });
    }

    const htmlFile = req.files['htmlFile'][0];
    const thumbnailFile = req.files['thumbnail'] ? req.files['thumbnail'][0] : null;

    const slug = generateSlug(title);
    const htmlFilePath = '/api/uploads/games/' + htmlFile.filename;
    const thumbnailPath = thumbnailFile ? '/api/uploads/games/thumbnails/' + thumbnailFile.filename : null;

    const { rows } = await query(
      `INSERT INTO games (title, description, slug, html_file_path, thumbnail, is_active) 
       VALUES ($1, $2, $3, $4, $5, TRUE) RETURNING *`,
      [title, description || '', slug, htmlFilePath, thumbnailPath]
    );

    res.status(201).json(rows[0]);
  } catch (err) {
    next(err);
  }
});

// Update an existing game
router.put('/:id', upload.fields([{ name: 'thumbnail', maxCount: 1 }]), async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const { title, description, is_active } = req.body;

    if (!Number.isFinite(id)) {
      return res.status(400).json({ error: 'Invalid game ID' });
    }

    const { rows: existing } = await query('SELECT * FROM games WHERE id = $1', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ error: 'Game not found' });
    }

    let thumbnailPath = existing[0].thumbnail;
    if (req.files && req.files['thumbnail'] && req.files['thumbnail'][0]) {
      // Optional: Delete old thumbnail if needed
      thumbnailPath = '/api/uploads/games/thumbnails/' + req.files['thumbnail'][0].filename;
    }

    const activeStatus = is_active !== undefined ? is_active === 'true' || is_active === true : existing[0].is_active;

    const { rows } = await query(
      `UPDATE games SET title = $1, description = $2, thumbnail = $3, is_active = $4, updated_at = NOW() WHERE id = $5 RETURNING *`,
      [title || existing[0].title, description !== undefined ? description : existing[0].description, thumbnailPath, activeStatus, id]
    );

    res.json(rows[0]);
  } catch (err) {
    next(err);
  }
});

// Delete a game
router.delete('/:id', async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isFinite(id)) {
      return res.status(400).json({ error: 'Invalid game ID' });
    }

    const { rows } = await query('SELECT * FROM games WHERE id = $1', [id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Game not found' });
    }

    const game = rows[0];

    // Delete files from disk
    const htmlFilePath = path.join(__dirname, '..', game.html_file_path.replace('/api/', ''));
    if (fs.existsSync(htmlFilePath)) {
      fs.unlinkSync(htmlFilePath);
    }

    if (game.thumbnail) {
      const thumbFilePath = path.join(__dirname, '..', game.thumbnail.replace('/api/', ''));
      if (fs.existsSync(thumbFilePath)) {
        fs.unlinkSync(thumbFilePath);
      }
    }

    await query('DELETE FROM games WHERE id = $1', [id]);
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
