import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './perf',
  testMatch: /.*\.perf\.spec\.ts/,
  timeout: 60_000,
  expect: {
    timeout: 5_000,
  },
  fullyParallel: false,
  reporter: [['list']],
  webServer: {
    command: 'pnpm --filter analog-ui perf:harness -- --host 127.0.0.1 --port 4177',
    url: 'http://127.0.0.1:4177/?case=slider-drag',
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
  use: {
    baseURL: 'http://127.0.0.1:4177',
    browserName: 'chromium',
    viewport: { width: 1100, height: 760 },
    trace: 'retain-on-failure',
    launchOptions: {
      args: ['--disable-dev-shm-usage'],
    },
  },
});
