// Layout holds at every width the site is read at, and fingers can hit what they
// need to. These are the checks that caught the hidden London photograph and the
// 11px footer links; they run on every page so a new page cannot regress them.
import { expect, type Page, test } from '@playwright/test';
import { BASE, label, PAGES } from './site.ts';

const WIDTHS = [
  { name: 'phone', width: 390, touch: true },
  { name: 'tablet', width: 768, touch: true },
  { name: 'tablet-landscape', width: 1024, touch: true },
  { name: 'laptop', width: 1280, touch: false },
  { name: 'desktop', width: 1440, touch: false },
] as const;

/** WCAG 2.2 SC 2.5.8 (AA): pointer targets at least 24 × 24 CSS px. */
const MIN_TARGET = 24;

const overflow = (page: Page) =>
  page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);

const smallTargets = (page: Page, min: number) =>
  page.evaluate(
    (m) =>
      [...document.querySelectorAll<HTMLElement>('a, button')]
        .filter((el) => {
          const r = el.getBoundingClientRect();
          return r.width > 0 && r.height > 0 && getComputedStyle(el).visibility !== 'hidden';
        })
        .map((el) => {
          const r = el.getBoundingClientRect();
          return {
            text: (el.textContent || el.getAttribute('aria-label') || '').trim().slice(0, 30),
            w: Math.round(r.width),
            h: Math.round(r.height),
          };
        })
        .filter((t) => t.w < m || t.h < m),
    min,
  );

/** Space between one block of a page and the next: 80px on phones and tablets, 96px wider. */
const minGap = (width: number) => (width < 1024 ? 80 : 96);

// The gap between each pair of neighbouring blocks in <main>: from the last thing you
// can see in one to the first in the next, or to the edge of a block with a background.
// A block that forgets its spacing (as the feature rows once did) fails here.
const tightGaps = (page: Page, min: number) =>
  page.evaluate((m) => {
    const visible = (el: Element) => {
      const r = el.getBoundingClientRect();
      return r.height > 0 && getComputedStyle(el).visibility !== 'hidden';
    };
    const filled = (el: Element) => getComputedStyle(el).backgroundColor !== 'rgba(0, 0, 0, 0)';
    // What you can see of an element: its box, cut to any ancestor that clips its
    // overflow (the hero screenshot runs past the bottom of its frame on purpose).
    const seen = (el: Element, end: 'top' | 'bottom') => {
      let v = el.getBoundingClientRect()[end];
      for (let a = el.parentElement; a && a !== document.body; a = a.parentElement) {
        const o = getComputedStyle(a);
        if (o.overflowX === 'visible' && o.overflowY === 'visible') continue;
        const box = a.getBoundingClientRect();
        v = end === 'top' ? Math.max(v, box.top) : Math.min(v, box.bottom);
      }
      return v;
    };
    const edge = (el: Element, end: 'top' | 'bottom') => {
      if (filled(el)) return el.getBoundingClientRect()[end];
      const rects = [...el.querySelectorAll('*')].filter(visible).map((x) => seen(x, end));
      if (!rects.length) return el.getBoundingClientRect()[end];
      return end === 'top' ? Math.min(...rects) : Math.max(...rects);
    };
    const content = (el: Element, end: 'top' | 'bottom') => {
      const rects = [...el.querySelectorAll('*')].filter(visible).map((x) => seen(x, end));
      return end === 'top' ? Math.min(...rects) : Math.max(...rects);
    };
    const name = (el: Element) => (el.id ? `#${el.id}` : `.${[...el.classList].join('.')}`);
    const blocks = [...(document.querySelector('main')?.children ?? [])].filter(visible);
    const between = blocks.slice(1).flatMap((next, i) => {
      const prev = blocks[i] as Element;
      const gap = Math.round(edge(next, 'top') - edge(prev, 'bottom'));
      return gap < m ? [`${name(prev)} → ${name(next)}: ${gap}px`] : [];
    });
    // Inside a section with a background, its content keeps the same distance from
    // both edges (as the dark band on the welcome page once did not, at the bottom).
    const inside = blocks
      .filter((el) => el.tagName === 'SECTION' && filled(el) && el.querySelector('*'))
      .flatMap((el) => {
        const box = el.getBoundingClientRect();
        const top = Math.round(content(el, 'top') - box.top);
        const bottom = Math.round(box.bottom - content(el, 'bottom'));
        return [
          ...(top < m ? [`inside ${name(el)}, top: ${top}px`] : []),
          ...(bottom < m ? [`inside ${name(el)}, bottom: ${bottom}px`] : []),
        ];
      });
    return [...between, ...inside];
  }, min);

