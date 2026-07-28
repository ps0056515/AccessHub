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

function buildResetUrl(token, origin, email) {
  const base = origin || getAppOrigin();
  const url = new URL(`${base.replace(/\/$/, '')}/reset-password`);
  url.searchParams.set('token', token);
  if (email) {
    url.searchParams.set('email', email);
  }
  return url.toString();
}

// ─── iCalendar helpers ────────────────────────────────────────────────────────

/** Parse duration in minutes from a type string like 'Online · 90 min · Free'. */
function parseDurationMins(typeStr) {
  const m = (typeStr || '').match(/(\d+)\s*(?:min|h)/i);
  if (!m) return 60;
  const n = parseInt(m[1], 10);
  if (/h\b/i.test(typeStr.slice(typeStr.search(/\d+\s*h/i)))) return n * 60;
  return n;
}

/** Format a Date to iCal DTSTART/DTEND string (YYYYMMDDTHHMMSSZ). */
function toIcalDate(date) {
  return date.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
}

/** Format event_date (ISO date string) for email body. */
function formatEventDateLabel(isoDate) {
  if (!isoDate) return '';
  const d = new Date(isoDate);
  return d.toLocaleString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', timeZone: 'UTC', timeZoneName: 'short' });
}

/** Build a minimal RFC-5545 compliant iCalendar string for an event. */
function buildIcal({ event, uid, origin }) {
  // event_date is now a full timestamp
  const start = new Date(event.event_date);
  const durationMins = parseDurationMins(event.type);
  const end = new Date(start.getTime() + durationMins * 60 * 1000);
  const now = toIcalDate(new Date());
  const eventsUrl = `${origin}/events`;

  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//AllCanAccess//Events//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:REQUEST',
    'BEGIN:VEVENT',
    `UID:${uid}`,
    `DTSTAMP:${now}`,
    `DTSTART:${toIcalDate(start)}`,
    `DTEND:${toIcalDate(end)}`,
    `SUMMARY:${event.title}`,
    `DESCRIPTION:${event.type}\\n\\nView event: ${eventsUrl}`,
    `URL:${eventsUrl}`,
    'STATUS:CONFIRMED',
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n');
}

async function sendEventRsvpEmail({ event, email, displayName }) {
  const from = process.env.EMAIL_FROM || 'AllCanAccess <noreply@allcanaccess.local>';
  const origin = getAppOrigin();
  const uid = `event-${event.id}-${Date.now()}@allcanaccess`;
  const icalContent = buildIcal({ event, uid, origin });

  const name = displayName || 'there';
  const dateLabel = formatEventDateLabel(event.event_date);
  const subject = `📅 RSVP confirmed: ${event.title}`;
  const text = `Hi ${name},\n\nYou're registered for "${event.title}"${dateLabel ? ` (${dateLabel})` : ''}.\n\nA calendar invite is attached — add it to your calendar to save the date.\n\nView events: ${origin}/events\n\n— AllCanAccess`;
  const html = `<p>Hi ${escapeHtml(name)},</p>
<p>You're registered for <strong>${escapeHtml(event.title)}</strong>${dateLabel ? ` (${escapeHtml(dateLabel)})` : ''}.</p>
<p>A calendar invite is attached — add it to your calendar to save the date.</p>
<p><a href="${escapeAttr(origin + '/events')}">View all events →</a></p>
<p>— AllCanAccess</p>`;

  const transport = getTransporter();
  if (!transport) {
    console.log('\n[rsvp-email] SMTP not configured — calendar invite for:', email);
    console.log('Subject:', subject);
    console.log('iCal content:\n', icalContent);
    return { delivered: false, mode: 'console' };
  }

  await transport.sendMail({
    from,
    to: email,
    subject,
    text,
    html,
    icalEvent: {
      method: 'REQUEST',
      content: icalContent,
    },
  });
  return { delivered: true, mode: 'smtp' };
}


async function sendOtpEmail({ to, otp, displayName }) {
  const from = process.env.EMAIL_FROM || 'AccessHub <noreply@accesshub.local>';
  const name = displayName || 'there';
  const subject = 'Your AccessHub Verification Code';
  const text = `Hi ${name},

Your verification code is: ${otp}

Please enter this code to verify your account. It will expire in 2 minutes.

— AccessHub`;

  const html = `<p>Hi ${escapeHtml(name)},</p>
<p>Your verification code is: <strong><span style="font-size: 24px;">${escapeHtml(otp)}</span></strong></p>
<p>Please enter this code to verify your account. It will expire in 2 minutes.</p>
<p>— AccessHub</p>`;

  const transport = getTransporter();
  if (!transport) {
    console.log('[otp-email] SMTP not configured — OTP for', to);
    console.log('OTP Code:', otp);
    return { delivered: false, mode: 'console' };
  }

  await transport.sendMail({ from, to, subject, text, html });
  return { delivered: true, mode: 'smtp' };
}

module.exports = {
  sendPasswordResetEmail,
  sendEventRsvpEmail,
  sendOtpEmail,
  buildResetUrl,
  getAppOrigin,
};
