const config = require("../config");

/**
 * Browsers often attach hundreds of localhost cookies (other dev apps).
 * Node may reject the request (431) before Express runs. Keep only our session cookie.
 */
function stripCookieHeader(req, _res, next) {
  const raw = req.headers.cookie;
  if (!raw) {
    next();
    return;
  }

  const prefix = `${config.cookieName}=`;
  const kept = raw
    .split(";")
    .map((s) => s.trim())
    .filter((part) => part.startsWith(prefix));

  if (kept.length > 0) {
    req.headers.cookie = kept.join("; ");
  } else {
    delete req.headers.cookie;
  }

  next();
}

module.exports = stripCookieHeader;