for (const w of WIDTHS) {
  test.describe(`${w.name} ${w.width}px`, () => {
    test.use({ viewport: { width: w.width, height: 900 }, hasTouch: w.touch, isMobile: w.touch && w.width < 800 });

    for (const page of PAGES) {
      test(`${label(page)}: no horizontal scroll${w.touch ? ', tappable targets' : ''}, room between blocks`, async ({
        page: p,
      }) => {
        await p.goto(BASE + page);
        expect(await overflow(p), 'page is wider than the viewport').toBeLessThanOrEqual(0);
        if (w.touch) expect(await smallTargets(p, MIN_TARGET)).toEqual([]);
        expect(await tightGaps(p, minGap(w.width)), 'blocks too close together').toEqual([]);
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
        if (!baseURL) throw new Error('playwright.config.ts must set use.baseURL');
        const origin = baseURL;
        const failed: string[] = [];
        p.on('response', (r) => {
          if (r.url().startsWith(origin) && r.status() >= 400) failed.push(`${r.status()} ${r.url()}`);
        });
        await p.goto(base + page, { waitUntil: 'load' });
        expect(failed).toEqual([]);
      });
    }
  }
});

// The team strip on the welcome page: exactly one person open at a time, and the one
// you point at (wide screens) or tap (phones) is the one that opens.
test.describe('team strip', () => {
  const open = (p: Page) => p.locator('.pstrip__item.is-open');

  test('on the welcome page, Petronela is the one open when it loads', async ({ page }) => {
    await page.goto(BASE);
    await expect(open(page)).toHaveCount(1);
    await expect(open(page).locator('.pstrip__name')).toHaveText('Petronela Pell');
  });

  test('pointing at a person opens them and collapses the rest', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto(BASE);
    await expect(open(page)).toHaveCount(1);
    const third = page.locator('.pstrip__item').nth(2);
    await third.hover();
    await expect(third).toHaveClass(/is-open/);
    await expect(open(page)).toHaveCount(1);
    await expect(third.locator('.pstrip__face')).toHaveAttribute('aria-expanded', 'true');
    await page.waitForTimeout(400); // the width transition
    const wide = (await third.boundingBox())?.width ?? 0;
    const narrow = (await page.locator('.pstrip__item').first().boundingBox())?.width ?? 0;
    expect(wide).toBeGreaterThan(narrow * 2);
    await page.mouse.move(5, 5); // leaving the row keeps the last person open
    await expect(third).toHaveClass(/is-open/);
  });

  test('on a phone, tapping a person opens their row', async ({ browser }) => {
    const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true });
    const page = await ctx.newPage();
    await page.goto(BASE);
    const second = page.locator('.pstrip__item').nth(1);
    await second.locator('.pstrip__face').tap();
    await expect(second).toHaveClass(/is-open/);
    await expect(second.locator('.pstrip__info')).toBeVisible();
    await expect(open(page)).toHaveCount(1);
    await ctx.close();
  });
});

// The film in the welcome page's hero, drawn in HTML: it steps through its scenes by
// itself, holds while the pointer rests on it, and a visitor who asks for reduced
// motion gets it still on its first scene.
test.describe('home film', () => {
  test.use({ reducedMotion: 'no-preference' });
  const film = (p: Page) => p.locator('.hero-center [data-film]');
  const step = (p: Page) => film(p).getAttribute('data-step');

  test('steps through its scenes on its own, and holds under the pointer', async ({ page }) => {
    await page.goto(BASE);
    await expect(film(page)).toHaveAttribute('data-step', '0');
    await expect(film(page).locator('.wf__scene.is-on')).toHaveCount(1);
    await expect(film(page)).toHaveAttribute('data-step', '1', { timeout: 10_000 });
    await film(page).hover();
    const held = await step(page);
    await page.waitForTimeout(7_000);
    expect(await step(page)).toBe(held);
    await page.mouse.move(0, 0);
    await expect.poll(() => step(page), { timeout: 10_000 }).not.toBe(held);
  });

  test('on Private Markets it plays in "Delivered end to end"', async ({ page }) => {
    await page.goto(`${BASE}private-markets/`);
    const pmFilm = page.locator('#end-to-end [data-film]');
    await pmFilm.scrollIntoViewIfNeeded();
    await page.mouse.move(0, 0);
    await expect(pmFilm).toHaveAttribute('data-step', '1', { timeout: 10_000 });
    await expect(page.locator('.hero [data-film]')).toHaveCount(0); // the film is not the hero here
  });

  test('with reduced motion it stays still on its first scene', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto(BASE);
    await page.waitForTimeout(7_000);
    await expect(film(page)).toHaveAttribute('data-step', '0');
  });
});

// Blocks below the fold ease into place as they scroll into view; with reduced motion
// nothing is hidden or moved.
test.describe('reveal on scroll', () => {
  test('a block below the fold starts hidden and settles in view', async ({ browser }) => {
    const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: 'no-preference' });
    const page = await ctx.newPage();
    await page.goto(BASE);
    const card = page.locator('#insights .icards > *').first();
    await expect(card).toHaveClass(/reveal/);
    await expect(card).toHaveCSS('opacity', '0');
    await card.scrollIntoViewIfNeeded();
    await expect(card).toHaveCSS('opacity', '1', { timeout: 5000 });
    await expect(card).not.toHaveClass(/reveal/, { timeout: 5000 });
    await ctx.close();
  });

  test('with reduced motion nothing is hidden', async ({ page }) => {
    await page.goto(BASE);
    await expect(page.locator('.reveal')).toHaveCount(0);
  });
});
