// Runs against the stack from compose.yaml, which must already be up:
//   docker compose up --wait && pnpm test:e2e
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: '.',
  testMatch: '*.spec.ts',
  fullyParallel: true,
  forbidOnly: !!process.env['CI'],
  reporter: process.env['CI'] ? [['github'], ['html', { open: 'never' }]] : 'list',
  use: {
    baseURL: process.env['E2E_BASE_URL'] ?? 'http://localhost:8080',
    launchOptions: process.env['PW_CHROMIUM_EXECUTABLE']
      ? { executablePath: process.env['PW_CHROMIUM_EXECUTABLE'] }
      : {},
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] }, testIgnore: 'resilience.spec.ts' },
    // Stops and starts containers, so it runs alone, after everything else.
    { name: 'resilience', testMatch: 'resilience.spec.ts', dependencies: ['chromium'] },
  ],
});
