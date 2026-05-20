const jwt = require("jsonwebtoken");
const config = require("../config");
const pool = require("../db/pool");

function readToken(req) {
  const cookie = req.cookies?.[config.cookieName];
  if (cookie) return cookie;
  const header = req.headers.authorization;
  if (header?.startsWith("Bearer ")) return header.slice(7);
  return null;
}

async function requireAuth(req, res, next) {
  const token = readToken(req);
  if (!token) {
    return res.status(401).json({ error: "Authentication required" });
  }

  try {
    const payload = jwt.verify(token, config.jwtSecret);
    const { rows } = await pool.query(
      "SELECT id, email, display_name, created_at FROM users WHERE id = $1",
      [payload.sub],
    );
    if (rows.length === 0) {
      return res.status(401).json({ error: "User not found" });
    }
    req.user = rows[0];
    next();
  } catch {
    return res.status(401).json({ error: "Invalid or expired session" });
  }
}

async function optionalAuth(req, _res, next) {
  const token = readToken(req);
  if (!token) {
    req.user = null;
    return next();
  }

  try {
    const payload = jwt.verify(token, config.jwtSecret);
    const { rows } = await pool.query(
      "SELECT id, email, display_name, created_at FROM users WHERE id = $1",
      [payload.sub],
    );
    req.user = rows[0] || null;
  } catch {
    req.user = null;
  }
  next();
}

module.exports = { requireAuth, optionalAuth, readToken };
