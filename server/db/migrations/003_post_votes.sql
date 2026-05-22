CREATE TABLE IF NOT EXISTS post_votes (
  post_id INTEGER NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  voter_key TEXT NOT NULL,
  direction SMALLINT NOT NULL CHECK (direction IN (-1, 1)),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (post_id, voter_key)
);

CREATE INDEX IF NOT EXISTS idx_post_votes_post ON post_votes (post_id);
