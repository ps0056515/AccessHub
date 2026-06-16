-- Migration: Create accessibility_jobs table
CREATE TABLE IF NOT EXISTS accessibility_jobs (
  id SERIAL PRIMARY KEY,
  title VARCHAR(500) NOT NULL,
  company VARCHAR(300),
  location VARCHAR(300),
  job_type VARCHAR(100),
  url TEXT NOT NULL,
  source VARCHAR(100),
  posted_date TIMESTAMP,
  description TEXT,
  tags TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Add "Accessibility Jobs" link to footer_org
INSERT INTO navigation_links (menu_type, label, url, is_external, display_order)
SELECT 'footer_org', 'Accessibility Jobs', '/accessibility-jobs', FALSE,
  COALESCE((SELECT MAX(display_order) FROM navigation_links WHERE menu_type = 'footer_org'), 0) + 1
WHERE NOT EXISTS (
  SELECT 1 FROM navigation_links WHERE menu_type = 'footer_org' AND label = 'Accessibility Jobs'
);
