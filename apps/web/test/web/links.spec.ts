// Every internal link and asset resolves to a file the build wrote, and every
// #fragment lands on an element that exists. Runs on the files, not in a browser,
// so it covers all pages in well under a second.
import fs from 'node:fs';
import path from 'node:path';
import { expect, test } from '@playwright/test';
import { DIST, fileFor, label, PAGES, readPage } from './site.ts';

/** Links that knowingly go nowhere yet. The list may only shrink. */
const PLACEHOLDER_LINKS = new Set<string>([]);

const EXTERNAL = /^(?:[a-z][a-z0-9+.-]*:|\/\/)/i; // http:, mailto:, data:, //cdn…

const ids = new Map<string, Set<string>>();
function idsIn(file: string): Set<string> {
  let found = ids.get(file);
  if (!found) {
    const html = fs.readFileSync(file, 'utf8');
    found = new Set([...html.matchAll(/\sid="([^"]+)"/g)].flatMap(([, id]) => (id ? [id] : [])));
    ids.set(file, found);
  }
  return found;
}

function target(fromFile: string, ref: string): string {
  const resolved = path.resolve(path.dirname(fromFile), ref);
  return fs.existsSync(resolved) && fs.statSync(resolved).isDirectory() ? path.join(resolved, 'index.html') : resolved;
}

for (const page of PAGES) {
  test(`links resolve on ${label(page)}`, () => {
    const file = fileFor(page);
    const html = readPage(page);
    const problems: string[] = [];

    for (const [, text = ''] of html.matchAll(/<a href="#">([^<]*)<\/a>/g)) {
      if (!PLACEHOLDER_LINKS.has(text)) problems.push(`href="#" on "${text}"`);
    }

    for (const [, ref = ''] of html.matchAll(/\s(?:href|src)="([^"]*)"/g)) {
      if (ref === '#' || EXTERNAL.test(ref)) continue;
      const [pathAndQuery = '', fragment] = ref.split('#');
      const [pathPart = ''] = pathAndQuery.split('?');
      const dest = pathPart === '' || pathPart === './' ? file : target(file, pathPart);
      if (!dest.startsWith(DIST)) {
        problems.push(`${ref} leaves the site`);
        continue;
      }
      if (!fs.existsSync(dest)) {
        problems.push(`${ref} → missing ${path.relative(DIST, dest)}`);
        continue;
      }
      if (fragment && dest.endsWith('.html') && !idsIn(dest).has(fragment)) {
        problems.push(`${ref} → no id="${fragment}" on ${path.relative(DIST, dest)}`);
      }
    }
    expect(problems).toEqual([]);
  });
}

// The header: the same three menus on every page, and the product sign-in only
// where its users are (digital assets clients).
test('every page has the three menus; User login shows only on the crypto pages', () => {
  for (const page of PAGES) {
    const header = readPage(page).match(/<header class="wrap nav">[\s\S]*?<\/header>/)?.[0] ?? '';
    const menus = [...header.matchAll(/class="menu__top"[^>]*>([^<]+)</g)].map(([, t]) => t);
    expect(menus, page).toEqual(['Welcome to Eunice', 'Private market tools', 'Crypto &amp; RWA']);
    const crypto = /^(digital-assets|token-disclosure|mica-whitepaper)\//.test(page);
    expect(header.includes('User login'), page).toBe(crypto);
  }
});

test('the vacancy on the welcome page leads to its job description', () => {
  const html = readPage('');
  expect(html).toMatch(
    /class="person person--portrait vacancy"[\s\S]*?href="careers\/client-implementation-consultant-private-markets\/"/,
  );
});
