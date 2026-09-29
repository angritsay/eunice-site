// The fact base (people and team in src/content/index.ts) quotes the live careers page,
// recorded in src/content/sources/eunice-careers.txt, and for people not on it yet, the
// owner's own words, recorded in src/content/sources/owner-notes.md. Every line must be
// in one of them, so the site says exactly what the company says about its team.
import fs from 'node:fs';
import { expect, test } from '@playwright/test';
import { people, team } from '../../src/content/index.ts';

const source = (file: string) => fs.readFileSync(new URL(`../../src/content/sources/${file}`, import.meta.url), 'utf8');
const recorded = source('eunice-careers.txt');
const owner = source('owner-notes.md');

// Typography may differ from the page; the words may not. Curly quotes are straight
// quotes, any dash is a hyphen, and "·" between two parts is the page's "-".
const norm = (s: string) =>
  s.replace(/[‘’]/g, "'").replace(/[“”]/g, '"').replace(/[—–·]/g, '-').replace(/\s+/g, ' ').trim();
const page = norm(
  recorded
    .split('\n')
    .filter((l) => !l.startsWith('#'))
    .join(' '),
);

const onThePage = (line: string) => page.includes(norm(line));
const fromOwner = norm(owner);

test('every line about a person is on the recorded careers page, or in the owner’s notes', () => {
  for (const [id, p] of Object.entries(people)) {
    for (const line of [p.name, p.role, ...p.facts])
      expect(onThePage(line) || fromOwner.includes(norm(line)), `${id}: ${line}`).toBe(true);
  }
});

test('every line about the team and the company is on the recorded careers page', () => {
  const lines = [
    team.headline,
    team.standfirst,
    team.intro,
    team.storyTitle,
    team.founded,
    ...team.story,
    team.hiring,
    team.perksTitle,
    ...team.perks.flatMap((p) => [p.title, p.text]),
  ];
  for (const line of lines) expect(onThePage(line), line).toBe(true);
});

test('everyone on the recorded careers page is in the fact base', () => {
  // The page lists each person as their name, then their title.
  const listed = Object.values(people).filter((p) => p.facts.length);
  expect(listed.length).toBeGreaterThan(0);
  for (const name of ['Yi Luo', 'Philip Lam', 'Petronela Pell', 'Vinay Manektalla', 'Chrislyn Pereira']) {
    expect(recorded.includes(name), `${name} on the page`).toBe(true);
    expect(
      listed.some((p) => p.name === name),
      `${name} in the fact base`,
    ).toBe(true);
  }
});
