/** @type {import('@playwright/test').PlaywrightTestConfig} */
const config = {
  webServer: {
    command: 'npx http-server -c-1 -p 8080',
    url: 'http://localhost:8080',
    reuseExistingServer: !process.env.CI,
    timeout: 30000,
  },
  testDir: './tests/e2e',
  use: {
    headless: true,
    baseURL: 'http://localhost:8080',
    viewport: { width: 1280, height: 800 },
  },
};
module.exports = config;
