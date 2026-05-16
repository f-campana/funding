import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  expect: {
    timeout: 10_000,
  },
  outputDir: 'test-results',
  reporter: 'list',
  testDir: './tests/e2e',
  use: {
    baseURL: 'http://127.0.0.1:3000',
    screenshot: 'only-on-failure',
    trace: 'retain-on-failure',
  },
  webServer: {
    command: 'pnpm start',
    reuseExistingServer: true,
    timeout: 120_000,
    url: 'http://127.0.0.1:3000',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
})
