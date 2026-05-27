-- Add proper date column
ALTER TABLE events ADD COLUMN IF NOT EXISTS event_date DATE;

-- Derive date from existing month/day text (all events are in year 2026)
UPDATE events SET event_date = MAKE_DATE(
  2026,
  CASE month
    WHEN 'JAN' THEN 1  WHEN 'FEB' THEN 2  WHEN 'MAR' THEN 3
    WHEN 'APR' THEN 4  WHEN 'MAY' THEN 5  WHEN 'JUN' THEN 6
    WHEN 'JUL' THEN 7  WHEN 'AUG' THEN 8  WHEN 'SEP' THEN 9
    WHEN 'OCT' THEN 10 WHEN 'NOV' THEN 11 WHEN 'DEC' THEN 12
    ELSE 1
  END,
  (day::int)
)
WHERE event_date IS NULL;

-- Enforce NOT NULL
ALTER TABLE events ALTER COLUMN event_date SET NOT NULL;

-- Drop the columns that are now derived on the frontend
ALTER TABLE events DROP COLUMN IF EXISTS month;
ALTER TABLE events DROP COLUMN IF EXISTS day;
ALTER TABLE events DROP COLUMN IF EXISTS timing;
