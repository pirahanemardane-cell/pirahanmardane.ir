// @ts-check
const { defineConfig } = require('@playwright/test')

module.exports = defineConfig({
  testDir: 'e2e',
  timeout: 60_000,
  retries: 1,
  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL || 'https://pirahanmardane.ir',
    trace: 'on-first-retry',
  },
  projects: [{ name: 'chromium', use: { browserName: 'chromium' } }],
})
