// The HTML each page renders, normalised to one tag per line, compared with a
// committed golden copy. It is the safety net for refactors that must not change
// the output — moving files, converting the generator to TypeScript — and it puts
// the rendered diff in front of reviewers whenever output does change on purpose.
// Regenerate with: pnpm test:web:update
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { test, expect } from '@playwright/test';
import { PAGES, readPage, label } from './site.ts';

const GOLDEN = path.join(path.dirname(fileURLToPath(import.meta.url)), '__golden__');
const UPDATE = process.env.UPDATE_GOLDEN === '1';

export const normalise = (html: string) => html
  .replace(/\r\n/g, '\n')
  .replace(/>\s*</g, '>\n<')
  .split('\n')
  .map((line) => line.replace(/\s+/g, ' ').trim())
  .filter(Boolean)
  .join('\n') + '\n';

for (const page of PAGES) {
  test(`${label(page)} renders as recorded`, () => {
    const file = path.join(GOLDEN, `${label(page)}.html`);
    const actual = normalise(readPage(page));
    if (UPDATE || !fs.existsSync(file)) {
      fs.mkdirSync(GOLDEN, { recursive: true });
      fs.writeFileSync(file, actual);
      return;
    }
    expect(actual).toBe(fs.readFileSync(file, 'utf8'));
  });
}
