const fs = require('fs');
const path = require('path');
const Database = require('better-sqlite3');

const DATA_DIR = path.join(__dirname, '..', 'data');
const DB_PATH = process.env.DATABASE_PATH || path.join(DATA_DIR, 'accesshub.db');

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

function migrateSchema(db) {
  const cols = db.prepare('PRAGMA table_info(users)').all().map(c => c.name);

  if (!cols.includes('google_id')) {
    db.exec('ALTER TABLE users ADD COLUMN google_id TEXT');
  }
  if (!cols.includes('country')) {
    db.exec('ALTER TABLE users ADD COLUMN country TEXT');
  }
  if (!cols.includes('city')) {
    db.exec('ALTER TABLE users ADD COLUMN city TEXT');
  }

  db.exec(
    'CREATE UNIQUE INDEX IF NOT EXISTS idx_users_google_id ON users(google_id) WHERE google_id IS NOT NULL'
  );
  db.exec('CREATE INDEX IF NOT EXISTS idx_users_country ON users(country)');
  db.exec('CREATE INDEX IF NOT EXISTS idx_users_city ON users(city)');
}

function initSchema(db) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT NOT NULL UNIQUE COLLATE NOCASE,
      password_hash TEXT NOT NULL DEFAULT '',
      display_name TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
  `);
  migrateSchema(db);
}

let db;

function getDb() {
  if (!db) {
    ensureDataDir();
    db = new Database(DB_PATH);
    db.pragma('journal_mode = WAL');
    db.pragma('foreign_keys = ON');
    initSchema(db);
  }
  return db;
}

function closeDb() {
  if (db) {
    db.close();
    db = null;
  }
}

module.exports = { getDb, closeDb, DB_PATH };
