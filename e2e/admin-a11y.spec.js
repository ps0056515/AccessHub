const { test, expect } = require('@playwright/test');
const { AxeBuilder } = require('@axe-core/playwright');

function summarize(violations) {
  return violations.map(v => ({
    id: v.id,
    impact: v.impact,
    help: v.help,
    nodes: v.nodes.slice(0, 8).map(n => ({
      target: n.target.join(' '),
      html: n.html.length > 180 ? `${n.html.slice(0, 180)}...` : n.html,
    })),
  }));
}

async function assertNoViolations(page, opts = {}) {
  // Give React a moment to render after navigation
  await page.waitForTimeout(500); 

  const builder = new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22a', 'wcag22aa', 'best-practice']);
  
  const results = await builder.analyze();
  const violations = results.violations.filter(v => v.impact === 'critical' || v.impact === 'serious' || v.impact === 'moderate');
  
  expect(
    violations,
    violations.length ? JSON.stringify(summarize(violations), null, 2) : ''
  ).toHaveLength(0);
}

test.describe('Admin Dashboard Accessibility', () => {
  test.beforeEach(async ({ page, context }) => {
    // 1. Emulate reduced motion to prevent animation issues with scanner
    await page.emulateMedia({ reducedMotion: 'reduce' });

    // 2. Mock the authentication API
    await page.route('**/api/v1/users/me', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          user: { id: 1, email: "admin@yopmail.com", role: "admin", first_name: "Admin" }
        })
      });
    });
    
    // Mock settings API to prevent loading state
    await page.route('**/api/v1/settings/portal', async route => {
        await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({
                site_name: "Test Admin",
                tags: [],
                stats: [],
                links: [],
                footer_columns: []
            })
        });
    });
    
    await page.route('**/api/v1/admin/stats', async route => {
        await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({
                byCountry: [],
                byCity: [],
                byRole: [],
                byBrowser: [],
                byOS: [],
                totals: { users: 0, activeUsers: 0 }
            })
        });
    });

    await page.route('**/api/v1/admin/users*', async route => {
        await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ users: [], total: 0 }) });
    });

    await page.route('**/api/v1/admin/events*', async route => {
        await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ events: [], total: 0 }) });
    });

    await page.route('**/api/v1/admin/resources*', async route => {
        await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ resources: [], total: 0 }) });
    });
    
    await page.route('**/api/v1/admin/tools*', async route => {
        await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ tools: [], total: 0 }) });
    });

    await page.route('**/api/v1/admin/*', async route => {
        await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ data: [], total: 0, articles: [], discussions: [], blogposts: [], guides: [] }) });
    });

    // 3. Set auth token to bypass RequireAuth
    await context.addInitScript(() => {
      window.localStorage.setItem('aa-auth-token', 'fake-admin-token');
      window.localStorage.setItem('adminDashboardCollapsed', 'false');
    });
  });

  const adminTabs = [
    { name: 'Overview', id: 'overview' },
    { name: 'Analytics', id: 'analytics' },
    { name: 'Resources', id: 'resources' },
    { name: 'Tools', id: 'tools' },
    { name: 'Events', id: 'events' },
    { name: 'Discussions', id: 'discussions' },
    { name: 'Articles', id: 'articles' },
    { name: 'Blogposts', id: 'blogposts' },
    { name: 'Screen Readers', id: 'screen_readers' },
    { name: 'Settings', id: 'settings' },
  ];

  for (const tab of adminTabs) {
    test(`tab: ${tab.name}`, async ({ page, context }) => {
      // Set the active tab in localStorage before navigating
      await context.addInitScript((tabId) => {
        window.localStorage.setItem('adminDashboardTab', tabId);
      }, tab.id);

      await page.goto('/admin');
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(1000); // Give it a sec to settle
      
      await assertNoViolations(page);
    });
  }
});
