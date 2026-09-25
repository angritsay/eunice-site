import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    // Integration tests share one database container per file; give it time to start.
    hookTimeout: 120_000,
    testTimeout: 30_000,
  },
});
