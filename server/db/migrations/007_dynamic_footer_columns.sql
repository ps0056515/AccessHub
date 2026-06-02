CREATE TABLE IF NOT EXISTS footer_columns (
  id SERIAL PRIMARY KEY,
  key_name VARCHAR(50) UNIQUE NOT NULL,
  title VARCHAR(100) NOT NULL,
  display_order INT DEFAULT 0
);

-- Seed default footer columns
INSERT INTO footer_columns (key_name, title, display_order) VALUES
  ('community', 'Community', 1),
  ('standards', 'Standards', 2),
  ('org', 'Organisation', 3)
ON CONFLICT (key_name) DO NOTHING;
