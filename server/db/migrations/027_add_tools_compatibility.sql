ALTER TABLE tools ADD COLUMN IF NOT EXISTS compatibility TEXT NOT NULL DEFAULT '[]';

-- Update seeded tools
UPDATE tools SET compatibility = '["Web"]' WHERE name = 'WAVE';
UPDATE tools SET compatibility = '["Web", "React", "Angular"]' WHERE name = 'axe DevTools';
UPDATE tools SET compatibility = '["Web"]' WHERE name = 'Colour Contrast Analyser';
UPDATE tools SET compatibility = '["Web"]' WHERE name = 'Lighthouse';
UPDATE tools SET compatibility = '["Web"]' WHERE name = 'Accessibility Insights';
UPDATE tools SET compatibility = '["Web"]' WHERE name = 'Sa11y';
UPDATE tools SET compatibility = '["Web", "React", "Angular"]' WHERE name = 'axe-core';
UPDATE tools SET compatibility = '["Web"]' WHERE name = 'NVDA';
UPDATE tools SET compatibility = '["Web"]' WHERE name = 'Accessibility Bookmarklets';
