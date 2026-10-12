// The site's motion is a small, exact system (docs/brand/motion.md). These checks hold
// its rules in place, so an edit that breaks the timing or the reduced-motion promise
// fails here with a pointer to the guide, not later on someone's screen.
import { expect, type Page, test } from '@playwright/test';
import { BASE, label, PAGES } from './site.ts';

const GUIDE = 'see docs/brand/motion.md';

// Every animation in the drawn product (not the film, which steps its own scenes), as
// the browser computed it, pseudo-elements included.
const drawingAnimations = (page: Page) =>
  page.evaluate(() => {
    const out: { where: string; name: string; duration: string; iterations: string; easing: string; delay: string }[] =
      [];
    const split = (v: string) => v.split(/,(?![^(]*\))/).map((s) => s.trim());
    for (const el of document.querySelectorAll('.wf:not(.wf--film) *')) {
      for (const pseudo of [null, '::before', '::after']) {
        const cs = getComputedStyle(el, pseudo);
        if (cs.animationName === 'none') continue;
        const names = split(cs.animationName);
        const durations = split(cs.animationDuration);
        const iterations = split(cs.animationIterationCount);
        const easings = split(cs.animationTimingFunction);
        const delays = split(cs.animationDelay);
        names.forEach((name, i) => {
          if (name === 'none') return;
          out.push({
            where: `${(el as HTMLElement).className}${pseudo ?? ''}`,
            name,
            duration: durations[i % durations.length] ?? '',
            iterations: iterations[i % iterations.length] ?? '',
            easing: easings[i % easings.length] ?? '',
            delay: delays[i % delays.length] ?? '',
          });
        });
      }
    }
    return out;
  });

test.describe('motion: the drawn product', () => {
  test.use({ reducedMotion: 'no-preference' });

  test('every drawing runs on the one nine-second loop', async ({ page }) => {
    await page.goto(`${BASE}private-markets/`);
    const anims = await drawingAnimations(page);
    expect(anims.length, 'the drawings should animate').toBeGreaterThan(10);
    // The caret blinks and the placeholder shimmers on their own clocks; nothing else does.
    const offLoop = anims.filter(
      (a) => !['wf-blink', 'wf-shimmer'].includes(a.name) && (a.duration !== '9s' || a.iterations !== 'infinite'),
    );
    expect(offLoop, `an animation left the nine-second loop (${GUIDE})`).toEqual([]);
  });

  test('entrances share one easing and step in 120ms apart', async ({ page }) => {
    await page.goto(`${BASE}private-markets/`);
    const entrances = (await drawingAnimations(page)).filter((a) => a.name === 'wf-in');
    expect(entrances.length).toBeGreaterThan(0);
    expect(new Set(entrances.map((a) => a.easing)), `wf-in uses one easing, --wf-ease (${GUIDE})`).toEqual(
      new Set(['cubic-bezier(0.22, 0.61, 0.36, 1)']),
    );
    const ladder = entrances
      .map((a) => ({ ...a, step: /\bwf__l(\d)\b/.exec(a.where)?.[1] }))
      .filter((a) => a.step !== undefined)
      .map((a) => ({
        where: a.where,
        delayMs: Math.round(Number.parseFloat(a.delay) * 1000),
        want: Number(a.step) * 120,
      }));
    expect(ladder.length).toBeGreaterThan(0);
    expect(
      ladder.filter((r) => r.delayMs !== r.want),
      `rows step in 120ms apart (${GUIDE})`,
    ).toEqual([]);
  });
});

// The promise to visitors who ask for less motion: nothing moves, on any page.
// (The test config runs with reduced motion by default.)
test.describe('motion: reduced motion', () => {
  for (const p of PAGES) {
    test(`nothing animates on ${label(p)}`, async ({ page }) => {
      await page.goto(`${BASE}${p}`);
      await page.waitForTimeout(300);
      const moving = await page.evaluate(() =>
        document
          .getAnimations()
          .filter((a) => a.playState === 'running')
          .map((a) => {
            const target = (a.effect as KeyframeEffect | null)?.target as HTMLElement | null;
            const name = 'animationName' in a ? (a as CSSAnimation).animationName : 'transition';
            return `${name} on ${target?.className || target?.tagName || '?'}`;
          }),
      );
      expect(moving, `something moves under prefers-reduced-motion (${GUIDE})`).toEqual([]);
    });
  }
});
