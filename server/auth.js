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
  const normalized = email.trim().toLowerCase();
  return getAdminEmails().includes(normalized);
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



async function authMiddleware(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;

  if (!token) {
    res.status(401).json({ error: 'Authentication required.' });
    return;
  }

  try {
    const payload = verifyToken(token);
    
    // Immediate revocation check
    const { rows } = await query('SELECT is_blocked FROM users WHERE id = $1', [payload.sub]);
    if (rows.length === 0 || rows[0].is_blocked) {
      res.status(401).json({ error: 'Your account has been blocked by an administrator.' });
      return;
    }

    req.userId = payload.sub;
    next();
  } catch {
    res.status(401).json({ error: 'Invalid or expired session.' });
  }
}

async function optionalAuthMiddleware(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;

  if (!token) {
    return next();
  }

  try {
    const payload = verifyToken(token);
    const { rows } = await query('SELECT is_blocked FROM users WHERE id = $1', [payload.sub]);
    if (rows.length > 0 && !rows[0].is_blocked) {
      req.userId = payload.sub;
    }
  } catch {
    // Ignore invalid tokens for optional auth
  }
  next();
}

async function adminMiddleware(req, res, next) {
  if (!req.userId) {
    const header = req.headers.authorization || '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : null;

    if (!token) {
      res.status(401).json({ error: 'Authentication required.' });
      return;
    }

    try {
      const payload = verifyToken(token);
      req.userId = payload.sub;
    } catch {
      res.status(401).json({ error: 'Invalid or expired session.' });
      return;
    }
  }


  try {
    const { rows } = await query('SELECT id, email, is_admin FROM users WHERE id = $1', [req.userId]);
    const user = rows[0];

    if (!user || (!user.is_admin && !isAdminEmail(user.email))) {
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
    company: row.company || null,
    designation: row.designation || null,
    role: row.role || null,
    bio: row.bio || null,
    authMethod: row.google_id ? 'google' : 'email',
    isAdmin: Boolean(row.is_admin) || isAdminEmail(row.email),
    isBlocked: Boolean(row.is_blocked),
    createdAt: row.created_at,
    updated_at: row.updated_at,
  };
}

function adminUser(row) {
  return {
    id: row.id,
    email: row.email,
    displayName: row.display_name,
    country: row.country || null,
    city: row.city || null,
    company: row.company || null,
    designation: row.designation || null,
    authMethod: row.google_id ? 'google' : 'email',
    isAdmin: Boolean(row.is_admin) || isAdminEmail(row.email),
    isBlocked: Boolean(row.is_blocked),
    createdAt: row.created_at,
    updated_at: row.updated_at,
  };
}

module.exports = {
  hashPassword,
  verifyPassword,
  signToken,
  verifyToken,
  authMiddleware,
  adminMiddleware,
  optionalAuthMiddleware,
  isAdminEmail,
  publicUser,
  adminUser,
};
