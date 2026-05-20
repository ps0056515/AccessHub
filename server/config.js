require("dotenv").config({ path: require("path").join(__dirname, "..", ".env") });

const isProd = process.env.NODE_ENV === "production";
const appPort = parseInt(process.env.PORT || "3010", 10);
const apiPort = parseInt(process.env.API_PORT || "4000", 10);

/** Production: one server on PORT. Development: API on API_PORT, React on PORT. */
const port = isProd ? appPort : apiPort;

const defaultOrigins = isProd
  ? `http://localhost:${appPort}`
  : `http://localhost:${appPort},http://localhost:${apiPort}`;

const clientOrigins = (process.env.CLIENT_ORIGIN || defaultOrigins)
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

const cookieSecure = process.env.COOKIE_SECURE === "true";

module.exports = {
  port,
  appPort,
  apiPort,
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
