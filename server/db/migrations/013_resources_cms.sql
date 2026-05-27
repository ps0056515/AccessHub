CREATE TABLE IF NOT EXISTS resources (
  id SERIAL PRIMARY KEY,
  slug VARCHAR(255) UNIQUE NOT NULL,
  icon VARCHAR(50),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  color VARCHAR(50),
  category VARCHAR(50),
  view_url VARCHAR(255) NOT NULL,
  display_order INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS resource_proposals (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  url VARCHAR(255) NOT NULL,
  note TEXT,
  status VARCHAR(20) DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Seed initial data to match data.js exactly so bookmarks continue working
INSERT INTO resources (slug, icon, title, description, color, category, view_url, display_order) VALUES
('wcag-22-checklist', '📋', 'WCAG 2.2 checklist', 'Printable AA/AAA success criteria reference with implementation notes', 'blue', 'Standards', 'https://www.w3.org/TR/WCAG22/', 1),
('accessibility-statement-template', '📄', 'Accessibility statement template', 'EAA-compliant template used by 400+ organisations', 'green', 'Legal', 'https://www.w3.org/WAI/planning/statements/', 2),
('aria-patterns-snippet', '🔷', 'ARIA patterns library', 'Code snippets for 30 common UI components with correct ARIA roles', 'purple', 'Design', 'https://www.w3.org/WAI/ARIA/apg/', 3),
('audit-methodology-guide', '🔍', 'Audit methodology guide', 'Step-by-step manual and automated testing process', 'amber', 'Testing', 'https://www.w3.org/WAI/test-evaluate/', 4),
('at-testing-environments', '🖥️', 'AT testing environments', 'VoiceOver, NVDA, JAWS — setup guides for each platform', 'red', 'Testing', 'https://webaim.org/articles/screenreader_testing/', 5),
('accessible-colour-systems', '🎨', 'Accessible colour systems', 'Design token examples with AA-passing contrast built in', 'pink', 'Design', 'https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html', 6),
('video-tutorial-library', '📹', 'Video tutorial library', '60+ hours of recorded workshops from past community events', 'green', 'Tools', 'https://www.w3.org/WAI/teach-advocate/', 7),
('screen-reader-survey', '📊', 'Screen reader survey 2024', 'WebAIM annual data on AT usage across 1,400+ respondents', 'blue', 'Testing', 'https://webaim.org/projects/screenreadersurvey9/', 8)
ON CONFLICT (slug) DO NOTHING;
