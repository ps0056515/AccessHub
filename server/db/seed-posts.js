/**
 * Seed discussion threads into PostgreSQL (skipped when posts already exist).
 */
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '..', '.env') });

const { pool, query } = require('./pool');
const { POSTS, THREAD_COMMENTS } = require('../seed-data');

const offsets = ['-2 hours', '-5 hours', '-1 day', '-1 day', '-2 days', '-3 days'];

async function seedPosts() {
  const { rows } = await query('SELECT COUNT(*)::int AS n FROM posts');
  if (rows[0].n > 0) {
    console.log('Posts already seeded; skipping.');
    return;
  }

  for (let i = 0; i < POSTS.length; i += 1) {
    const post = POSTS[i];
    const offset = offsets[i] || '-1 day';

    const inserted = await query(
      `INSERT INTO posts (
        user_id, title, excerpt, body, author_name, author_initials, author_color,
        author_role, votes, tags, created_at
      ) VALUES (
        NULL, $1, $2, $3, $4, $5, $6, $7, $8, $9,
        NOW() + $10::interval
      ) RETURNING id`,
      [
        post.title,
        post.excerpt,
        post.body,
        post.author,
        post.initials,
        post.color,
        post.role,
        post.votes,
        JSON.stringify(post.tags || []),
        offset,
      ],
    );

    const postId = inserted.rows[0].id;
    const comments = THREAD_COMMENTS[post.id] || [];

    for (let j = 0; j < comments.length; j += 1) {
      const c = comments[j];
      await query(
        `INSERT INTO comments (
          post_id, user_id, author_name, author_initials, author_color, body, created_at
        ) VALUES ($1, NULL, $2, $3, $4, $5, NOW() + $6::interval)`,
        [postId, c.author, c.initials, c.color, c.body, `-${j + 1} hours`],
      );
    }
  }

  console.log(`Seeded ${POSTS.length} discussion thread(s).`);
}

seedPosts()
  .then(async () => {
    await pool.end();
  })
  .catch(async (err) => {
    console.error('Seed failed:', err.message);
    await pool.end();
    process.exit(1);
  });
