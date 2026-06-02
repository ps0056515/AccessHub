-- Change event_date from DATE to TIMESTAMP to allow storing times
ALTER TABLE events ALTER COLUMN event_date TYPE TIMESTAMP USING event_date::TIMESTAMP + INTERVAL '9 hours';
