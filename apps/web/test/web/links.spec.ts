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

// The header: the same three menus on every page, and no product sign-in on any of them.
test('every page has the three menus and no User login', () => {
  for (const page of PAGES) {
    const header = readPage(page).match(/<header class="wrap nav">[\s\S]*?<\/header>/)?.[0] ?? '';
    const menus = [...header.matchAll(/class="menu__top"[^>]*>([^<]+)</g)].map(([, t]) => t);
    expect(menus, page).toEqual(['Welcome to Eunice', 'Private Markets', 'Digital Assets']);
    expect(header.includes('User login'), page).toBe(false);
  }
});

test('the hiring card in the team grid leads to the open roles', () => {
  const html = readPage('');
  expect(html).toMatch(/class="team__person team__hiring"[\s\S]*?href="careers\/#roles"/);
});

// Every LinkedIn link on a team card goes to a LinkedIn profile.
test('team LinkedIn links are profile links', () => {
  for (const page of PAGES) {
    for (const [, href] of readPage(page).matchAll(/class="team__in" href="([^"]+)"/g))
      expect(href, page).toMatch(/^https:\/\/www\.linkedin\.com\/in\/[^/]+\/$/);
  }
});

// One people component everywhere: every team section is the grid, with its own people.
test('every team section uses the one team grid', () => {
  const withTeam = PAGES.filter((p) => readPage(p).includes('id="team"'));
  expect(withTeam.length).toBeGreaterThanOrEqual(5);
  for (const page of withTeam) {
    const html = readPage(page);
    expect(html, page).toContain('class="team"');
    expect(html, page).not.toContain('pstrip');
    expect(html, page).not.toContain('class="person ');
  }
});
