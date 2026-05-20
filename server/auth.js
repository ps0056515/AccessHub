const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { query } = require('./db');

const JWT_SECRET = process.env.JWT_SECRET || 'dev-only-change-in-production';
const TOKEN_TTL = process.env.JWT_TTL || '7d';

function getAdminEmails() {
  return (process.env.ADMIN_EMAILS || '')
    .split(',')
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
}

function isAdminEmail(email) {
  if (!email) return false;
  return getAdminEmails().includes(email.trim().toLowerCase());
}

function hashPassword(password) {
  return bcrypt.hash(password, 12);
}

function verifyPassword(password, hash) {
  return bcrypt.compare(password, hash);
}

function signToken(user) {
  return jwt.sign({ sub: user.id, email: user.email }, JWT_SECRET, { expiresIn: TOKEN_TTL });
}

function verifyToken(token) {
  return jwt.verify(token, JWT_SECRET);
}

function authMiddleware(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;

  if (!token) {
    res.status(401).json({ error: 'Authentication required.' });
    return;
  }

  try {
    const payload = verifyToken(token);
    req.userId = payload.sub;
    next();
  } catch {
    res.status(401).json({ error: 'Invalid or expired session.' });
  }
}

async function adminMiddleware(req, res, next) {
  try {
    const { rows } = await query('SELECT id, email FROM users WHERE id = $1', [req.userId]);
    const user = rows[0];

    if (!user || !isAdminEmail(user.email)) {
      res.status(403).json({ error: 'Admin access required.' });
      return;
    }

    req.adminUser = user;
    next();
  } catch (err) {
    next(err);
  }
}

function publicUser(row) {
  return {
    id: row.id,
    email: row.email,
    displayName: row.display_name,
    country: row.country || null,
    city: row.city || null,
    authMethod: row.google_id ? 'google' : 'email',
    isAdmin: isAdminEmail(row.email),
    createdAt: row.created_at,
  };
}

function adminUser(row) {
  return {
    id: row.id,
    email: row.email,
    displayName: row.display_name,
    country: row.country || null,
    city: row.city || null,
    authMethod: row.google_id ? 'google' : 'email',
    createdAt: row.created_at,
  };
}

module.exports = {
  hashPassword,
  verifyPassword,
  signToken,
  verifyToken,
  authMiddleware,
  adminMiddleware,
  isAdminEmail,
  publicUser,
  adminUser,
};
