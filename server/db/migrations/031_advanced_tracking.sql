-- Add advanced tracking columns to identify users across devices/networks
ALTER TABLE analytics_sessions 
ADD COLUMN IF NOT EXISTS visitor_id VARCHAR(255),
ADD COLUMN IF NOT EXISTS user_id INTEGER REFERENCES users(id) ON DELETE SET NULL;

-- Backfill visitor_id with ip_hash for existing sessions
UPDATE analytics_sessions 
SET visitor_id = ip_hash 
WHERE visitor_id IS NULL;

-- Make visitor_id NOT NULL after backfilling
ALTER TABLE analytics_sessions 
ALTER COLUMN visitor_id SET NOT NULL;
