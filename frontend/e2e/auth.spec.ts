import { test, expect } from '@playwright/test';

test.describe('Authentication', () => {
  test('should display sign in page', async ({ page }) => {
    await page.goto('/auth/signin');
    await expect(page.locator('h1')).toContainText('Sign In');
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
  });

  test('should display sign up page', async ({ page }) => {
    await page.goto('/auth/signup');
    await expect(page.locator('h1')).toContainText('Sign Up');
    await expect(page.locator('input[id="name"]')).toBeVisible();
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
  });

  test('should navigate from sign in to sign up', async ({ page }) => {
    await page.goto('/auth/signin');
    await page.click('text=Sign Up');
    await expect(page).toHaveURL('/auth/signup');
  });
});

test.describe('Dashboard Access', () => {
  test('should redirect to sign in when not authenticated', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page).toHaveURL('/auth/signin');
  });
});


