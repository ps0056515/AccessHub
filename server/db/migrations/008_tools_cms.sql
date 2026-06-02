CREATE TABLE IF NOT EXISTS tools (
  id SERIAL PRIMARY KEY,
  icon VARCHAR(10) NOT NULL,
  name VARCHAR(100) NOT NULL,
  type VARCHAR(100) NOT NULL,
  price VARCHAR(50) NOT NULL,
  badge VARCHAR(50),
  badge_color VARCHAR(20),
  url VARCHAR(255) NOT NULL,
  display_order INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Seed default tools
INSERT INTO tools (icon, name, type, price, badge, badge_color, url, display_order) VALUES
('🌊', 'WAVE', 'Browser extension', 'Free', 'Popular', 'green', 'https://wave.webaim.org', 1),
('🪓', 'axe DevTools', 'Browser extension', 'Free / Pro', 'Recommended', 'blue', 'https://www.deque.com/axe/devtools/', 2),
('🔬', 'Colour Contrast Analyser', 'Desktop app', 'Free', NULL, NULL, 'https://www.tpgi.com/color-contrast-checker/', 3),
('💡', 'Lighthouse', 'Built-in DevTools', 'Free', NULL, NULL, 'https://developer.chrome.com/docs/lighthouse/overview/', 4),
('🔎', 'Accessibility Insights', 'Browser extension', 'Free', NULL, NULL, 'https://accessibilityinsights.io/', 5),
('✅', 'Sa11y', 'JS library', 'Open source', 'New', 'purple', 'https://sa11y.netlify.app/', 6),
('🤖', 'axe-core', 'JS library / CI', 'Open source', NULL, NULL, 'https://github.com/dequelabs/axe-core', 7),
('🧪', 'NVDA', 'Windows screen reader', 'Free', NULL, NULL, 'https://www.nvaccess.org/download/', 8)
ON CONFLICT DO NOTHING;
