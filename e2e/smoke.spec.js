const { test, expect } = require('@playwright/test');

test.describe('production smoke', () => {
  test('document title and skip link', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/Allcanaccess/i);
    await expect(page.getByRole('link', { name: /skip to main content/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /Allcanaccess home/i })).toBeVisible();
  });

  test('main nav reaches Resources', async ({ page }) => {
    await page.goto('/');
    await page
      .getByRole('navigation', { name: 'Main navigation' })
      .getByRole('button', { name: 'Resources' })
      .click();
    await expect(page.getByRole('heading', { name: 'Community resources', level: 1 })).toBeVisible();
    await expect(page.getByText(/curated by the Allcanaccess community/i)).toBeVisible();
  });

  test('footer branding', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('contentinfo')).toContainText(/Allcanaccess/);
  });
});
