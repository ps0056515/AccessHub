const express = require('express');
const crypto = require('crypto');
const { query } = require('../db');

let geoip;
let UAParser;
try { geoip = require('geoip-lite'); } catch (_) { geoip = null; }
try { UAParser = require('ua-parser-js'); } catch (_) { UAParser = null; }

const router = express.Router();

/* ── Helper: categorise a referrer domain ────────────────────── */
const REFERRER_MAP = {
  'google':    'Search',
  'bing':      'Search',
  'yahoo':     'Search',
  'duckduckgo':'Search',
  'baidu':     'Search',
  'linkedin':  'Social',
  'twitter':   'Social',
  'x.com':     'Social',
  't.co':      'Social',
  'facebook':  'Social',
  'instagram': 'Social',
  'youtube':   'Social',
  'reddit':    'Social',
  'pinterest': 'Social',
  'tiktok':    'Social',
  'github':    'Social',
  'whatsapp':  'Social',
  'telegram':  'Social',
};

function categoriseReferrer(domain) {
  if (!domain || domain === 'Direct') return { domain: 'Direct', category: 'Direct' };
  const lower = domain.toLowerCase().replace(/^www\./, '');
  for (const [key, cat] of Object.entries(REFERRER_MAP)) {
    if (lower.includes(key)) return { domain: lower, category: cat };
  }
  return { domain: lower, category: 'Referral' };
}

/* ── Helper: hash IP so we never store raw IPs ───────────────── */
function hashIp(ip) {
  return crypto.createHash('sha256').update(ip || 'unknown').digest('hex').substring(0, 16);
}

/* ── POST /api/track/pageview ────────────────────────────────── */
router.post('/pageview', async (req, res) => {
  try {
    const { sessionId, visitorId, userId, path, referrer, utmSource, utmMedium, utmCampaign } = req.body;
    if (!sessionId || !path) {
      return res.status(400).json({ error: 'sessionId and path are required.' });
    }

    // Resolve IP → geo
    const rawIp = req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.ip || '127.0.0.1';
    const ipHash = hashIp(rawIp);
    const finalVisitorId = visitorId || ipHash; // Fallback to IP hash if no visitor ID provided
    
    let country = 'Unknown';
    let city = 'Unknown';
    if (geoip) {
      const geo = geoip.lookup(rawIp);
      if (geo) {
        country = geo.country || 'Unknown';
        city = geo.city || 'Unknown';
      }
    }

    // Resolve User-Agent → device / browser / OS
    let deviceType = 'Desktop';
    let browser = 'Unknown';
    let os = 'Unknown';
    if (UAParser) {
      const ua = new UAParser(req.headers['user-agent']);
      const device = ua.getDevice();
      deviceType = device.type === 'mobile' ? 'Mobile' : device.type === 'tablet' ? 'Tablet' : 'Desktop';
      browser = ua.getBrowser().name || 'Unknown';
      os = ua.getOS().name || 'Unknown';
    }

    // Categorise referrer
    const { domain: refDomain, category: refCategory } = categoriseReferrer(referrer);

    // Upsert session: if this sessionId already exists, just update ended_at and page_count
    const existing = await query('SELECT id, page_count FROM analytics_sessions WHERE id = $1', [sessionId]);

    if (existing.rows.length > 0) {
      // Update existing session
      const newCount = existing.rows[0].page_count + 1;
      await query(
        `UPDATE analytics_sessions 
         SET ended_at = NOW(), page_count = $1, is_bounce = $2, user_id = COALESCE($3, user_id)
         WHERE id = $4`,
        [newCount, newCount <= 1, userId || null, sessionId]
      );
    } else {
      // Create new session
      await query(
        `INSERT INTO analytics_sessions 
         (id, ip_hash, visitor_id, user_id, country, city, device_type, browser, os, referrer_domain, referrer_category, utm_source, utm_medium, utm_campaign, page_count, is_bounce)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, 1, TRUE)`,
        [sessionId, ipHash, finalVisitorId, userId || null, country, city, deviceType, browser, os, refDomain, refCategory, utmSource || null, utmMedium || null, utmCampaign || null]
      );
    }

    // Insert page view
    await query(
      'INSERT INTO analytics_page_views (session_id, path) VALUES ($1, $2)',
      [sessionId, path]
    );

    res.status(204).end();
  } catch (err) {
    // Tracking should never crash the user's experience
    console.error('[Analytics Tracker] Error:', err.message);
    res.status(204).end();
  }
});

module.exports = router;
