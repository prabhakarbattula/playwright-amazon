// playwright.config.js
import { defineConfig } from '@playwright/test';

export default defineConfig({
  timeout: 600000,
  use: {
    headless: false,
    viewport: { width: 1340, height: 720 },
    ignoreHTTPSErrors: true,
    screenshot: 'always',
    video: 'always',
    trace: 'retain-on-failure',
  },
  reporter: [['html', { open: 'never' }]],
  projects: [
    {
      name: 'chromium',
      use: { browserName: 'chromium' },
      slowMo: 700,
    },
    // {
    //   name: 'firefox',
    //   use: { browserName: 'firefox' },
    //   slowMo: 700,
    // },
    // {
    //   name: 'webkit',
    //   use: { browserName: 'webkit' },
    // },
  ],
  testDir: './tests',
});
