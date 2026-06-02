const express = require("express");
const fs = require("fs");
const path = require("path");
const { pool, query } = require("../db");
const { authMiddleware, adminMiddleware } = require("../auth");

const router = express.Router();

// GET /api/articles - List all published articles (Public)
router.get("/", async (req, res, next) => {
  try {
    const result = await query(
      "SELECT id, title, author, cover_image, is_published, published_date, created_at, updated_at FROM articles WHERE is_published = true ORDER BY published_date DESC",
    );
    res.json({ articles: result.rows });
  } catch (err) {
    next(err);
  }
});

// GET /api/articles/admin - List all articles (Admin only)
router.get(
  "/admin",
  authMiddleware,
  adminMiddleware,
  async (req, res, next) => {
    try {
      const result = await query(
        "SELECT id, title, author, cover_image, is_published, published_date, created_at, updated_at FROM articles ORDER BY published_date DESC",
      );
      res.json({ articles: result.rows });
    } catch (err) {
      next(err);
    }
  },
);

// GET /api/articles/admin/:id - Get specific article by ID (Admin only)
router.get(
  "/admin/:id",
  authMiddleware,
  adminMiddleware,
  async (req, res, next) => {
    try {
      const result = await query("SELECT * FROM articles WHERE id = $1", [
        req.params.id,
      ]);
      if (result.rows.length === 0) {
        res.status(404).json({ error: "Article not found." });
        return;
      }
      res.json({ article: result.rows[0] });
    } catch (err) {
      next(err);
    }
  },
);

// GET /api/articles/:id - Get a specific article by ID (Public)
router.get("/:id", async (req, res, next) => {
  try {
    const result = await query(
      "SELECT * FROM articles WHERE id = $1 AND is_published = true",
      [req.params.id],
    );
    if (result.rows.length === 0) {
      res.status(404).json({ error: "Article not found." });
      return;
    }
    res.json({ article: result.rows[0] });
  } catch (err) {
    next(err);
  }
});

// POST /api/articles/upload-cover - Upload a cover image (max 1MB)
router.post(
  "/upload-cover",
  authMiddleware,
  adminMiddleware,
  async (req, res, next) => {
    const { data, filename } = req.body || {};
    if (!data || !filename) {
      res.status(400).json({ error: "Data and filename are required." });
      return;
    }

    const match = data.match(/^data:([^;]+);base64,(.+)$/);
    if (!match) {
      res.status(400).json({ error: "Invalid base64 image data." });
      return;
    }

    const base64Data = match[2];
    const buffer = Buffer.from(base64Data, "base64");

    if (buffer.length > 2 * 1024 * 1024) {
      res.status(400).json({ error: "Cover image must be smaller than 2MB." });
      return;
    }

    try {
      const uploadsDir = path.join(__dirname, "..", "uploads");
      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
      }

      const ext = path.extname(filename) || ".png"; 
      const cleanFilename = `article_cover_${Date.now()}${ext}`;
      const filePath = path.join(uploadsDir, cleanFilename);

      fs.writeFileSync(filePath, buffer);
      res.json({ url: `/api/uploads/${cleanFilename}` });
    } catch (err) {
      next(err);
    }
  },
);

// POST /api/articles - Create a new article (Admin only)
router.post("/", authMiddleware, adminMiddleware, async (req, res, next) => {
  const {
    title,
    content_html,
    author,
    cover_image,
    is_published,
    published_date,
  } = req.body || {};

  if (!title || !content_html || !author) {
    res
      .status(400)
      .json({ error: "Title, content_html, and author are required." });
    return;
  }

  try {
    const pDate = published_date ? new Date(published_date) : new Date();
    const result = await query(
      "INSERT INTO articles (title, content_html, author, cover_image, is_published, published_date, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW()) RETURNING *",
      [
        title.trim(),
        content_html.trim(),
        author.trim(),
        cover_image,
        !!is_published,
        pDate,
      ],
    );
    res.status(201).json({ article: result.rows[0] });
  } catch (err) {
    next(err);
  }
});

// PUT /api/articles/:id - Update an article (Admin only)
router.put("/:id", authMiddleware, adminMiddleware, async (req, res, next) => {
  const {
    title,
    content_html,
    author,
    cover_image,
    is_published,
    published_date,
  } = req.body || {};

  if (!title || !content_html || !author) {
    res
      .status(400)
      .json({ error: "Title, content_html, and author are required." });
    return;
  }

  try {
    const pDate = published_date ? new Date(published_date) : new Date();
    const result = await query(
      "UPDATE articles SET title = $1, content_html = $2, author = $3, cover_image = $4, is_published = $5, published_date = $6, updated_at = NOW() WHERE id = $7 RETURNING *",
      [
        title.trim(),
        content_html.trim(),
        author.trim(),
        cover_image,
        !!is_published,
        pDate,
        req.params.id,
      ],
    );
    if (result.rows.length === 0) {
      res.status(404).json({ error: "Article not found." });
      return;
    }
    res.json({ article: result.rows[0] });
  } catch (err) {
    next(err);
  }
});

// PATCH /api/articles/:id/publish - Toggle publish status (Admin only)
router.patch(
  "/:id/publish",
  authMiddleware,
  adminMiddleware,
  async (req, res, next) => {
    const { is_published } = req.body || {};
    try {
      const result = await query(
        "UPDATE articles SET is_published = $1, updated_at = NOW() WHERE id = $2 RETURNING id, is_published",
        [!!is_published, req.params.id],
      );
      if (result.rows.length === 0) {
        res.status(404).json({ error: "Article not found." });
        return;
      }
      res.json({ article: result.rows[0] });
    } catch (err) {
      next(err);
    }
  },
);

// DELETE /api/articles/:id - Delete an article (Admin only)
router.delete(
  "/:id",
  authMiddleware,
  adminMiddleware,
  async (req, res, next) => {
    try {
      const result = await query(
        "DELETE FROM articles WHERE id = $1 RETURNING id",
        [req.params.id],
      );
      if (result.rows.length === 0) {
        res.status(404).json({ error: "Article not found." });
        return;
      }
      res.json({ ok: true });
    } catch (err) {
      next(err);
    }
  },
);

module.exports = router;
