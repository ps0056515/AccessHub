-- Migration: Upgrade accessibility_jobs table for multi-provider architecture
-- Adds provider tracking, deduplication, and performance indexes

-- Provider tracking columns
ALTER TABLE accessibility_jobs ADD COLUMN IF NOT EXISTS provider VARCHAR(50) DEFAULT 'jsearch';
ALTER TABLE accessibility_jobs ADD COLUMN IF NOT EXISTS provider_job_id VARCHAR(500);
ALTER TABLE accessibility_jobs ADD COLUMN IF NOT EXISTS company_logo TEXT;
ALTER TABLE accessibility_jobs ADD COLUMN IF NOT EXISTS is_remote BOOLEAN DEFAULT FALSE;
ALTER TABLE accessibility_jobs ADD COLUMN IF NOT EXISTS salary_min INTEGER;
ALTER TABLE accessibility_jobs ADD COLUMN IF NOT EXISTS salary_max INTEGER;
ALTER TABLE accessibility_jobs ADD COLUMN IF NOT EXISTS currency VARCHAR(10);
ALTER TABLE accessibility_jobs ADD COLUMN IF NOT EXISTS employment_type VARCHAR(100);
ALTER TABLE accessibility_jobs ADD COLUMN IF NOT EXISTS apply_url TEXT;
ALTER TABLE accessibility_jobs ADD COLUMN IF NOT EXISTS fetched_at TIMESTAMP DEFAULT NOW();
ALTER TABLE accessibility_jobs ADD COLUMN IF NOT EXISTS first_seen TIMESTAMP DEFAULT NOW();
ALTER TABLE accessibility_jobs ADD COLUMN IF NOT EXISTS last_seen TIMESTAMP DEFAULT NOW();
ALTER TABLE accessibility_jobs ADD COLUMN IF NOT EXISTS active BOOLEAN DEFAULT TRUE;

-- Composite unique constraint: (provider, provider_job_id) prevents cross-provider duplicates
CREATE UNIQUE INDEX IF NOT EXISTS idx_jobs_provider_id
  ON accessibility_jobs(provider, provider_job_id)
  WHERE provider_job_id IS NOT NULL;

-- Performance indexes
CREATE INDEX IF NOT EXISTS idx_jobs_posted ON accessibility_jobs(posted_date DESC);
CREATE INDEX IF NOT EXISTS idx_jobs_active ON accessibility_jobs(active) WHERE active = TRUE;
CREATE INDEX IF NOT EXISTS idx_jobs_apply_url ON accessibility_jobs(apply_url) WHERE apply_url IS NOT NULL;
