CREATE TABLE IF NOT EXISTS system_settings (
  key VARCHAR(50) PRIMARY KEY,
  value TEXT NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS navigation_links (
  id SERIAL PRIMARY KEY,
  menu_type VARCHAR(20) NOT NULL,
  label VARCHAR(100) NOT NULL,
  url VARCHAR(255) NOT NULL,
  is_external BOOLEAN DEFAULT FALSE,
  display_order INT DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert initial values matching existing static code:
INSERT INTO system_settings (key, value) VALUES
  ('site_name', 'AllCanAccess') ON CONFLICT (key) DO NOTHING;
INSERT INTO system_settings (key, value) VALUES
  ('navbar_logo_url', '/allcanaccess.png') ON CONFLICT (key) DO NOTHING;
INSERT INTO system_settings (key, value) VALUES
  ('footer_logo_url', '/allcanaccess_footer.png') ON CONFLICT (key) DO NOTHING;

-- Insert initial navbar links:
INSERT INTO navigation_links (menu_type, label, url, display_order) VALUES
  ('navbar', 'Community', '/', 1),
  ('navbar', 'Resources', '/resources', 2),
  ('navbar', 'Tools', '/tools', 3),
  ('navbar', 'Events', '/events', 4),
  ('navbar', 'NVDA Guide', '/guide', 5);

-- Insert initial footer community links:
INSERT INTO navigation_links (menu_type, label, url, display_order) VALUES
  ('footer_community', 'Discussions', '/', 1),
  ('footer_community', 'Resources', '/resources', 2),
  ('footer_community', 'Tools', '/tools', 3),
  ('footer_community', 'Events', '/events', 4),
  ('footer_community', 'NVDA Guide', '/guide', 5);

-- Insert initial footer standards links:
INSERT INTO navigation_links (menu_type, label, url, is_external, display_order) VALUES
  ('footer_standards', 'WCAG 2.2', 'https://www.w3.org/TR/WCAG22/', TRUE, 1),
  ('footer_standards', 'ARIA Patterns', 'https://www.w3.org/WAI/ARIA/apg/', TRUE, 2),
  ('footer_standards', 'Section 508', 'https://www.section508.gov/', TRUE, 3),
  ('footer_standards', 'EN 301 549', '/en-301-549', FALSE, 4),
  ('footer_standards', 'EAA 2025', 'https://digital-strategy.ec.europa.eu/en/policies/web-accessibility', TRUE, 5);

-- Insert initial footer organisation links:
INSERT INTO navigation_links (menu_type, label, url, is_external, display_order) VALUES
  ('footer_org', 'About AllCanAccess', '/', FALSE, 1),
  ('footer_org', 'News', '/news', FALSE, 2),
  ('footer_org', 'Newsletter', 'https://www.w3.org/WAI/news/subscribe/', TRUE, 3),
  ('footer_org', 'Blog', 'https://www.w3.org/WAI/news/', TRUE, 4),
  ('footer_org', 'Contribute', '/contribute', FALSE, 5),
  ('footer_org', 'Contact', '/contact', FALSE, 6);

-- Insert initial footer social links:
INSERT INTO navigation_links (menu_type, label, url, is_external, display_order) VALUES
  ('footer_socials', 'LinkedIn', 'https://www.linkedin.com/company/w3c/', TRUE, 1),
  ('footer_socials', 'X', 'https://x.com/w3c/', TRUE, 2),
  ('footer_socials', 'GitHub', 'https://github.com/w3c/wai', TRUE, 3),
  ('footer_socials', 'RSS', '/news', FALSE, 4);
