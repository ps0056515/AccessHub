const { test, expect } = require('@playwright/test');

test.describe('production smoke', () => {
  test('document title and skip link', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/All Can Access/i);
    await expect(page.getByRole('link', { name: /skip to main content/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /All Can Access home/i })).toBeVisible();
  });

  test('main nav reaches Resources', async ({ page }) => {
    await page.goto('/');
    await page
      .getByRole('navigation', { name: 'Main navigation' })
      .getByRole('button', { name: 'Resources' })
      .click();
    await expect(page.getByRole('heading', { name: 'Community resources', level: 1 })).toBeVisible();
    await expect(page.getByText(/curated by the All Can Access community/i)).toBeVisible();
  });

  test('Join community prompts sign in when logged out', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: 'Join community' }).first().click();
    await expect(page).toHaveURL(/\/sign-in$/);
    await expect(page.getByRole('heading', { level: 1, name: 'Sign in' })).toBeVisible();
    await expect(page.getByText(/sign in to join the community/i)).toBeVisible();
    await page.getByRole('button', { name: /All Can Access home/i }).click();
    await expect(page).not.toHaveURL(/\/sign-in$/);
    await expect(
      page.getByRole('heading', { level: 1, name: /Where.*accessibility/i })
    ).toBeVisible();
  });

  test('footer branding', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('contentinfo')).toContainText(/All Can Access/);
  });
});
