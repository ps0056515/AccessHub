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
const { generateResetToken, hashResetToken, resetExpiresAt } = require('../passwordReset');
const { sendPasswordResetEmail, sendOtpEmail, buildResetUrl } = require('../email');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

function generateOtp() {
  return crypto.randomInt(100000, 999999).toString();
}

const router = express.Router();
const GENERIC_RESET_MESSAGE =
  'If an account exists for that email, we sent password reset instructions.';
const USER_RETURNING =
  'id, email, password_hash, display_name, google_id, country, city, company, designation, role, bio, avatar_url, is_admin, is_blocked, created_at, is_verified, otp_hash, otp_expires_at';
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
  const { email, password, displayName, country, city, company, designation } = req.body || {};
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
    const otp = generateOtp();
    const otpHash = await hashPassword(otp);
    const otpExpiresAt = new Date(Date.now() + 2 * 60 * 1000).toISOString();

    const inserted = await query(
      `INSERT INTO users (email, password_hash, display_name, country, city, company, designation, is_verified, otp_hash, otp_expires_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, false, $8, $9)
       RETURNING ${USER_RETURNING}`,
      [
        normalizedEmail,
        passwordHash,
        displayName.trim(),
        normalizeLocation(country),
        normalizeLocation(city),
        company?.trim() || null,
        designation?.trim() || null,
        otpHash,
        otpExpiresAt
      ],
    );

    const user = inserted.rows[0];
    
    try {
      await sendOtpEmail({
        to: user.email,
        otp,
        displayName: user.display_name,
      });
    } catch (mailErr) {
      console.error('OTP email failed:', mailErr);
      // We still return success but maybe log the error. The user can resend.
    }

    res.status(201).json({ message: "OTP sent.", email: user.email, needsVerification: true });
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

    if (user.is_blocked) {
      res.status(403).json({ error: 'Your account has been blocked by an administrator.' });
      return;
    }

    if (!user.is_verified) {
      res.status(401).json({ error: 'Please verify your email address. Request a new OTP if needed.', needsVerification: true, email: user.email });
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
  const { credential, country, city, company, designation } = req.body || {};
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
          `INSERT INTO users (email, password_hash, display_name, google_id, country, city, company, designation, is_verified)
           VALUES ($1, '', $2, $3, $4, $5, $6, $7, true)
           RETURNING ${USER_RETURNING}`,
          [email, displayName, googleId, normalizeLocation(country), normalizeLocation(city), company?.trim() || null, designation?.trim() || null],
        );
        user = inserted.rows[0];
      }
    }

    if (user.is_blocked) {
      res.status(403).json({ error: 'Your account has been blocked by an administrator.' });
      return;
    }

    if (country?.trim() || city?.trim() || company?.trim()) {
      await query(
        `UPDATE users SET country = COALESCE($1, country), city = COALESCE($2, city), company = COALESCE($3, company) WHERE id = $4`,
        [normalizeLocation(country), normalizeLocation(city), company?.trim() || null, user.id],
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
  const { displayName, role, bio, company, designation, country, city } = req.body || {};

  const updates = [];
  const values = [];
  let paramCount = 1;

  if (displayName !== undefined) {
    if (!displayName.trim()) {
      return res.status(400).json({ error: 'Display name cannot be empty.' });
    }
    updates.push(`display_name = $${paramCount++}`);
    values.push(displayName.trim());
  }
  if (role !== undefined) {
    updates.push(`role = $${paramCount++}`);
    values.push(role.trim());
  }
  if (bio !== undefined) {
    updates.push(`bio = $${paramCount++}`);
    values.push(bio.trim());
  }
  if (company !== undefined) {
    updates.push(`company = $${paramCount++}`);
    values.push(company.trim());
  }
  if (designation !== undefined) {
    updates.push(`designation = $${paramCount++}`);
    values.push(designation.trim());
  }
  if (country !== undefined) {
    if (!country.trim()) {
      return res.status(400).json({ error: 'Country cannot be empty.' });
    }
    updates.push(`country = $${paramCount++}`);
    values.push(normalizeLocation(country));
  }
  if (city !== undefined) {
    if (!city.trim()) {
      return res.status(400).json({ error: 'City cannot be empty.' });
    }
    updates.push(`city = $${paramCount++}`);
    values.push(normalizeLocation(city));
  }

  if (updates.length === 0) {
    return res.status(400).json({ error: 'No fields to update.' });
  }

  values.push(req.userId);
  const queryStr = `UPDATE users SET ${updates.join(', ')} WHERE id = $${paramCount}`;

  try {
    await query(queryStr, values);

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

// POST /api/auth/avatar — Upload profile photo (base64 data URI)
router.post('/avatar', authMiddleware, async (req, res, next) => {
  const { data } = req.body || {};
  if (!data) {
    return res.status(400).json({ error: 'Image data is required.' });
  }

  const match = data.match(/^data:image\/(png|jpe?g|webp|gif);base64,(.+)$/);
  if (!match) {
    return res.status(400).json({ error: 'Invalid image format. Use PNG, JPEG, WebP, or GIF.' });
  }

  const ext = match[1] === 'jpeg' ? 'jpg' : match[1];
  const base64Data = match[2];
  const buffer = Buffer.from(base64Data, 'base64');

  if (buffer.length > 2 * 1024 * 1024) {
    return res.status(400).json({ error: 'Image must be smaller than 2 MB.' });
  }

  try {
    const avatarsDir = path.join(__dirname, '..', 'uploads', 'avatars');
    if (!fs.existsSync(avatarsDir)) {
      fs.mkdirSync(avatarsDir, { recursive: true });
    }

    // Delete old avatar file if it exists
    const { rows: oldRows } = await query('SELECT avatar_url FROM users WHERE id = $1', [req.userId]);
    if (oldRows[0]?.avatar_url?.startsWith('/api/uploads/')) {
      const oldFile = path.join(__dirname, '..', 'uploads', path.basename(oldRows[0].avatar_url.replace('/api/uploads/avatars/', '')));
      const oldAvatarFile = path.join(avatarsDir, path.basename(oldRows[0].avatar_url));
      try { if (fs.existsSync(oldAvatarFile)) fs.unlinkSync(oldAvatarFile); } catch { /* ignore */ }
    }

    const filename = `avatar_${req.userId}_${Date.now()}.${ext}`;
    const filePath = path.join(avatarsDir, filename);
    fs.writeFileSync(filePath, buffer);

    const avatarUrl = `/api/uploads/avatars/${filename}`;
    await query('UPDATE users SET avatar_url = $1, updated_at = NOW() WHERE id = $2', [avatarUrl, req.userId]);

    const { rows } = await query(`${USER_SELECT} WHERE id = $1`, [req.userId]);
    res.json({ user: publicUser(rows[0]) });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/auth/avatar — Remove profile photo
router.delete('/avatar', authMiddleware, async (req, res, next) => {
  try {
    const { rows: oldRows } = await query('SELECT avatar_url FROM users WHERE id = $1', [req.userId]);
    const oldUrl = oldRows[0]?.avatar_url;

    if (oldUrl?.startsWith('/api/uploads/avatars/')) {
      const avatarsDir = path.join(__dirname, '..', 'uploads', 'avatars');
      const oldFile = path.join(avatarsDir, path.basename(oldUrl));
      try { if (fs.existsSync(oldFile)) fs.unlinkSync(oldFile); } catch { /* ignore */ }
    }

    await query("UPDATE users SET avatar_url = '', updated_at = NOW() WHERE id = $1", [req.userId]);

    const { rows } = await query(`${USER_SELECT} WHERE id = $1`, [req.userId]);
    res.json({ user: publicUser(rows[0]) });
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

    const { rows: statsRows } = await query(`
      SELECT 
        (SELECT COUNT(*) FROM posts p WHERE p.user_id = $1) as discussions_count,
        (SELECT COUNT(*) FROM comments c WHERE c.user_id = $1) as comments_count,
        (SELECT COALESCE(SUM(votes), 0) FROM posts p WHERE p.user_id = $1) as reputation
    `, [req.userId]);
    const stats = statsRows[0] || {};
    
    profile.discussionsCount = parseInt(stats.discussions_count || 0, 10);
    profile.commentsCount = parseInt(stats.comments_count || 0, 10);
    profile.reputation = parseInt(stats.reputation || 0, 10);

    res.json({
      user: profile,
      needsLocation: !profile.country || !profile.city,
    });
  } catch (err) {
    next(err);
  }
});

router.post('/forgot-password', async (req, res, next) => {
  const { email } = req.body || {};
  if (!email?.trim() || !EMAIL_RE.test(email.trim())) {
    res.status(400).json({ error: 'Enter a valid email address.' });
    return;
  }

  const normalizedEmail = email.trim().toLowerCase();

  try {
    const { rows } = await query(`${USER_SELECT} WHERE LOWER(email) = $1`, [normalizedEmail]);
    const user = rows[0];

    if (user?.password_hash) {
      const token = generateResetToken();
      const tokenHash = hashResetToken(token);
      const expiresAt = resetExpiresAt();

      await query(
        `UPDATE users
         SET password_reset_token_hash = $1, password_reset_expires_at = $2
         WHERE id = $3`,
        [tokenHash, expiresAt.toISOString(), user.id],
      );

      const reqOrigin = req.headers.origin || (req.headers.referer ? new URL(req.headers.referer).origin : null);
      const resetUrl = buildResetUrl(token, reqOrigin);
      try {
        await sendPasswordResetEmail({
          to: user.email,
          resetUrl,
          displayName: user.display_name,
        });
      } catch (mailErr) {
        console.error('Password reset email failed:', mailErr);
        await query(
          `UPDATE users
           SET password_reset_token_hash = NULL, password_reset_expires_at = NULL
           WHERE id = $1`,
          [user.id],
        );
        res.status(503).json({
          error:
            'Could not send the reset email. Check SMTP settings or try again later.',
        });
        return;
      }
    }

    res.json({ message: GENERIC_RESET_MESSAGE });
  } catch (err) {
    if (err.code === '42703') {
      res.status(503).json({
        error: 'Password reset is not set up. Run npm run db:migrate and restart the API server.',
      });
      return;
    }
    next(err);
  }
});

router.post('/reset-password', async (req, res, next) => {
  const { token, password } = req.body || {};
  if (!token?.trim()) {
    res.status(400).json({ error: 'Reset link is invalid or expired.' });
    return;
  }
  if (!password || password.length < 8) {
    res.status(400).json({ error: 'Password must be at least 8 characters.' });
    return;
  }

  const tokenHash = hashResetToken(token.trim());

  try {
    const { rows } = await query(
      `${USER_SELECT}
       WHERE password_reset_token_hash = $1
         AND password_reset_expires_at IS NOT NULL
         AND password_reset_expires_at > NOW()`,
      [tokenHash],
    );
    const user = rows[0];

    if (!user) {
      res.status(400).json({ error: 'Reset link is invalid or expired.' });
      return;
    }

    const passwordHash = await hashPassword(password);
    await query(
      `UPDATE users
       SET password_hash = $1,
           password_reset_token_hash = NULL,
           password_reset_expires_at = NULL
       WHERE id = $2`,
      [passwordHash, user.id],
    );

    res.json({ message: 'Your password has been updated. You can sign in with your new password.' });
  } catch (err) {
    next(err);
  }
});

router.post('/verify-otp', async (req, res, next) => {
  const { email, otp } = req.body || {};
  if (!email || !otp) {
    return res.status(400).json({ error: 'Email and OTP are required.' });
  }

  try {
    const { rows } = await query(
      `${USER_SELECT} WHERE LOWER(email) = $1 AND otp_expires_at > NOW()`,
      [email.trim().toLowerCase()]
    );
    const user = rows[0];

    if (!user) {
      return res.status(400).json({ error: 'Invalid or expired OTP.' });
    }

    const valid = await verifyPassword(otp, user.otp_hash);
    if (!valid) {
      return res.status(400).json({ error: 'Invalid or expired OTP.' });
    }

    await query(
      `UPDATE users SET is_verified = true, otp_hash = NULL, otp_expires_at = NULL WHERE id = $1`,
      [user.id]
    );

    const updated = await query(`${USER_SELECT} WHERE id = $1`, [user.id]);
    const verifiedUser = updated.rows[0];
    const token = signToken(verifiedUser);
    res.json({ token, user: publicUser(verifiedUser) });
  } catch (err) {
    next(err);
  }
});

router.post('/resend-otp', async (req, res, next) => {
  const { email } = req.body || {};
  if (!email) {
    return res.status(400).json({ error: 'Email is required.' });
  }

  try {
    const { rows } = await query(`${USER_SELECT} WHERE LOWER(email) = $1`, [email.trim().toLowerCase()]);
    const user = rows[0];

    if (!user) {
      return res.json({ message: "If that email is registered, a new OTP has been sent." });
    }
    if (user.is_verified) {
      return res.status(400).json({ error: 'This account is already verified. Please sign in.' });
    }

    const otp = generateOtp();
    const otpHash = await hashPassword(otp);
    const otpExpiresAt = new Date(Date.now() + 2 * 60 * 1000).toISOString();

    await query(
      `UPDATE users SET otp_hash = $1, otp_expires_at = $2 WHERE id = $3`,
      [otpHash, otpExpiresAt, user.id]
    );

    try {
      await sendOtpEmail({
        to: user.email,
        otp,
        displayName: user.display_name,
      });
    } catch (mailErr) {
      console.error('Resend OTP email failed:', mailErr);
      return res.status(503).json({ error: 'Could not send the OTP email. Try again later.' });
    }

    res.json({ message: "A new OTP has been sent." });
  } catch (err) {
    next(err);
  }
});

router.get('/check-email', async (req, res, next) => {
  const { email } = req.query;
  if (!email?.trim()) {
    return res.json({ exists: false });
  }
  try {
    const normalizedEmail = email.trim().toLowerCase();
    const existing = await query('SELECT id FROM users WHERE LOWER(email) = $1', [normalizedEmail]);
    res.json({ exists: existing.rows.length > 0 });
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
