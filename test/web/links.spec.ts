// Every internal link and asset resolves to a file the build wrote, and every
// #fragment lands on an element that exists. Runs on the files, not in a browser,
// so it covers all pages in well under a second.
import fs from 'node:fs';
import path from 'node:path';
import { test, expect } from '@playwright/test';
import { DIST, PAGES, fileFor, readPage, label } from './site.ts';

/** Links that knowingly go nowhere yet. The list may only shrink. */
const PLACEHOLDER_LINKS = new Set(['Privacy', 'Terms', 'Status']);

const EXTERNAL = /^(?:[a-z][a-z0-9+.-]*:|\/\/)/i; // http:, mailto:, data:, //cdn…

const ids = new Map<string, Set<string>>();
function idsIn(file: string): Set<string> {
  if (!ids.has(file)) {
    const html = fs.readFileSync(file, 'utf8');
    ids.set(file, new Set([...html.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1]!)));
  }
  return ids.get(file)!;
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

    for (const [, text] of html.matchAll(/<a href="#">([^<]*)<\/a>/g)) {
      if (!PLACEHOLDER_LINKS.has(text!)) problems.push(`href="#" on "${text}"`);
    }

    for (const [, raw] of html.matchAll(/\s(?:href|src)="([^"]*)"/g)) {
      const ref = raw!;
      if (ref === '#' || EXTERNAL.test(ref)) continue;
      const [pathAndQuery, fragment] = ref.split('#') as [string, string | undefined];
      const pathPart = pathAndQuery.split('?')[0]!;
      const dest = pathPart === '' || pathPart === './' ? file : target(file, pathPart);
      if (!dest.startsWith(DIST)) { problems.push(`${ref} leaves the site`); continue; }
      if (!fs.existsSync(dest)) { problems.push(`${ref} → missing ${path.relative(DIST, dest)}`); continue; }
      if (fragment && dest.endsWith('.html') && !idsIn(dest).has(fragment)) {
        problems.push(`${ref} → no id="${fragment}" on ${path.relative(DIST, dest)}`);
      }
    }
    expect(problems).toEqual([]);
  });
}
