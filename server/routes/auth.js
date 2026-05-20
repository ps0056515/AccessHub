const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const pool = require("../db/pool");
const config = require("../config");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();
const BCRYPT_ROUNDS = 12;

function normalizeEmail(email) {
  return String(email || "")
    .trim()
    .toLowerCase();
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function displayNameFromEmail(email) {
  const local = email.split("@")[0] || "member";
  return local
    .replace(/[._-]+/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase())
    .slice(0, 120);
}

function signToken(user) {
  return jwt.sign({ sub: user.id, email: user.email }, config.jwtSecret, {
    expiresIn: "7d",
  });
}

function publicUser(row) {
  return {
    id: row.id,
    email: row.email,
    displayName: row.display_name,
    createdAt: row.created_at,
  };
}

router.post("/register", async (req, res) => {
  try {
    const email = normalizeEmail(req.body?.email);
    const password = String(req.body?.password || "");
    const displayName = String(req.body?.displayName || "").trim();

    if (!isValidEmail(email)) {
      return res.status(400).json({ error: "Valid email is required" });
    }
    if (password.length < 8) {
      return res.status(400).json({ error: "Password must be at least 8 characters" });
    }

    const name = displayName || displayNameFromEmail(email);
    const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);

    const { rows } = await pool.query(
      `INSERT INTO users (email, password_hash, display_name)
       VALUES ($1, $2, $3)
       RETURNING id, email, display_name, created_at`,
      [email, passwordHash, name],
    );

    const user = rows[0];
    const token = signToken(user);

    return res.status(201).json({ user: publicUser(user), token });
  } catch (err) {
    if (err.code === "23505") {
      return res.status(409).json({ error: "An account with this email already exists" });
    }
    console.error("register error", err);
    return res.status(500).json({ error: "Registration failed" });
  }
});

router.post("/login", async (req, res) => {
  try {
    const email = normalizeEmail(req.body?.email);
    const password = String(req.body?.password || "");

    if (!isValidEmail(email) || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    const { rows } = await pool.query(
      "SELECT id, email, password_hash, display_name, created_at FROM users WHERE email = $1",
      [email],
    );

    if (rows.length === 0) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const user = rows[0];
    const ok = await bcrypt.compare(password, user.password_hash);
    if (!ok) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const token = signToken(user);

    return res.json({ user: publicUser(user), token });
  } catch (err) {
    console.error("login error", err);
    return res.status(500).json({ error: "Login failed" });
  }
});

router.post("/logout", (_req, res) => res.json({ ok: true }));

router.get("/me", requireAuth, (req, res) => {
  return res.json({ user: publicUser(req.user) });
});

module.exports = router;
