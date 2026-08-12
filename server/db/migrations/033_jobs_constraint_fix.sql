-- Fix: Replace partial unique index with a proper unique CONSTRAINT
-- so that ON CONFLICT (provider, provider_job_id) works correctly.
-- PostgreSQL ON CONFLICT requires a real constraint, not a partial index.

-- Drop the partial index created in 032
DROP INDEX IF EXISTS idx_jobs_provider_id;

-- Create a proper unique constraint (only for non-null provider_job_id)
-- We guard against nulls in application code before inserting.
ALTER TABLE accessibility_jobs
  ADD CONSTRAINT uq_jobs_provider_job_id UNIQUE (provider, provider_job_id);

-- Fix salary columns — some providers return float values, use NUMERIC instead of INTEGER
ALTER TABLE accessibility_jobs ALTER COLUMN salary_min TYPE NUMERIC(12, 2);
ALTER TABLE accessibility_jobs ALTER COLUMN salary_max TYPE NUMERIC(12, 2);
