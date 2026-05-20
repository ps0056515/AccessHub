const express = require('express');
const { getDb } = require('../db');
const {
  hashPassword,
  verifyPassword,
  signToken,
  authMiddleware,
  publicUser,
} = require('../auth');
const { verifyGoogleToken } = require('../google');

const router = express.Router();
const USER_SELECT =
  'SELECT id, email, password_hash, display_name, google_id, country, city, created_at FROM users';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function normalizeLocation(value) {
  return value?.trim() || null;
}

function validateSignUp({ email, password, displayName, country, city }) {
  if (!email?.trim() || !EMAIL_RE.test(email.trim())) {
    return 'Enter a valid email address.';
  }
  if (!displayName?.trim() || displayName.trim().length < 2) {
    return 'Display name must be at least 2 characters.';
  }
  if (!password || password.length < 8) {
    return 'Password must be at least 8 characters.';
  }
  if (!country?.trim()) {
    return 'Country is required.';
  }
  if (!city?.trim()) {
    return 'City is required.';
  }
  return null;
}

router.post('/signup', async (req, res) => {
  const { email, password, displayName, country, city } = req.body || {};
  const validationError = validateSignUp({ email, password, displayName, country, city });
  if (validationError) {
    res.status(400).json({ error: validationError });
    return;
  }

  const db = getDb();
  const normalizedEmail = email.trim().toLowerCase();
  const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(normalizedEmail);
  if (existing) {
    res.status(409).json({ error: 'An account with this email already exists.' });
    return;
  }

  try {
    const passwordHash = await hashPassword(password);
    const result = db
      .prepare(
        'INSERT INTO users (email, password_hash, display_name, country, city) VALUES (?, ?, ?, ?, ?)'
      )
      .run(
        normalizedEmail,
        passwordHash,
        displayName.trim(),
        normalizeLocation(country),
        normalizeLocation(city)
      );

    const user = db.prepare(`${USER_SELECT} WHERE id = ?`).get(result.lastInsertRowid);
    const token = signToken(user);
    res.status(201).json({ token, user: publicUser(user) });
  } catch (err) {
    console.error('Signup error:', err);
    res.status(500).json({ error: 'Could not create account. Please try again.' });
  }
});

router.post('/signin', async (req, res) => {
  const { email, password } = req.body || {};
  if (!email?.trim() || !password) {
    res.status(400).json({ error: 'Email and password are required.' });
    return;
  }

  const db = getDb();
  const user = db.prepare(`${USER_SELECT} WHERE email = ?`).get(email.trim().toLowerCase());

  if (!user) {
    res.status(401).json({ error: 'Invalid email or password.' });
    return;
  }

  if (!user.password_hash) {
    res.status(401).json({ error: 'This account uses Google sign-in. Please continue with Google.' });
    return;
  }

  const valid = await verifyPassword(password, user.password_hash);
  if (!valid) {
    res.status(401).json({ error: 'Invalid email or password.' });
    return;
  }

  const token = signToken(user);
  res.json({ token, user: publicUser(user) });
});

router.post('/google', async (req, res) => {
  const { credential, country, city } = req.body || {};
  if (!credential) {
    res.status(400).json({ error: 'Google credential is required.' });
    return;
  }

  const clientId = process.env.GOOGLE_CLIENT_ID;
  if (!clientId) {
    res.status(503).json({ error: 'Google sign-in is not configured on the server.' });
    return;
  }

  try {
    const payload = await verifyGoogleToken(credential, clientId);
    const googleId = payload.sub;
    const email = payload.email?.trim().toLowerCase();
    const displayName =
      payload.name?.trim() ||
      payload.given_name?.trim() ||
      (email ? email.split('@')[0] : 'User');

    if (!email || !payload.email_verified) {
      res.status(400).json({ error: 'A verified Google email is required.' });
      return;
    }

    const db = getDb();
    let user = db.prepare(`${USER_SELECT} WHERE google_id = ?`).get(googleId);
    let isNew = false;

    if (!user) {
      const byEmail = db.prepare(`${USER_SELECT} WHERE email = ?`).get(email);
      if (byEmail) {
        if (byEmail.google_id && byEmail.google_id !== googleId) {
          res.status(409).json({ error: 'This email is linked to a different Google account.' });
          return;
        }
        db.prepare('UPDATE users SET google_id = ? WHERE id = ?').run(googleId, byEmail.id);
        user = db.prepare(`${USER_SELECT} WHERE id = ?`).get(byEmail.id);
      } else {
        isNew = true;
        const result = db
          .prepare(
            'INSERT INTO users (email, password_hash, display_name, google_id, country, city) VALUES (?, ?, ?, ?, ?, ?)'
          )
          .run(
            email,
            '',
            displayName,
            googleId,
            normalizeLocation(country),
            normalizeLocation(city)
          );
        user = db.prepare(`${USER_SELECT} WHERE id = ?`).get(result.lastInsertRowid);
      }
    }

    if (country?.trim() || city?.trim()) {
      db.prepare('UPDATE users SET country = COALESCE(?, country), city = COALESCE(?, city) WHERE id = ?').run(
        normalizeLocation(country),
        normalizeLocation(city),
        user.id
      );
      user = db.prepare(`${USER_SELECT} WHERE id = ?`).get(user.id);
    }

    const token = signToken(user);
    const profile = publicUser(user);
    res.json({
      token,
      user: profile,
      needsLocation: !profile.country || !profile.city,
      isNew,
    });
  } catch (err) {
    console.error('Google auth error:', err);
    res.status(401).json({ error: 'Google sign-in failed. Please try again.' });
  }
});

router.patch('/profile', authMiddleware, (req, res) => {
  const { country, city } = req.body || {};
  if (!country?.trim() || !city?.trim()) {
    res.status(400).json({ error: 'Country and city are required.' });
    return;
  }

  const db = getDb();
  db.prepare('UPDATE users SET country = ?, city = ? WHERE id = ?').run(
    normalizeLocation(country),
    normalizeLocation(city),
    req.userId
  );

  const user = db.prepare(`${USER_SELECT} WHERE id = ?`).get(req.userId);
  if (!user) {
    res.status(404).json({ error: 'User not found.' });
    return;
  }

  res.json({ user: publicUser(user) });
});

router.get('/me', authMiddleware, (req, res) => {
  const db = getDb();
  const user = db.prepare(`${USER_SELECT} WHERE id = ?`).get(req.userId);

  if (!user) {
    res.status(404).json({ error: 'User not found.' });
    return;
  }

  const profile = publicUser(user);
  res.json({
    user: profile,
    needsLocation: !profile.country || !profile.city,
  });
});

router.post('/signout', (_req, res) => {
  res.json({ ok: true });
});

router.get('/config', (_req, res) => {
  res.json({
    googleClientId: process.env.GOOGLE_CLIENT_ID || null,
  });
});

module.exports = router;
