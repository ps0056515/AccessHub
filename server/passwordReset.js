const crypto = require('crypto');

const RESET_TOKEN_BYTES = 32;
const DEFAULT_RESET_TTL_MS = 60 * 60 * 1000;

function getResetTtlMs() {
  const hours = Number(process.env.PASSWORD_RESET_TTL_HOURS);
  if (Number.isFinite(hours) && hours > 0) {
    return hours * 60 * 60 * 1000;
  }
  return DEFAULT_RESET_TTL_MS;
}

function generateResetToken() {
  return crypto.randomBytes(RESET_TOKEN_BYTES).toString('hex');
}

function hashResetToken(token) {
  return crypto.createHash('sha256').update(String(token)).digest('hex');
}

function resetExpiresAt() {
  return new Date(Date.now() + getResetTtlMs());
}

module.exports = {
  generateResetToken,
  hashResetToken,
  resetExpiresAt,
  getResetTtlMs,
};
