require("dotenv").config({ path: require("path").join(__dirname, "..", ".env") });

const isProd = process.env.NODE_ENV === "production";
const port = parseInt(process.env.PORT || "4000", 10);

const defaultOrigins = isProd
  ? `http://localhost:${port}`
  : "http://localhost:3000,http://localhost:4000";

const clientOrigins = (process.env.CLIENT_ORIGIN || defaultOrigins)
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

const cookieSecure = process.env.COOKIE_SECURE === "true";

module.exports = {
  port,
  databaseUrl:
    process.env.DATABASE_URL ||
    "postgresql://accesshub:accesshub@localhost:5432/accesshub",
  jwtSecret: process.env.JWT_SECRET || "dev-only-change-in-production",
  cookieName: process.env.COOKIE_NAME || "accesshub_token",
  clientOrigins,
  isProd,
  cookieOptions: {
    httpOnly: true,
    secure: cookieSecure,
    sameSite: cookieSecure ? "strict" : "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000,
    path: "/",
  },
};
