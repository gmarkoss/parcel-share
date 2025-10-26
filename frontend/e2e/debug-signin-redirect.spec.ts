import { test, expect } from '@playwright/test';

test.describe('Debug Sign-in Redirect Issue', () => {
  test('should trace the sign-in redirect bug', async ({ page, context }) => {
    // Enable console logging
    page.on('console', msg => console.log('CONSOLE:', msg.text()));
    
    // Enable request/response logging
    page.on('request', request => {
      console.log(`REQUEST: ${request.method()} ${request.url()}`);
    });
    
    page.on('response', response => {
      console.log(`RESPONSE: ${response.status()} ${response.url()}`);
    });

    // Start tracing
    await context.tracing.start({ screenshots: true, snapshots: true });

    console.log('Step 1: Navigate to signup page');
    await page.goto('http://localhost:3004/auth/signup');
    await expect(page).toHaveURL(/auth\/signup/);
    await page.screenshot({ path: 'test-results/1-signup-page.png' });

    console.log('Step 2: Fill signup form');
    await page.fill('input[id="name"]', 'Test User');
    const timestamp = Date.now();
    const email = `test-${timestamp}@example.com`;
    await page.fill('input[type="email"]', email);
    await page.fill('input[type="password"]', 'testpassword123');
    await page.fill('input[type="tel"]', '+1234567890');
    await page.screenshot({ path: 'test-results/2-filled-form.png' });

    console.log('Step 3: Submit form');
    await page.click('button[type="submit"]');
    await page.screenshot({ path: 'test-results/3-after-submit.png' });

    console.log('Step 4: Wait for navigation');
    // Wait for navigation to complete (timeout after 5 seconds)
    try {
      await page.waitForURL(/dashboard/, { timeout: 5000 });
      console.log('SUCCESS: Redirected to dashboard');
      await page.screenshot({ path: 'test-results/4-on-dashboard.png' });
      await expect(page).toHaveURL(/dashboard/);
      
      // Wait a bit to see if redirected back
      await page.waitForTimeout(2000);
      const currentUrl = page.url();
      console.log(`Current URL after waiting: ${currentUrl}`);
      await page.screenshot({ path: 'test-results/5-after-wait.png' });
      
      if (currentUrl.includes('/auth/signin')) {
        console.log('BUG: Got redirected back to signin page');
        await page.screenshot({ path: 'test-results/6-redirected-back.png' });
      }
    } catch (error) {
      console.log('FAILED: Did not land on dashboard');
      const finalUrl = page.url();
      console.log(`Final URL: ${finalUrl}`);
      await page.screenshot({ path: 'test-results/4-not-on-dashboard.png' });
    }

    // Stop tracing and save
    await context.tracing.stop({ path: 'test-results/signin-redirect-trace.zip' });
    console.log('Tracing saved to test-results/signin-redirect-trace.zip');
  });
});

