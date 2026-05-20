const nodemailer = require('nodemailer');

let transporter;

function getAppOrigin() {
  const origin =
    process.env.APP_URL ||
    process.env.FRONTEND_URL ||
    process.env.REACT_APP_APP_URL ||
    'http://localhost:3010';
  return origin.replace(/\/$/, '');
}

function getTransporter() {
  if (transporter !== undefined) return transporter;

  const host = process.env.SMTP_HOST?.trim();
  if (!host) {
    transporter = null;
    return null;
  }

  transporter = nodemailer.createTransport({
    host,
    port: Number(process.env.SMTP_PORT || 587),
    secure: process.env.SMTP_SECURE === 'true',
    auth:
      process.env.SMTP_USER && process.env.SMTP_PASS
        ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
        : undefined,
  });
  return transporter;
}

async function sendPasswordResetEmail({ to, resetUrl, displayName }) {
  const from = process.env.EMAIL_FROM || 'AccessHub <noreply@accesshub.local>';
  const name = displayName || 'there';
  const subject = 'Reset your AccessHub password';
  const text = `Hi ${name},

We received a request to reset your AccessHub password.

Open this link to choose a new password (expires in ${process.env.PASSWORD_RESET_TTL_HOURS || 1} hour(s)):
${resetUrl}

If you did not request this, you can ignore this email.

— AccessHub`;

  const html = `<p>Hi ${escapeHtml(name)},</p>
<p>We received a request to reset your AccessHub password.</p>
<p><a href="${escapeAttr(resetUrl)}">Reset your password</a></p>
<p>This link expires in ${escapeHtml(String(process.env.PASSWORD_RESET_TTL_HOURS || 1))} hour(s).</p>
<p>If you did not request this, you can ignore this email.</p>
<p>— AccessHub</p>`;

  const transport = getTransporter();
  if (!transport) {
    console.log('[password-reset] SMTP not configured — reset link for', to);
    console.log(resetUrl);
    return { delivered: false, mode: 'console' };
  }

  await transport.sendMail({ from, to, subject, text, html });
  return { delivered: true, mode: 'smtp' };
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function escapeAttr(value) {
  return escapeHtml(value).replace(/'/g, '&#39;');
}

function buildResetUrl(token) {
  return `${getAppOrigin()}/reset-password?token=${encodeURIComponent(token)}`;
}

module.exports = {
  sendPasswordResetEmail,
  buildResetUrl,
  getAppOrigin,
};
