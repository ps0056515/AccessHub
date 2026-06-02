CREATE TABLE IF NOT EXISTS events (
  id SERIAL PRIMARY KEY,
  month VARCHAR(10) NOT NULL,
  day VARCHAR(10) NOT NULL,
  title VARCHAR(255) NOT NULL,
  type VARCHAR(100) NOT NULL,
  band VARCHAR(50) NOT NULL,
  timing VARCHAR(20) NOT NULL,
  display_order INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS event_proposals (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  format VARCHAR(50) NOT NULL DEFAULT 'webinar',
  proposed_date VARCHAR(100),
  email VARCHAR(100) NOT NULL,
  details TEXT,
  status VARCHAR(20) DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS event_rsvps (
  id SERIAL PRIMARY KEY,
  event_id INT REFERENCES events(id) ON DELETE CASCADE,
  user_id INT REFERENCES users(id) ON DELETE SET NULL,
  email VARCHAR(100) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT unique_event_attendee UNIQUE (event_id, email)
);

-- Seed default events
INSERT INTO events (month, day, title, type, band, timing, display_order) VALUES
('JAN', '14', 'Intro to inclusive UX research', 'Online · 60 min · Free', 'Free', 'past', 1),
('FEB', '6', 'Auditor roundtable: false positives', 'Online · 90 min · Free', 'Free', 'past', 2),
('MAR', '20', 'EAA prep workshop recording drop', 'Online · 120 min · Members only', 'Members only', 'past', 3),
('APR', '8', 'Public-sector accessibility procurement clinic', 'Online · 90 min · Free', 'Free', 'past', 4),
('MAY', '7', 'Accessible data viz workshop', 'Online · 90 min · Free', 'Free', 'past', 5),
('MAY', '14', 'GAAD 2026 — live practitioner panel & audience Q&A', 'Online · 90 min · Free', 'Free', 'live', 6),
('MAY', '15', 'EAA compliance Q&A live session', 'Online · 60 min · Free', 'Free', 'upcoming', 7),
('MAY', '28', 'WCAG 2.2 debrief — what changed for your roadmap', 'Online · 75 min · Members only', 'Members only', 'upcoming', 8),
('JUN', '3', 'CSUN ATC 2026 — recap & takeaways for teams', 'Online · 2h · Members only', 'Members only', 'upcoming', 9),
('JUN', '18', 'Mobile accessibility deep-dive', 'Online · 90 min · Free', 'Free', 'upcoming', 10),
('JUL', '9', 'Annual AllCanAccess community meetup', 'In-person · London · Members', 'In-person', 'upcoming', 11),
('JUL', '22', 'Designing for cognitive accessibility', 'Online · 75 min · Free', 'Free', 'upcoming', 12),
('AUG', '5', 'PDF accessibility deep-dive workshop', 'Online · 90 min · Free', 'Free', 'upcoming', 13),
('AUG', '19', 'AllCanAccess annual survey results reveal', 'Online · 60 min · Free', 'Free', 'upcoming', 14),
('SEP', '11', 'Inclusive UX patterns for mobile', 'Online · 90 min · Members only', 'Members only', 'upcoming', 15)
ON CONFLICT DO NOTHING;
