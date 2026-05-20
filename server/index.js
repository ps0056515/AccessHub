const http = require("http");
const path = require("path");
const express = require("express");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const config = require("./config");
const authRoutes = require("./routes/auth");
const app = express();

app.set("trust proxy", 1);

app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));
app.use(
  cors({
    origin(origin, callback) {
      if (!origin || config.clientOrigins.includes(origin)) {
        callback(null, true);
        return;
      }
      callback(new Error(`CORS blocked for origin: ${origin}`));
    },
  }),
);
app.use(express.json({ limit: "32kb" }));
app.use(cookieParser());

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 40,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many attempts. Try again later." },
});

app.get("/api/health", (_req, res) => {
  res.json({ ok: true });
});

app.use("/api/auth", authLimiter, authRoutes);

if (config.isProd) {
  const buildPath = path.join(__dirname, "..", "build");
  app.use(express.static(buildPath));
  app.get("*", (req, res, next) => {
    if (req.path.startsWith("/api")) return next();
    res.sendFile(path.join(buildPath, "index.html"));
  });
}

app.use((err, _req, res, _next) => {
  console.error(err);
  if (err.message?.includes("CORS blocked")) {
    return res.status(403).json({ error: err.message });
  }
  res.status(500).json({ error: "Internal server error" });
});

/** Default Node limit (16KB) is easy to exceed on localhost due to accumulated cookies. */
const MAX_HEADER_BYTES = parseInt(process.env.MAX_HTTP_HEADER_SIZE || "262144", 10);
const server = http.createServer({ maxHeaderSize: MAX_HEADER_BYTES }, app);

server.listen(config.port, () => {
  console.log(`AccessHub API listening on http://localhost:${config.port}`);
  console.log(`CORS origins: ${config.clientOrigins.join(", ")}`);
});
