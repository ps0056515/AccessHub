/**
 * One-time import from legacy SQLite (DATABASE_PATH) into PostgreSQL (DATABASE_URL).
 */
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '..', '.env') });

const { pool, query } = require('./pool');

const SQLITE_PATH =
  process.env.DATABASE_PATH || path.join(__dirname, '..', '..', 'data', 'accesshub.db');

async function importUsers() {
  let Database;
  try {
    Database = require('better-sqlite3');
  } catch {
    console.error('Install better-sqlite3 to import: npm install --save-dev better-sqlite3');
    process.exit(1);
  }

  if (!fs.existsSync(SQLITE_PATH)) {
    console.log(`No SQLite file at ${SQLITE_PATH}; nothing to import.`);
    return;
  }

  const sqlite = new Database(SQLITE_PATH, { readonly: true });
  const rows = sqlite
    .prepare(
      `SELECT email, password_hash, display_name, google_id, country, city, created_at FROM users`,
    )
    .all();
  sqlite.close();

  if (rows.length === 0) {
    console.log('SQLite users table is empty.');
    return;
  }

  let imported = 0;
  for (const row of rows) {
    const email = String(row.email || '')
      .trim()
      .toLowerCase();
    await query(
      `INSERT INTO users (email, password_hash, display_name, google_id, country, city, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7::timestamptz)
       ON CONFLICT (email) DO UPDATE SET
         password_hash = EXCLUDED.password_hash,
         display_name = EXCLUDED.display_name,
         google_id = EXCLUDED.google_id,
         country = EXCLUDED.country,
         city = EXCLUDED.city,
         created_at = EXCLUDED.created_at`,
      [
        email,
        row.password_hash || '',
        row.display_name,
        row.google_id || null,
        row.country || null,
        row.city || null,
        row.created_at,
      ],
    );
    imported += 1;
  }

  console.log(`Imported ${imported} user(s) from ${SQLITE_PATH}`);
}

importUsers()
  .then(async () => {
    await pool.end();
  })
  .catch(async (err) => {
    console.error('Import failed:', err.message);
    await pool.end();
    process.exit(1);
  });
