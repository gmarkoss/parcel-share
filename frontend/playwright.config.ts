import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : 5, // Run 5 tests in parallel
  reporter: 'line',
  timeout: 15000, // 15 seconds per test
  expect: {
    timeout: 5000, // 5 seconds for assertions
  },
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'off', // Disable tracing for speed
    actionTimeout: 5000, // 5 seconds for actions
    navigationTimeout: 10000, // 10 seconds for navigation
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],

  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 30 * 1000, // 30 seconds to start server
  },
});


