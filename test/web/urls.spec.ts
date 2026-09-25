import fs from 'node:fs';
import path from 'node:path';
import { test, expect } from '@playwright/test';
import { DIST, PAGES, builtPages } from './site.ts';

test('the build writes exactly the pages in urls.json', () => {
  const built = builtPages();
  const missing = PAGES.filter((p) => !built.includes(p));
  const unexpected = built.filter((p) => !PAGES.includes(p));
  expect({ missing, unexpected }).toEqual({ missing: [], unexpected: [] });
});

test('there is a 404 page', () => {
  expect(fs.existsSync(path.join(DIST, '404.html'))).toBe(true);
});
