import { defineConfig, devices } from '@playwright/test';
import { getConfig } from './src/config/Max_CommandEnv';

/**
 * Playwright BDD configuration for Cucumber/Gherkin tests
 */
const config = getConfig();

export default defineConfig({
  testDir: './tests/e2e/features',
  testMatch: '**/*.feature',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1,

  reporter: [
    ['html', { outputFolder: 'playwright-report' }],
    ['json', { outputFile: 'test-results/bdd-results.json' }],
    ['junit', { outputFile: 'test-results/bdd-junit.xml' }],
    ['list'],
  ],

  use: {
    baseURL: config.baseURL,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    actionTimeout: 10000,
    navigationTimeout: 30000,
  },

  projects: [
    {
      name: 'edge',
      use: {
        ...devices['Desktop Edge'],
        permissions: ['geolocation'],
        launchOptions: {
          args: ['--disable-dev-shm-usage'],
        },
      },
    },
  ],

  timeout: 60000,
  expect: {
    timeout: 10000,
  },
});
