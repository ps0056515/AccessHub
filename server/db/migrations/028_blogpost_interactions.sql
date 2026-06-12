ALTER TABLE blogposts ADD COLUMN IF NOT EXISTS votes INTEGER NOT NULL DEFAULT 0;

CREATE TABLE IF NOT EXISTS blogpost_votes (
  blogpost_id UUID NOT NULL REFERENCES blogposts(id) ON DELETE CASCADE,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  direction SMALLINT NOT NULL CHECK (direction IN (-1, 1)),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (blogpost_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_blogpost_votes_blogpost ON blogpost_votes (blogpost_id);

CREATE TABLE IF NOT EXISTS blogpost_comments (
  id SERIAL PRIMARY KEY,
  blogpost_id UUID NOT NULL REFERENCES blogposts(id) ON DELETE CASCADE,
  user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  author_name TEXT NOT NULL,
  author_initials TEXT NOT NULL,
  author_color TEXT NOT NULL DEFAULT 'blue',
  body TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_blogpost_comments_blogpost ON blogpost_comments (blogpost_id);
