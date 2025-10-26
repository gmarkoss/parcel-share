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

  test('should allow access to dashboard after signup', async ({ page }) => {
    await page.goto('/auth/signup');
    
    // Fill signup form
    await page.fill('input[id="name"]', 'Test User');
    await page.fill('input[type="email"]', `test-${Date.now()}@example.com`);
    await page.fill('input[type="password"]', 'testpassword123');
    await page.fill('input[type="tel"]', '+1234567890');
    
    // Submit form
    await page.click('button[type="submit"]');
    
    // Wait for redirect to dashboard
    await page.waitForURL('/dashboard', { timeout: 10000 });
    await expect(page).toHaveURL('/dashboard');
    
    // Verify dashboard content is visible
    await expect(page.locator('h1')).toContainText('Dashboard');
    await expect(page.locator('text=Send a Parcel')).toBeVisible();
    await expect(page.locator('text=Offer a Trip')).toBeVisible();
  });

  test('should allow access to dashboard after signin', async ({ page }) => {
    // First, create an account
    const email = `test-signin-${Date.now()}@example.com`;
    const password = 'testpassword123';
    
    await page.goto('/auth/signup');
    await page.fill('input[id="name"]', 'Test User');
    await page.fill('input[type="email"]', email);
    await page.fill('input[type="password"]', password);
    await page.fill('input[type="tel"]', '+1234567890');
    await page.click('button[type="submit"]');
    await page.waitForURL('/dashboard', { timeout: 10000 });
    
    // Sign out
    await page.click('button:has-text("Sign Out")');
    await page.waitForURL('/auth/signin', { timeout: 5000 });
    
    // Sign in again
    await page.goto('/auth/signin');
    await page.fill('input[type="email"]', email);
    await page.fill('input[type="password"]', password);
    await page.click('button[type="submit"]');
    
    // Should redirect to dashboard
    await page.waitForURL('/dashboard', { timeout: 10000 });
    await expect(page).toHaveURL('/dashboard');
    await expect(page.locator('h1')).toContainText('Dashboard');
  });
});


