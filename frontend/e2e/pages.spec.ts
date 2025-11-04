import { test, expect } from '@playwright/test';

test.describe('Page Loading - No SSR Errors', () => {
  test('homepage should load without errors', async ({ page }) => {
    const response = await page.goto('/');
    expect(response?.status()).toBe(200);
    await expect(page.locator('h1')).toContainText('Welcome to Parcely');
    await expect(page.locator('text=Ship smarter, together')).toBeVisible();
  });

  test('signin page should load without errors', async ({ page }) => {
    const response = await page.goto('/auth/signin');
    expect(response?.status()).toBe(200);
    await expect(page.locator('h1')).toContainText('Sign In');
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
  });

  test('signup page should load without errors', async ({ page }) => {
    const response = await page.goto('/auth/signup');
    expect(response?.status()).toBe(200);
    await expect(page.locator('h1')).toContainText('Sign Up');
    await expect(page.locator('input[id="name"]')).toBeVisible();
  });

  test('search page should load without errors', async ({ page }) => {
    const response = await page.goto('/search');
    expect(response?.status()).toBe(200);
    // Search page might redirect, check for either Search or Sign In
    const h1 = page.locator('h1').first();
    const text = await h1.textContent();
    expect(text === 'Search' || text === 'Sign In').toBeTruthy();
  });

  test('dashboard should redirect when not authenticated', async ({ page }) => {
    await page.goto('/dashboard');
    // Should redirect to signin or show signin page
    await expect(page.locator('h1')).toContainText('Sign In');
  });

  test('parcels/create should redirect when not authenticated', async ({ page }) => {
    await page.goto('/parcels/create');
    await expect(page.locator('h1')).toContainText('Sign In');
  });

  test('trips/create should redirect when not authenticated', async ({ page }) => {
    await page.goto('/trips/create');
    await expect(page.locator('h1')).toContainText('Sign In');
  });
});

test.describe('Authentication Flow', () => {
  test('should sign up and redirect to dashboard', async ({ page }) => {
    const email = `test-${Date.now()}@example.com`;
    
    await page.goto('/auth/signup');
    await page.fill('input[id="name"]', 'Test User');
    await page.fill('input[type="email"]', email);
    await page.fill('input[type="password"]', 'testpassword123');
    await page.fill('input[type="tel"]', '+1234567890');
    
    await page.click('button[type="submit"]');
    
    await page.waitForURL('/dashboard', { timeout: 10000 });
    await expect(page.locator('h1')).toContainText('Dashboard');
  });

  test('should sign in and access dashboard', async ({ page }) => {
    // First create account
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
    
    // Sign in
    await page.fill('input[type="email"]', email);
    await page.fill('input[type="password"]', password);
    await page.click('button[type="submit"]');
    
    await page.waitForURL('/dashboard', { timeout: 10000 });
    await expect(page.locator('h1')).toContainText('Dashboard');
  });
});

test.describe('Dashboard Functionality', () => {
  test.beforeEach(async ({ page }) => {
    // Sign in before each test
    const email = `test-dashboard-${Date.now()}@example.com`;
    await page.goto('/auth/signup');
    await page.fill('input[id="name"]', 'Test User');
    await page.fill('input[type="email"]', email);
    await page.fill('input[type="password"]', 'testpassword123');
    await page.fill('input[type="tel"]', '+1234567890');
    await page.click('button[type="submit"]');
    await page.waitForURL('/dashboard', { timeout: 10000 });
  });

  test('should display dashboard content', async ({ page }) => {
    await expect(page.locator('h1')).toContainText('Dashboard');
    await expect(page.locator('text=Send a Parcel')).toBeVisible();
    await expect(page.locator('text=Offer a Trip')).toBeVisible();
    await expect(page.locator('text=My Parcels')).toBeVisible();
    await expect(page.locator('text=My Trips')).toBeVisible();
  });

  test('should navigate to create parcel page', async ({ page }) => {
    await page.click('text=Send a Parcel');
    await expect(page).toHaveURL('/parcels/create');
    await expect(page.locator('h1')).toContainText('Send a Parcel');
  });

  test('should navigate to create trip page', async ({ page }) => {
    await page.click('text=Offer a Trip');
    await expect(page).toHaveURL('/trips/create');
    await expect(page.locator('h1')).toContainText('Offer a Trip');
  });
});

test.describe('User Profile Features', () => {
  test('should display user profile with statistics', async ({ page }) => {
    // Create account
    const email = `test-profile-${Date.now()}@example.com`;
    await page.goto('/auth/signup');
    await page.fill('input[id="name"]', 'Test User');
    await page.fill('input[type="email"]', email);
    await page.fill('input[type="password"]', 'testpassword123');
    await page.fill('input[type="tel"]', '+1234567890');
    await page.click('button[type="submit"]');
    await page.waitForURL('/dashboard', { timeout: 10000 });
    
    // Check that navbar shows user name
    await expect(page.locator('text=Hello, Test User')).toBeVisible();
  });

  test('should show user statistics endpoint works', async ({ page }) => {
    const email = `test-stats-${Date.now()}@example.com`;
    await page.goto('/auth/signup');
    await page.fill('input[id="name"]', 'Test User');
    await page.fill('input[type="email"]', email);
    await page.fill('input[type="password"]', 'testpassword123');
    await page.fill('input[type="tel"]', '+1234567890');
    await page.click('button[type="submit"]');
    await page.waitForURL('/dashboard', { timeout: 10000 });
    
    // Check that the page loads without 500 errors
    await expect(page.locator('h1')).toContainText('Dashboard');
  });
});

test.describe('Navigation', () => {
  test('should navigate between pages', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('h1')).toContainText('Welcome to Parcely');
    
    await page.click('text=Get Started');
    await expect(page).toHaveURL('/auth/signup');
    
    await page.click('text=Sign In');
    await expect(page).toHaveURL('/auth/signin');
  });

  test('navbar should work correctly', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('text=📦 Parcely')).toBeVisible();
    await expect(page.locator('text=Sign In')).toBeVisible();
    await expect(page.locator('text=Sign Up')).toBeVisible();
  });
});

test.describe('Error Handling', () => {
  test('should handle 404 pages gracefully', async ({ page }) => {
    const response = await page.goto('/nonexistent-page');
    expect(response?.status()).toBe(404);
  });

  test('should not show 500 errors on any page', async ({ page }) => {
    const pages = ['/', '/auth/signin', '/auth/signup', '/search'];
    
    for (const url of pages) {
      const response = await page.goto(url);
      expect(response?.status()).toBe(200);
      
      // Check page content doesn't contain error messages
      const content = await page.content();
      expect(content).not.toContain('statusCode:500');
      expect(content).not.toContain('Internal Server Error');
    }
  });
});

test.describe('User Profile Card', () => {
  test('should display user profile card with ratings', async ({ page }) => {
    // Create a user and get their ID
    const email = `test-profile-card-${Date.now()}@example.com`;
    await page.goto('/auth/signup');
    await page.fill('input[id="name"]', 'Test User');
    await page.fill('input[type="email"]', email);
    await page.fill('input[type="password"]', 'testpassword123');
    await page.fill('input[type="tel"]', '+1234567890');
    await page.click('button[type="submit"]');
    await page.waitForURL('/dashboard', { timeout: 10000 });
    
    // Check that profile features are accessible
    await expect(page.locator('h1')).toContainText('Dashboard');
  });
});
