import { test, expect } from '@playwright/test';

test.describe('Quick Smoke Tests', () => {
  test('homepage loads', async ({ page }) => {
    const response = await page.goto('/');
    expect(response?.status()).toBe(200);
    // Just check page loads, don't wait for content
  });

  test('signin page loads', async ({ page }) => {
    const response = await page.goto('/auth/signin');
    expect(response?.status()).toBe(200);
  });
});

