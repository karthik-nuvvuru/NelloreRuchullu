import { defineConfig, devices } from '@playwright/test';

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';
const API_URL = process.env.API_URL || 'http://localhost:8000';
const IS_CI = !!process.env.CI;
const IS_DOCKER = !!process.env.DOCKER;

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: false,
  forbidOnly: IS_CI,
  retries: IS_CI ? 2 : 1,
  workers: 1,
  reporter: [
    ['list'],
    ['html', { outputFolder: 'tests/report', open: 'never' }],
    ['json', { outputFile: 'tests/report/results.json' }],
  ],
  use: {
    baseURL: BASE_URL,
    trace: 'retain-on-failure',
    screenshot: { mode: 'on', fullPage: true },
    video: { mode: 'on-first-retry', size: { width: 1280, height: 720 } },
    actionTimeout: 10_000,
    navigationTimeout: 30_000,
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'], viewport: { width: 1280, height: 720 } },
    },
  ],
  webServer: IS_DOCKER ? undefined : {
    command: 'cd web && npm run dev',
    url: BASE_URL,
    timeout: 60_000,
    reuseExistingServer: !process.env.CI,
  },
});
