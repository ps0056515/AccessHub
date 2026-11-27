const rateLimit = require('express-rate-limit');

const WEAK_JWT_SECRETS = new Set([
  'dev-only-change-in-production',
  'change-me-in-production',
  'replace-with-a-long-random-secret',
]);

const DEFAULT_PROD_ORIGINS = [
  'https://allcanaccess.com',
  'https://www.allcanaccess.com',
];

const DEFAULT_DEV_ORIGINS = [
  'http://localhost:3010',
  'http://127.0.0.1:3010',
  'http://localhost:3015',
  'http://127.0.0.1:3015',
];

const LAN_DEV_ORIGIN_RE = /^http:\/\/(10\.\d{1,3}\.\d{1,3}\.\d{1,3}|192\.168\.\d{1,3}\.\d{1,3}|172\.(1[6-9]|2\d|3[01])\.\d{1,3}\.\d{1,3}):301[05]$/;

/** Safely parse a URL or origin string and return its canonical origin, or null. */
function normalizeOrigin(raw) {
  if (!raw || typeof raw !== 'string') return null;
  try {
    return new URL(raw.trim()).origin;
  } catch {
    return null;
  }
}

/** Build the set of trusted application origins from environment and defaults. */
function getAllowedOrigins() {
  const allowed = new Set(DEFAULT_PROD_ORIGINS);
  if (process.env.NODE_ENV !== 'production') {
    DEFAULT_DEV_ORIGINS.forEach((o) => allowed.add(o));
  }

  [process.env.APP_URL, process.env.FRONTEND_URL, process.env.REACT_APP_APP_URL].forEach((val) => {
    const origin = normalizeOrigin(val);
    if (origin) allowed.add(origin);
  });

  if (process.env.CLIENT_ORIGIN) {
    process.env.CLIENT_ORIGIN.split(',').forEach((entry) => {
      const origin = normalizeOrigin(entry);
      if (origin) allowed.add(origin);
    });
  }

  return allowed;
}

/** Strict origin check for security-sensitive links such as password reset emails. */
function isTrustedResetOrigin(raw) {
  const origin = normalizeOrigin(raw);
  return Boolean(origin && getAllowedOrigins().has(origin));
}

/** Allow configured origins plus private-LAN :3010/:3015 when developing locally. */
function isAllowedCorsOrigin(origin) {
  if (!origin) return true;
  if (getAllowedOrigins().has(origin)) return true;
  if (process.env.NODE_ENV !== 'production' && LAN_DEV_ORIGIN_RE.test(origin)) {
    return true;
  }
  return false;
}

function corsOriginHandler(origin, callback) {
  callback(null, isAllowedCorsOrigin(origin));
}

function createLimiter({ windowMs, max, error }) {
  return rateLimit({
    windowMs,
    max,
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    message: { error },
  });
}

const apiLimiter = createLimiter({
  windowMs: 15 * 60 * 1000,
  max: 600,
  error: 'Too many requests. Please slow down and try again shortly.',
});

const authAttemptLimiter = createLimiter({
  windowMs: 15 * 60 * 1000,
  max: 20,
  error: 'Too many authentication attempts. Please wait 15 minutes and try again.',
});

const authEmailLimiter = createLimiter({
  windowMs: 15 * 60 * 1000,
  max: 10,
  error: 'Too many email or OTP requests. Please wait 15 minutes and try again.',
});

/** Warn loudly at startup if JWT_SECRET is unset or uses a known placeholder. */
function checkJwtSecretSecurity() {
  const secret = (process.env.JWT_SECRET || '').trim();
  if (!secret || WEAK_JWT_SECRETS.has(secret) || secret.length < 24) {
    console.error(
      '[SECURITY WARNING] JWT_SECRET is missing, weak, or using a default placeholder. ' +
      'Set a strong random JWT_SECRET (32+ chars) in your server environment.'
    );
  }
}

module.exports = {
  normalizeOrigin,
  getAllowedOrigins,
  isTrustedResetOrigin,
  isAllowedCorsOrigin,
  corsOriginHandler,
  apiLimiter,
  authAttemptLimiter,
  authEmailLimiter,
  checkJwtSecretSecurity,
};
