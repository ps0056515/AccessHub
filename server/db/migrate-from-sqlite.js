/**
 * One-time migration from legacy SQLite (./data/accesshub.db) into PostgreSQL (DATABASE_URL).
 * Requires: npm install --save-dev better-sqlite3
 */
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '..', '.env') });

const { pool, query } = require('./pool');

const SQLITE_PATH = path.join(__dirname, '..', '..', 'data', 'accesshub.db');

async function resetSequence(table) {
  await query(
    `SELECT setval(
      pg_get_serial_sequence($1, 'id'),
      COALESCE((SELECT MAX(id) FROM ${table}), 1)
    )`,
    [table],
  );
}

async function migrate() {
  let Database;
  try {
    Database = require('better-sqlite3');
  } catch {
    console.error('Install better-sqlite3 first: npm install --save-dev better-sqlite3');
    process.exit(1);
  }

  if (!process.env.DATABASE_URL) {
    console.error('DATABASE_URL is required.');
    process.exit(1);
  }

  if (!fs.existsSync(SQLITE_PATH)) {
    console.log(`No SQLite file at ${SQLITE_PATH}; nothing to migrate.`);
    return;
  }

  const sqlite = new Database(SQLITE_PATH, { readonly: true });
  const userIdMap = new Map();

  const sqliteUsers = sqlite
    .prepare(
      `SELECT id, email, password_hash, display_name, google_id, country, city, created_at
       FROM users ORDER BY id`,
    )
    .all();

  for (const row of sqliteUsers) {
    const email = String(row.email || '')
      .trim()
      .toLowerCase();
    await query(
      `INSERT INTO users (email, password_hash, display_name, google_id, country, city, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7::timestamptz)
       ON CONFLICT (email) DO UPDATE SET
         password_hash = EXCLUDED.password_hash,
         display_name = EXCLUDED.display_name,
         google_id = COALESCE(EXCLUDED.google_id, users.google_id),
         country = COALESCE(EXCLUDED.country, users.country),
         city = COALESCE(EXCLUDED.city, users.city),
         created_at = LEAST(users.created_at, EXCLUDED.created_at)`,
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

    const { rows } = await query('SELECT id FROM users WHERE LOWER(email) = $1', [email]);
    userIdMap.set(row.id, rows[0].id);
  }

  console.log(`Migrated ${sqliteUsers.length} user(s).`);

  const sqlitePosts = sqlite
    .prepare(
      `SELECT id, user_id, title, excerpt, body, author_name, author_initials, author_color,
              author_role, votes, tags, created_at
       FROM posts ORDER BY id`,
    )
    .all();

  for (const row of sqlitePosts) {
    const pgUserId = row.user_id ? userIdMap.get(row.user_id) ?? null : null;
    await query(
      `INSERT INTO posts (
        id, user_id, title, excerpt, body, author_name, author_initials, author_color,
        author_role, votes, tags, created_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12::timestamptz)
      ON CONFLICT (id) DO UPDATE SET
        user_id = EXCLUDED.user_id,
        title = EXCLUDED.title,
        excerpt = EXCLUDED.excerpt,
        body = EXCLUDED.body,
        author_name = EXCLUDED.author_name,
        author_initials = EXCLUDED.author_initials,
        author_color = EXCLUDED.author_color,
        author_role = EXCLUDED.author_role,
        votes = EXCLUDED.votes,
        tags = EXCLUDED.tags,
        created_at = EXCLUDED.created_at`,
      [
        row.id,
        pgUserId,
        row.title,
        row.excerpt,
        row.body,
        row.author_name,
        row.author_initials,
        row.author_color || 'blue',
        row.author_role,
        row.votes ?? 0,
        row.tags || '[]',
        row.created_at,
      ],
    );
  }

  await resetSequence('posts');
  console.log(`Migrated ${sqlitePosts.length} post(s).`);

  const sqliteComments = sqlite
    .prepare(
      `SELECT id, post_id, user_id, author_name, author_initials, author_color, body, created_at
       FROM comments ORDER BY id`,
    )
    .all();

  for (const row of sqliteComments) {
    const pgUserId = row.user_id ? userIdMap.get(row.user_id) ?? null : null;
    await query(
      `INSERT INTO comments (
        id, post_id, user_id, author_name, author_initials, author_color, body, created_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8::timestamptz)
      ON CONFLICT (id) DO UPDATE SET
        post_id = EXCLUDED.post_id,
        user_id = EXCLUDED.user_id,
        author_name = EXCLUDED.author_name,
        author_initials = EXCLUDED.author_initials,
        author_color = EXCLUDED.author_color,
        body = EXCLUDED.body,
        created_at = EXCLUDED.created_at`,
      [
        row.id,
        row.post_id,
        pgUserId,
        row.author_name,
        row.author_initials,
        row.author_color || 'blue',
        row.body,
        row.created_at,
      ],
    );
  }

  await resetSequence('comments');
  sqlite.close();

  console.log(`Migrated ${sqliteComments.length} comment(s).`);
  console.log('SQLite → PostgreSQL migration complete.');
}

migrate()
  .then(async () => {
    await pool.end();
  })
  .catch(async (err) => {
    console.error('Migration failed:', err.message);
    await pool.end();
    process.exit(1);
  });
