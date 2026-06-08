const express = require("express");
const { query, pool } = require("../db");
const { authMiddleware, adminMiddleware } = require("../auth");

const router = express.Router();

function slugify(text) {
  return text
    .toString()
    .toLowerCase()
    .replace(/\s+/g, "-") // Replace spaces with -
    .replace(/[^\w\-]+/g, "") // Remove all non-word chars
    .replace(/\-\-+/g, "-") // Replace multiple - with single -
    .replace(/^-+/, "") // Trim - from start of text
    .replace(/-+$/, ""); // Trim - from end of text
}

// GET /api/resources
router.get("/", async (req, res, next) => {
  try {
    const { rows } = await query(
      "SELECT id, slug, icon, title, description AS desc, color, category, view_url, updated_at FROM resources ORDER BY created_at DESC",
    );
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

// POST /api/resources/proposals
router.post("/proposals", async (req, res, next) => {
  const { title, url, note } = req.body || {};
  if (!title || !url)
    return res.status(400).json({ error: "Title and URL are required." });
  try {
    const { rows } = await query(
      "INSERT INTO resource_proposals (title, url, note) VALUES ($1, $2, $3) RETURNING *",
      [title.trim(), url.trim(), note?.trim() || null],
    );
    res.json(rows[0]);
  } catch (err) {
    next(err);
  }
});

// Admin endpoints
router.get(
  "/admin/proposals",
  authMiddleware,
  adminMiddleware,
  async (req, res, next) => {
    try {
      const { rows } = await query(
        "SELECT * FROM resource_proposals ORDER BY created_at DESC",
      );
      res.json(rows);
    } catch (err) {
      next(err);
    }
  },
);

router.post(
  "/admin/proposals/:id/approve",
  authMiddleware,
  adminMiddleware,
  async (req, res, next) => {
    const { id } = req.params;
    const { title, view_url, icon, desc, color, category } = req.body || {};
    if (!title || !view_url || !icon || !desc || !category) {
      return res.status(400).json({ error: "Missing required fields." });
    }

    const client = await pool.connect();
    try {
      await client.query("BEGIN");
      const orderRes = await client.query(
        "SELECT COALESCE(MAX(display_order), 0) AS max FROM resources",
      );
      const display_order = orderRes.rows[0].max + 1;
      let slug = slugify(title);

      // Add randomness if slug exists to avoid constraints issue on identical titles
      const slugCheck = await client.query(
        "SELECT 1 FROM resources WHERE slug=$1",
        [slug],
      );
      if (slugCheck.rows.length > 0) slug = `${slug}-${Date.now()}`;

      const resRes = await client.query(
        "INSERT INTO resources (slug, icon, title, description, color, category, view_url, display_order) VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING id, slug, icon, title, description AS desc, color, category, view_url, display_order",
        [
          slug,
          icon,
          title.trim(),
          desc.trim(),
          color || "blue",
          category,
          view_url.trim(),
          display_order,
        ],
      );
      await client.query(
        "UPDATE resource_proposals SET status='approved' WHERE id=$1",
        [id],
      );
      await client.query("COMMIT");
      res.json(resRes.rows[0]);
    } catch (err) {
      await client.query("ROLLBACK");
      next(err);
    } finally {
      client.release();
    }
  },
);

router.delete(
  "/admin/proposals/:id",
  authMiddleware,
  adminMiddleware,
  async (req, res, next) => {
    try {
      await query(
        "UPDATE resource_proposals SET status='rejected' WHERE id=$1",
        [req.params.id],
      );
      res.json({ ok: true });
    } catch (err) {
      next(err);
    }
  },
);

router.delete(
  "/admin/proposals/:id/force",
  authMiddleware,
  adminMiddleware,
  async (req, res, next) => {
    try {
      await query("DELETE FROM resource_proposals WHERE id=$1", [req.params.id]);
      res.json({ ok: true });
    } catch (err) {
      next(err);
    }
  },
);

router.put(
  "/admin/reorder",
  authMiddleware,
  adminMiddleware,
  async (req, res, next) => {
    const { resourceIds } = req.body || {};
    if (!Array.isArray(resourceIds))
      return res.status(400).json({ error: "resourceIds required." });
    const client = await pool.connect();
    try {
      await client.query("BEGIN");
      for (let i = 0; i < resourceIds.length; i++) {
        await client.query(
          "UPDATE resources SET display_order=$1 WHERE id=$2",
          [i + 1, resourceIds[i]],
        );
      }
      await client.query("COMMIT");
      res.json({ ok: true });
    } catch (err) {
      await client.query("ROLLBACK");
      res.status(400).json({ error: err.message });
    } finally {
      client.release();
    }
  },
);

router.post(
  "/admin",
  authMiddleware,
  adminMiddleware,
  async (req, res, next) => {
    const { title, view_url, icon, desc, color, category } = req.body || {};
    if (!title || !view_url || !icon || !desc || !category) {
      return res.status(400).json({ error: "Missing required fields." });
    }
    try {
      const orderRes = await query(
        "SELECT COALESCE(MAX(display_order), 0) AS max FROM resources",
      );
      const display_order = orderRes.rows[0].max + 1;
      let slug = slugify(title);

      // basic collision avoidance
      const slugCheck = await query("SELECT 1 FROM resources WHERE slug=$1", [
        slug,
      ]);
      if (slugCheck.rows.length > 0) slug = `${slug}-${Date.now()}`;

      const { rows } = await query(
        "INSERT INTO resources (slug, icon, title, description, color, category, view_url, display_order) VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING id, slug, icon, title, description AS desc, color, category, view_url, display_order",
        [
          slug,
          icon,
          title.trim(),
          desc.trim(),
          color || "blue",
          category,
          view_url.trim(),
          display_order,
        ],
      );
      res.json(rows[0]);
    } catch (err) {
      next(err);
    }
  },
);

router.put(
  "/admin/:id",
  authMiddleware,
  adminMiddleware,
  async (req, res, next) => {
    const { id } = req.params;
    const { title, view_url, icon, desc, color, category } = req.body || {};
    if (!title || !view_url || !icon || !desc || !category) {
      return res.status(400).json({ error: "Missing required fields." });
    }
    try {
      const { rows } = await query(
        "UPDATE resources SET title=$1, view_url=$2, icon=$3, description=$4, color=$5, category=$6, updated_at=CURRENT_TIMESTAMP WHERE id=$7 RETURNING id, slug, icon, title, description AS desc, color, category, view_url, display_order, updated_at",
        [
          title.trim(),
          view_url.trim(),
          icon,
          desc.trim(),
          color || "blue",
          category,
          id,
        ],
      );
      if (rows.length === 0)
        return res.status(404).json({ error: "Resource not found." });
      res.json(rows[0]);
    } catch (err) {
      next(err);
    }
  },
);

router.delete(
  "/admin/:id",
  authMiddleware,
  adminMiddleware,
  async (req, res, next) => {
    try {
      const { rowCount } = await query("DELETE FROM resources WHERE id=$1", [
        req.params.id,
      ]);
      if (rowCount === 0)
        return res.status(404).json({ error: "Resource not found." });
      res.json({ ok: true });
    } catch (err) {
      next(err);
    }
  },
);

module.exports = router;
