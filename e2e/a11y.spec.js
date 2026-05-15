const { test, expect } = require('@playwright/test');
const { AxeBuilder } = require('@axe-core/playwright');

/** Collapse axe output for readable test failures */
function summarize(violations) {
  return violations.map(v => ({
    id: v.id,
    impact: v.impact,
    help: v.help,
    nodes: v.nodes.slice(0, 8).map(n => ({
      target: n.target.join(' '),
      html: n.html.length > 180 ? `${n.html.slice(0, 180)}…` : n.html,
    })),
  }));
}

async function assertNoViolations(page, opts = {}) {
  const builder = new AxeBuilder({ page });
  const results = await builder.analyze();
  const violations = opts.includeModerate
    ? results.violations
    : results.violations.filter(v => v.impact === 'critical' || v.impact === 'serious');
  expect(
    violations,
    violations.length ? JSON.stringify(summarize(violations), null, 2) : ''
  ).toHaveLength(0);
}

test.describe('axe accessibility (critical & serious)', () => {
  test.beforeEach(async ({ page }) => {
    /* `.fade-up` uses staggered opacity animation; scanning mid-animation yields false contrast fails. */
    await page.emulateMedia({ reducedMotion: 'reduce' });
  });

  test('home — portal', async ({ page }) => {
    await page.goto('/');
    await assertNoViolations(page);
  });

  test('join', async ({ page }) => {
    await page.goto('/join');
    await assertNoViolations(page);
  });

  test('events', async ({ page }) => {
    await page.goto('/events');
    await assertNoViolations(page);
  });

  test('thread view', async ({ page }) => {
    await page.goto('/thread/1');
    await assertNoViolations(page);
  });

  test('member profile', async ({ page }) => {
    await page.goto('/profile/1');
    await assertNoViolations(page);
  });
});
