import { defineConfig, devices } from '@playwright/test';

const PORT = Number(process.env['PORT'] || 4173);

export default defineConfig({
  testDir: 'test/web',
  fullyParallel: true,
  forbidOnly: !!process.env['CI'],
  retries: process.env['CI'] ? 1 : 0,
  reporter: process.env['CI'] ? [['github'], ['html', { open: 'never' }]] : 'list',
  use: {
    baseURL: `http://localhost:${PORT}`,
    // Checks measure the page at rest: blocks that ease in on scroll are shown at once.
    // The tests of motion itself (the films, the reveal) opt back in.
    reducedMotion: 'reduce',
    // The container this was built in ships its own Chromium; CI installs the one
    // matching this Playwright version. Point at a local binary only when asked to.
    launchOptions: process.env['PW_CHROMIUM_EXECUTABLE']
      ? { executablePath: process.env['PW_CHROMIUM_EXECUTABLE'] }
      : {},
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: {
    command: 'node scripts/serve-dist.mjs',
    url: `http://localhost:${PORT}/`,
    reuseExistingServer: !process.env['CI'],
    env: { PORT: String(PORT) },
  },
});
