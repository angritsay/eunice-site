// Layout holds at every width the site is read at, and fingers can hit what they
// need to. These are the checks that caught the hidden London photograph and the
// 11px footer links; they run on every page so a new page cannot regress them.
import { test, expect, type Page } from '@playwright/test';
import { PAGES, BASE, label } from './site.ts';

const WIDTHS = [
  { name: 'phone', width: 390, touch: true },
  { name: 'tablet', width: 768, touch: true },
  { name: 'tablet-landscape', width: 1024, touch: true },
  { name: 'laptop', width: 1280, touch: false },
  { name: 'desktop', width: 1440, touch: false },
] as const;

/** WCAG 2.2 SC 2.5.8 (AA): pointer targets at least 24 × 24 CSS px. */
const MIN_TARGET = 24;

const overflow = (page: Page) => page.evaluate(() =>
  document.documentElement.scrollWidth - document.documentElement.clientWidth);

const smallTargets = (page: Page, min: number) => page.evaluate((m) =>
  [...document.querySelectorAll<HTMLElement>('a, button')]
    .filter((el) => { const r = el.getBoundingClientRect(); return r.width > 0 && r.height > 0 && getComputedStyle(el).visibility !== 'hidden'; })
    .map((el) => { const r = el.getBoundingClientRect(); return { text: (el.textContent || el.getAttribute('aria-label') || '').trim().slice(0, 30), w: Math.round(r.width), h: Math.round(r.height) }; })
    .filter((t) => t.w < m || t.h < m), min);

for (const w of WIDTHS) {
  test.describe(`${w.name} ${w.width}px`, () => {
    test.use({ viewport: { width: w.width, height: 900 }, hasTouch: w.touch, isMobile: w.touch && w.width < 800 });

    for (const page of PAGES) {
      test(`${label(page)}: no horizontal scroll${w.touch ? ', tappable targets' : ''}`, async ({ page: p }) => {
        await p.goto(BASE + page);
        expect(await overflow(p), 'page is wider than the viewport').toBeLessThanOrEqual(0);
        if (w.touch) expect(await smallTargets(p, MIN_TARGET)).toEqual([]);
      });
    }
  });
}

test.describe('base path', () => {
  // Pages serves the site under /eunice-site/; a custom domain would serve it at /.
  // Every internal reference is relative, so both must load without a single 404.
  for (const base of ['/', BASE]) {
    for (const page of PAGES) {
      test(`${label(page)} loads cleanly at ${base}`, async ({ page: p, baseURL }) => {
        const failed: string[] = [];
        p.on('response', (r) => { if (r.url().startsWith(baseURL!) && r.status() >= 400) failed.push(`${r.status()} ${r.url()}`); });
        await p.goto(base + page, { waitUntil: 'load' });
        expect(failed).toEqual([]);
      });
    }
  }
});
