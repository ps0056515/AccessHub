const express = require('express');
const { query } = require('../db');
const {
  hashPassword,
  verifyPassword,
  signToken,
  authMiddleware,
  publicUser,
} = require('../auth');
const { verifyGoogleToken } = require('../google');

const router = express.Router();
const USER_RETURNING =
  'id, email, password_hash, display_name, google_id, country, city, created_at';
const USER_SELECT = `SELECT ${USER_RETURNING} FROM users`;

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

router.post('/signup', async (req, res, next) => {
  const { email, password, displayName, country, city } = req.body || {};
  const validationError = validateSignUp({ email, password, displayName, country, city });
  if (validationError) {
    res.status(400).json({ error: validationError });
    return;
  }

  const normalizedEmail = email.trim().toLowerCase();

  try {
    const existing = await query('SELECT id FROM users WHERE LOWER(email) = $1', [
      normalizedEmail,
    ]);
    if (existing.rows.length > 0) {
      res.status(409).json({ error: 'An account with this email already exists.' });
      return;
    }

    const passwordHash = await hashPassword(password);
    const inserted = await query(
      `INSERT INTO users (email, password_hash, display_name, country, city)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING ${USER_RETURNING}`,
      [
        normalizedEmail,
        passwordHash,
        displayName.trim(),
        normalizeLocation(country),
        normalizeLocation(city),
      ],
    );

    const user = inserted.rows[0];
    const token = signToken(user);
    res.status(201).json({ token, user: publicUser(user) });
  } catch (err) {
    if (err.code === '23505') {
      res.status(409).json({ error: 'An account with this email already exists.' });
      return;
    }
    next(err);
  }
});

router.post('/signin', async (req, res, next) => {
  const { email, password } = req.body || {};
  if (!email?.trim() || !password) {
    res.status(400).json({ error: 'Email and password are required.' });
    return;
  }

  try {
    const { rows } = await query(`${USER_SELECT} WHERE LOWER(email) = $1`, [
      email.trim().toLowerCase(),
    ]);
    const user = rows[0];

    if (!user) {
      res.status(401).json({ error: 'Invalid email or password.' });
      return;
    }

    if (!user.password_hash) {
      res
        .status(401)
        .json({ error: 'This account uses Google sign-in. Please continue with Google.' });
      return;
    }

    const valid = await verifyPassword(password, user.password_hash);
    if (!valid) {
      res.status(401).json({ error: 'Invalid email or password.' });
      return;
    }

    const token = signToken(user);
    res.json({ token, user: publicUser(user) });
  } catch (err) {
    next(err);
  }
});

router.post('/google', async (req, res, next) => {
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

    let { rows } = await query(`${USER_SELECT} WHERE google_id = $1`, [googleId]);
    let user = rows[0];
    let isNew = false;

    if (!user) {
      const byEmail = await query(`${USER_SELECT} WHERE LOWER(email) = $1`, [email]);
      const existing = byEmail.rows[0];

      if (existing) {
        if (existing.google_id && existing.google_id !== googleId) {
          res.status(409).json({ error: 'This email is linked to a different Google account.' });
          return;
        }
        await query('UPDATE users SET google_id = $1 WHERE id = $2', [googleId, existing.id]);
        const updated = await query(`${USER_SELECT} WHERE id = $1`, [existing.id]);
        user = updated.rows[0];
      } else {
        isNew = true;
        const inserted = await query(
          `INSERT INTO users (email, password_hash, display_name, google_id, country, city)
           VALUES ($1, '', $2, $3, $4, $5)
           RETURNING ${USER_RETURNING}`,
          [email, displayName, googleId, normalizeLocation(country), normalizeLocation(city)],
        );
        user = inserted.rows[0];
      }
    }

    if (country?.trim() || city?.trim()) {
      await query(
        `UPDATE users SET country = COALESCE($1, country), city = COALESCE($2, city) WHERE id = $3`,
        [normalizeLocation(country), normalizeLocation(city), user.id],
      );
      const updated = await query(`${USER_SELECT} WHERE id = $1`, [user.id]);
      user = updated.rows[0];
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

router.patch('/profile', authMiddleware, async (req, res, next) => {
  const { country, city } = req.body || {};
  if (!country?.trim() || !city?.trim()) {
    res.status(400).json({ error: 'Country and city are required.' });
    return;
  }

  try {
    await query('UPDATE users SET country = $1, city = $2 WHERE id = $3', [
      normalizeLocation(country),
      normalizeLocation(city),
      req.userId,
    ]);

    const { rows } = await query(`${USER_SELECT} WHERE id = $1`, [req.userId]);
    const user = rows[0];

    if (!user) {
      res.status(404).json({ error: 'User not found.' });
      return;
    }

    res.json({ user: publicUser(user) });
  } catch (err) {
    next(err);
  }
});

router.get('/me', authMiddleware, async (req, res, next) => {
  try {
    const { rows } = await query(`${USER_SELECT} WHERE id = $1`, [req.userId]);
    const user = rows[0];

    if (!user) {
      res.status(404).json({ error: 'User not found.' });
      return;
    }

    const profile = publicUser(user);
    res.json({
      user: profile,
      needsLocation: !profile.country || !profile.city,
    });
  } catch (err) {
    next(err);
  }
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
