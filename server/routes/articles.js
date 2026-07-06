const express = require("express");
const fs = require("fs");
const path = require("path");
const { pool, query } = require("../db");
const { authMiddleware, adminMiddleware, optionalAuthMiddleware } = require("../auth");
const { authorFromUser } = require("../posts");
const router = express.Router();

function deleteLocalImage(imageUrl) {
  if (imageUrl && imageUrl.startsWith("/api/uploads/")) {
    const filename = path.basename(imageUrl);
    const filePath = path.join(__dirname, "..", "uploads", filename);
    if (fs.existsSync(filePath)) {
      try {
        fs.unlinkSync(filePath);
      } catch (err) {
        console.error("Failed to delete old cover image:", err);
      }
    }
  }
}

// GET /api/articles - List all published articles (Public)
router.get("/", async (req, res, next) => {
  try {
    const result = await query(
      "SELECT id, title, author, cover_image, is_published, published_date, created_at, updated_at, votes FROM articles WHERE is_published = true ORDER BY published_date DESC",
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
        "SELECT id, title, author, cover_image, is_published, published_date, created_at, updated_at, votes FROM articles ORDER BY published_date DESC",
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
router.get("/:id", optionalAuthMiddleware, async (req, res, next) => {
  try {
    const result = await query(
      "SELECT * FROM articles WHERE id = $1 AND is_published = true",
      [req.params.id],
    );
    if (result.rows.length === 0) {
      res.status(404).json({ error: "Article not found." });
      return;
    }

    const article = result.rows[0];
    let userVote = 0;

    if (req.userId) {
      const voteResult = await query(
        "SELECT direction FROM article_votes WHERE article_id = $1 AND user_id = $2",
        [article.id, req.userId]
      );
      if (voteResult.rows.length > 0) {
        userVote = voteResult.rows[0].direction;
      }
    }

    res.json({ article, userVote });
  } catch (err) {
    next(err);
  }
});

// GET /api/articles/:id/comments - Get comments for an article
router.get("/:id/comments", async (req, res, next) => {
  try {
    const { rows } = await query(
      "SELECT * FROM article_comments WHERE article_id = $1 ORDER BY created_at DESC",
      [req.params.id]
    );
    res.json({ comments: rows });
  } catch (err) {
    next(err);
  }
});

// POST /api/articles/:id/comments - Add a comment to an article
router.post("/:id/comments", authMiddleware, async (req, res, next) => {
  const { body } = req.body || {};
  if (!body || !body.trim()) {
    return res.status(400).json({ error: 'Comment body is required.' });
  }
  try {
    // Get user info
    const userRes = await query("SELECT * FROM users WHERE id = $1", [req.userId]);
    const user = userRes.rows[0];
    if (!user) return res.status(404).json({ error: 'User not found.' });
    
    const author = authorFromUser(user);

    const { rows } = await query(
      `INSERT INTO article_comments 
        (article_id, user_id, author_name, author_initials, author_color, body) 
       VALUES ($1, $2, $3, $4, $5, $6) 
       RETURNING *`,
      [req.params.id, req.userId, author.author_name, author.author_initials, author.author_color, body.trim()]
    );
    res.status(201).json({ comment: rows[0] });
  } catch (err) {
    next(err);
  }
});

// PUT /api/articles/:id/comments/:commentId - Edit a comment
router.put("/:id/comments/:commentId", authMiddleware, async (req, res, next) => {
  const { body } = req.body || {};
  if (!body || !body.trim()) return res.status(400).json({ error: 'Comment body is required.' });

  try {
    const userRes = await query("SELECT is_admin FROM users WHERE id = $1", [req.userId]);
    const user = userRes.rows[0];
    if (!user) return res.status(404).json({ error: 'User not found.' });

    const commentRes = await query("SELECT user_id FROM article_comments WHERE id = $1 AND article_id = $2", [req.params.commentId, req.params.id]);
    if (commentRes.rows.length === 0) return res.status(404).json({ error: 'Comment not found.' });

    if (commentRes.rows[0].user_id !== req.userId && !user.is_admin) {
      return res.status(403).json({ error: 'Not authorized to edit this comment.' });
    }

    const { rows } = await query(
      "UPDATE article_comments SET body = $1, updated_at = NOW() WHERE id = $2 RETURNING *",
      [body.trim(), req.params.commentId]
    );
    res.json({ comment: rows[0] });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/articles/:id/comments/:commentId - Delete a comment
router.delete("/:id/comments/:commentId", authMiddleware, async (req, res, next) => {
  try {
    const userRes = await query("SELECT is_admin FROM users WHERE id = $1", [req.userId]);
    const user = userRes.rows[0];
    if (!user) return res.status(404).json({ error: 'User not found.' });

    const commentRes = await query("SELECT user_id FROM article_comments WHERE id = $1 AND article_id = $2", [req.params.commentId, req.params.id]);
    if (commentRes.rows.length === 0) return res.status(404).json({ error: 'Comment not found.' });

    if (commentRes.rows[0].user_id !== req.userId && !user.is_admin) {
      return res.status(403).json({ error: 'Not authorized to delete this comment.' });
    }

    await query("DELETE FROM article_comments WHERE id = $1", [req.params.commentId]);
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

// POST /api/articles/:id/vote - Upvote/Downvote an article
router.post("/:id/vote", authMiddleware, async (req, res, next) => {
  const { direction } = req.body;
  if (![1, -1].includes(direction)) {
    return res.status(400).json({ error: 'Invalid vote direction.' });
  }
  
  const articleId = req.params.id;
  
  try {
    // Check if article exists
    const articleCheck = await query("SELECT id FROM articles WHERE id = $1", [articleId]);
    if (articleCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Article not found.' });
    }

    const { rows: existing } = await query(
      'SELECT direction FROM article_votes WHERE article_id = $1 AND user_id = $2',
      [articleId, req.userId]
    );

    if (existing.length === 0) {
      // Insert new vote
      await query(
        'INSERT INTO article_votes (article_id, user_id, direction) VALUES ($1, $2, $3)',
        [articleId, req.userId, direction]
      );
    } else {
      const currentDir = existing[0].direction;
      if (currentDir === direction) {
        // Toggle off
        await query(
          'DELETE FROM article_votes WHERE article_id = $1 AND user_id = $2',
          [articleId, req.userId]
        );
      } else {
        // Update direction
        await query(
          'UPDATE article_votes SET direction = $1 WHERE article_id = $2 AND user_id = $3',
          [direction, articleId, req.userId]
        );
      }
    }

    // Recalculate total votes
    const sumRes = await query(
      'SELECT COALESCE(SUM(direction), 0) AS total FROM article_votes WHERE article_id = $1',
      [articleId]
    );
    const newTotal = parseInt(sumRes.rows[0].total, 10);

    // Update articles table
    await query('UPDATE articles SET votes = $1 WHERE id = $2', [newTotal, articleId]);

    // Get current user vote to return
    let userVote = 0;
    const finalVoteRes = await query(
      'SELECT direction FROM article_votes WHERE article_id = $1 AND user_id = $2',
      [articleId, req.userId]
    );
    if (finalVoteRes.rows.length > 0) {
      userVote = finalVoteRes.rows[0].direction;
    }

    res.json({ votes: newTotal, userVote });
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
    const oldArticleResult = await query("SELECT cover_image FROM articles WHERE id = $1", [req.params.id]);
    const oldCoverImage = oldArticleResult.rows.length > 0 ? oldArticleResult.rows[0].cover_image : null;

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

    if (oldCoverImage && oldCoverImage !== cover_image) {
      deleteLocalImage(oldCoverImage);
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
        "DELETE FROM articles WHERE id = $1 RETURNING id, cover_image",
        [req.params.id],
      );
      if (result.rows.length === 0) {
        res.status(404).json({ error: "Article not found." });
        return;
      }
      const deletedCoverImage = result.rows[0].cover_image;
      if (deletedCoverImage) {
        deleteLocalImage(deletedCoverImage);
      }
      res.json({ ok: true });
    } catch (err) {
      next(err);
    }
  },
);

module.exports = router;
