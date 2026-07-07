-- Analytics Engine: Sessions & Page Views tracking tables

CREATE TABLE IF NOT EXISTS analytics_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ip_hash TEXT NOT NULL,
  country TEXT DEFAULT 'Unknown',
  city TEXT DEFAULT 'Unknown',
  device_type TEXT DEFAULT 'Desktop',
  browser TEXT DEFAULT 'Unknown',
  os TEXT DEFAULT 'Unknown',
  referrer_domain TEXT DEFAULT 'Direct',
  referrer_category TEXT DEFAULT 'Direct',
  utm_source TEXT,
  utm_medium TEXT,
  utm_campaign TEXT,
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ended_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  page_count INT NOT NULL DEFAULT 0,
  is_bounce BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS analytics_page_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES analytics_sessions(id) ON DELETE CASCADE,
  path TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for fast analytics queries
CREATE INDEX IF NOT EXISTS idx_sessions_started_at ON analytics_sessions(started_at);
CREATE INDEX IF NOT EXISTS idx_sessions_country ON analytics_sessions(country);
CREATE INDEX IF NOT EXISTS idx_sessions_referrer_category ON analytics_sessions(referrer_category);
CREATE INDEX IF NOT EXISTS idx_sessions_device_type ON analytics_sessions(device_type);
CREATE INDEX IF NOT EXISTS idx_page_views_session_id ON analytics_page_views(session_id);
CREATE INDEX IF NOT EXISTS idx_page_views_path ON analytics_page_views(path);
CREATE INDEX IF NOT EXISTS idx_page_views_created_at ON analytics_page_views(created_at);
