process.env.NODE_ENV = process.env.NODE_ENV || 'development';
require('dotenv').config();
const path = require('path');
const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/auth');
const adminRoutes = require('./routes/admin');
const postsRoutes = require('./routes/posts');
const newsRoutes = require('./routes/news');
const settingsRoutes = require('./routes/settings');
const toolsRoutes = require('./routes/tools');
const eventsRoutes = require('./routes/events');
const resourcesRoutes = require('./routes/resources');
const articlesRoutes = require('./routes/articles');
const blogpostsRoutes = require('./routes/blogposts');
const screenReadersRoutes = require('./routes/screen_readers');
const usersRoutes = require('./routes/users');
const { query, closePool } = require('./db');

const PORT = Number(process.env.API_PORT || process.env.PORT) || 3015;
const app = express();

app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: '10mb' }));

app.get('/api/health', async (_req, res) => {
  try {
    await query('SELECT 1');
    res.json({ ok: true, db: 'postgresql' });
  } catch (err) {
    res.status(503).json({ ok: false, db: 'postgresql', error: err.message });
  }
});

app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/posts', postsRoutes);
app.use('/api/news', newsRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/tools', toolsRoutes);
app.use('/api/events', eventsRoutes);
app.use('/api/resources', resourcesRoutes);
app.use('/api/articles', articlesRoutes);
app.use('/api/blogposts', blogpostsRoutes);
app.use('/api/screen-readers', screenReadersRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/uploads', express.static(path.join(__dirname, 'uploads')));

app.use((err, _req, res, _next) => {
  console.error(err);
  if (err.code === '23505') {
    res.status(409).json({ error: 'Resource already exists.' });
    return;
  }
  res.status(500).json({ error: 'Internal server error.' });
});

const server = app.listen(PORT, () => {
  console.log(`API server listening on http://localhost:${PORT}`);
  console.log('Database: PostgreSQL (DATABASE_URL)');
});

function shutdown() {
  server.close(async () => {
    await closePool();
    process.exit(0);
  });
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
