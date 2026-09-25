// What the web tests share: the canonical page list, where the build lives, and how
// to read a built page. Everything here is plain file access — no browser.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import urls from './urls.json' with { type: 'json' };

export const DIST = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..', 'dist');
export const PAGES: readonly string[] = urls.pages;

/** The site is served under this base in CI, as it is on GitHub Pages. */
export const BASE = '/eunice-site/';

export const fileFor = (page: string) => path.join(DIST, page, 'index.html');
export const readPage = (page: string) => fs.readFileSync(fileFor(page), 'utf8');

/** A readable name for a page in test titles and golden file names. */
export const label = (page: string) => (page === '' ? 'home' : page.replace(/\/$/, '').replaceAll('/', '__'));

/** Every index.html the build actually wrote, as page paths. */
export function builtPages(): string[] {
  const out: string[] = [];
  const walk = (dir: string) => {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) { if (entry.name !== 'assets') walk(full); }
      else if (entry.name === 'index.html') {
        const rel = path.relative(DIST, path.dirname(full));
        out.push(rel === '' ? '' : rel.split(path.sep).join('/') + '/');
      }
    }
  };
  walk(DIST);
  return out.sort();
}
