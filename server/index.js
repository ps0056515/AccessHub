require('dotenv').config();
const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/auth');
const adminRoutes = require('./routes/admin');
const { closeDb, DB_PATH } = require('./db');

const PORT = Number(process.env.PORT) || 3001;
const app = express();

app.use(cors({ origin: true, credentials: true }));
app.use(express.json());

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, db: DB_PATH });
});

app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ error: 'Internal server error.' });
});

const server = app.listen(PORT, () => {
  console.log(`API server listening on http://localhost:${PORT}`);
});

function shutdown() {
  server.close(() => {
    closeDb();
    process.exit(0);
  });
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
