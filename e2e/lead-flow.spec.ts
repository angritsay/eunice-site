// A visitor opens the form from different places on the site. Each submission is stored
// with the variant's own fields and the entry point it came from, and reaches the right
// inbox as an email ops can answer with one click — all under one trace.
import { expect, type Page, test } from '@playwright/test';
import { eventually, mailFor, mailsFrom, submissionsFor, traceSpans } from './stack.ts';

let n = 0;
const address = () => `e2e-${Date.now()}-${process.pid}-${n++}@example.com`;

/** Opens a page with a controllable clock, so "time spent on the form" is not a real wait. */
async function visit(page: Page, path: string) {
  const csp: string[] = [];
  page.on('console', (m) => {
    if (m.type() === 'error' && /Content Security Policy/i.test(m.text())) csp.push(m.text());
  });
  await page.clock.install();
  await page.goto(path);
  return csp;
}

const form = (page: Page) => page.locator('#talk fieldset:not([disabled])');

async function send(page: Page) {
  // Past the minimum a person needs to fill a form, or intake discards it as a bot.
  await page.clock.fastForward('00:05');
  await page.locator('#talk [type="submit"]').click();
}

test('Private Markets, from the hero on the LPs page', async ({ page }) => {
  const csp = await visit(page, '/private-markets/lps/?utm_source=newsletter&utm_campaign=q4');
  await page.locator('main [data-form="private-markets"][data-placement="hero"]').first().click();

  await expect(page.locator('#talk-title')).toHaveText('Talk to the Private Markets desk');
  await expect(form(page).locator('[name="fund"]')).toBeVisible();
  await expect(form(page).locator('[name="token"]')).toHaveCount(0);

  const email = address();
  await form(page).locator('[name="name"]').fill('Jane Doe');
  await form(page).locator('[name="email"]').fill(email);
  await form(page).locator('[name="company"]').fill('Acme Capital');
  await form(page).locator('[name="fund"]').fill('Gridiron Fund V');
  const request = page.waitForRequest((r) => r.url().endsWith('/v1/submissions'));
  await send(page);
  const traceId = (await request).headers()['traceparent']?.split('-')[1] ?? '';

  await expect(page.locator('#talk')).toHaveClass(/is-done/);
  const [row] = submissionsFor(email);
  expect(row).toMatchObject({
    variant: 'private-markets',
    desk: 'Private Markets',
    queue: 'leads',
    company: 'Acme Capital',
    details: { fund: 'Gridiron Fund V' },
    entry_page: 'private-markets/lps/',
    entry_placement: 'hero',
    entry_audience: 'lps',
    utm: { source: 'newsletter', campaign: 'q4' },
  });
  expect(csp).toEqual([]);

  // Ops hears about it: the right inbox, a subject that says where it came from, and a
  // reply that goes straight to the lead.
  const [mail] = await mailFor(email);
  expect(mail?.Subject).toBe('[Private Markets · lps · hero] Jane Doe — Acme Capital');
  expect(mail?.To.map((t) => t.Address)).toEqual(['ops@eunice.local']);
  expect(mail?.ReplyTo).toEqual([{ Address: email, Name: 'Jane Doe' }]);
  expect(mail?.Text).toMatch(/Fund:\s+Gridiron Fund V/);
  expect(mail?.Text).toContain('utm_source=newsletter, utm_campaign=q4');

  // One trace, started in the browser, through intake, the broker and notifier.
  const spans = await eventually(async () => {
    const s = await traceSpans(traceId);
    return s.some((x) => x.service === 'notifier' && x.name.endsWith('process')) ? s : undefined;
  });
  expect(spans).toEqual(
    expect.arrayContaining([
      { service: 'intake', name: 'POST /v1/submissions' },
      { service: 'intake', name: 'intake.submission.received.v1 publish' },
      { service: 'notifier', name: 'intake.submission.received.v1 process' },
    ]),
  );
});

test('Token Disclosure, from the band on the Digital Assets page', async ({ page }) => {
  await visit(page, '/digital-assets/');
  await page.locator('[data-form="token-disclosure"][data-placement="band"]').click();

  await expect(page.locator('#talk-title')).toHaveText('Start a white paper');
  const email = address();
  await form(page).locator('[name="name"]').fill('Sam Issuer');
  await form(page).locator('[name="email"]').fill(email);
  await form(page).locator('[name="token"]').fill('ACME');
  await form(page).locator('[name="jurisdiction"]').selectOption('United Kingdom');
  await send(page);

  await expect(page.locator('#talk')).toHaveClass(/is-done/);
  expect(submissionsFor(email)).toMatchObject([
    {
      variant: 'token-disclosure',
      details: { token: 'ACME', jurisdiction: 'United Kingdom' },
      entry_page: 'digital-assets/',
      entry_placement: 'band',
      entry_audience: null,
    },
  ]);
});

test('an application, from a role on the careers page', async ({ page }) => {
  await visit(page, '/careers/');
  await page.locator('[data-form="careers"][data-role="Senior Software / AI Engineer"]').click();

  await expect(page.locator('#talk-title')).toHaveText('Apply: Senior Software / AI Engineer');
  const email = address();
  await form(page).locator('[name="name"]').fill('Alex Engineer');
  await form(page).locator('[name="email"]').fill(email);
  await form(page).locator('[name="link"]').fill('https://github.com/alex');
  await form(page).locator('[name="message"]').fill('I like hard problems with real stakes.');
  await send(page);

  await expect(page.locator('#talk')).toHaveClass(/is-done/);
  const [mail] = await mailFor(email);
  expect(mail?.To.map((t) => t.Address)).toEqual(['careers@eunice.local']);
  expect(mail?.Subject).toBe('[Careers · Senior Software / AI Engineer · roles] Alex Engineer');
  expect(submissionsFor(email)).toMatchObject([
    {
      variant: 'careers',
      queue: 'careers',
      details: { link: 'https://github.com/alex' },
      entry_page: 'careers/',
      entry_placement: 'roles',
      entry_role: 'Senior Software / AI Engineer',
    },
  ]);
});

test('a field the server rejects is marked, and nothing is stored', async ({ page }) => {
  await visit(page, '/careers/');
  await page.locator('[data-form="careers"][data-placement="roles"]').first().click();

  const email = address();
  await form(page).locator('[name="name"]').fill('Alex Engineer');
  await form(page).locator('[name="email"]').fill(email);
  // A valid URL to the browser, but intake accepts https links only.
  await form(page).locator('[name="link"]').fill('http://insecure.example');
  await form(page).locator('[name="message"]').fill('Hello');
  await send(page);

  await expect(page.locator('#talk [data-error]')).toBeVisible();
  await expect(form(page).locator('[name="link"]')).toHaveAttribute('aria-invalid', 'true');
  expect(submissionsFor(email)).toEqual([]);
});

test('a bot that fills the hidden field is told "thank you", and nothing is stored', async ({ page }) => {
  await visit(page, '/');
  await page.locator('[data-form][data-placement="hero"]').first().click();
  const email = address();
  await form(page).locator('[name="name"]').fill('Bot');
  await form(page).locator('[name="email"]').fill(email);
  await page.locator('#talk [name="website"]').evaluate((el: HTMLInputElement) => {
    el.value = 'https://spam.example';
  });
  await send(page);

  await expect(page.locator('#talk')).toHaveClass(/is-done/);
  expect(submissionsFor(email)).toEqual([]);
  await new Promise((r) => setTimeout(r, 2000));
  expect(await mailsFrom(email)).toEqual([]);
});
