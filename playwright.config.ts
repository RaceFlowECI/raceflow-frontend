import { defineConfig, devices } from '@playwright/test'

/**
 * E2E config. BASE_URL defaults to the local Vite dev server; override to
 * point at a deployed environment, e.g.:
 *   BASE_URL=https://lively-rock-0066b1e0f.7.azurestaticapps.net npx playwright test
 */
export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  retries: process.env.CI ? 1 : 0,
  reporter: 'html',
  use: {
    baseURL: process.env.BASE_URL || 'http://localhost:5173',
    trace: 'on-first-retry',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
  ],
})
