// axe-core against WCAG 2.2 AA on every page.
//
// Known issues live in known-a11y.json, one entry per rule and element, each with a
// reason. The list is a ratchet: a violation not on it fails, and so does an entry
// that no longer matches anything, so a fix has to delete its entry in the same PR
// and the file can only shrink. Entries are per element, not per rule, so a known
// issue on one element cannot hide a new one elsewhere on the page.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
// Named import: the package's exports map serves its CommonJS types to ESM importers,
// under which the default export does not type-check.
import { AxeBuilder } from '@axe-core/playwright';
import { expect, test } from '@playwright/test';
import { BASE, label, PAGES } from './site.ts';

type Known = { rule: string; target: string; reason: string };
const KNOWN_FILE = path.join(path.dirname(fileURLToPath(import.meta.url)), 'known-a11y.json');
const known: Record<string, Known[]> = JSON.parse(fs.readFileSync(KNOWN_FILE, 'utf8')).pages;

for (const page of PAGES) {
  test(`${label(page)} meets WCAG 2.2 AA`, async ({ page: p }) => {
    await p.goto(BASE + page);
    const { violations } = await new AxeBuilder({ page: p })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
      .analyze();

    const entries = known[label(page)] ?? [];
    const used = new Set<Known>();
    const unexpected: string[] = [];
    for (const v of violations) {
      for (const node of v.nodes) {
        const target = node.target.join(' ');
        const match = entries.find((k) => k.rule === v.id && target.includes(k.target));
        if (match) used.add(match);
        else unexpected.push(`${v.id} on ${target}: ${node.failureSummary?.split('\n')[1]?.trim() ?? v.help}`);
      }
    }
    const stale = entries
      .filter((k) => !used.has(k))
      .map((k) => `fixed? remove from known-a11y.json: ${k.rule} on ${k.target}`);
    expect([...unexpected, ...stale]).toEqual([]);
  });
}
