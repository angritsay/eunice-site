// A visitor opens the form from different places on the site. Each submission is stored
// with the entry point it came from, and reaches the ops inbox as an email ops can
// answer with one click — all under one trace.
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
  // Name, email and a note: nothing else to fill.
  await expect(form(page).locator('input, textarea, select')).toHaveCount(3);

  const email = address();
  await form(page).locator('[name="name"]').fill('Jane Doe');
  await form(page).locator('[name="email"]').fill(email);
  await form(page).locator('[name="message"]').fill('Gridiron Fund V, committee in October');
  const request = page.waitForRequest((r) => r.url().endsWith('/v1/submissions'));
  await send(page);
  const traceId = (await request).headers()['traceparent']?.split('-')[1] ?? '';

  await expect(page.locator('#talk')).toHaveClass(/is-done/);
  const [row] = submissionsFor(email);
  expect(row).toMatchObject({
    variant: 'private-markets',
    desk: 'Private Markets',
    message: 'Gridiron Fund V, committee in October',
    details: {},
    entry_page: 'private-markets/lps/',
    entry_placement: 'hero',
    entry_audience: 'lps',
    utm: { source: 'newsletter', campaign: 'q4' },
  });
  expect(csp).toEqual([]);

  // Ops hears about it: the right inbox, a subject that says where it came from, and a
  // reply that goes straight to the lead.
  const [mail] = await mailFor(email);
  expect(mail?.Subject).toBe('[Private Markets · lps · hero] Jane Doe');
  expect(mail?.To.map((t) => t.Address)).toEqual(['ops@eunice.local']);
  expect(mail?.ReplyTo).toEqual([{ Address: email, Name: 'Jane Doe' }]);
  // One Message-ID per event, so a rare resend is de-duplicated by the mailbox.
  expect(mail?.MessageID).toMatch(/^[0-9a-f-]{36}@eunice\.local$/);
  expect(mail?.Text).toContain('Gridiron Fund V, committee in October');
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
  await send(page);

  await expect(page.locator('#talk')).toHaveClass(/is-done/);
  expect(submissionsFor(email)).toMatchObject([
    {
      variant: 'token-disclosure',
      details: {},
      entry_page: 'digital-assets/',
      entry_placement: 'band',
      entry_audience: null,
    },
  ]);
});

test('a field the server rejects is marked, and nothing is stored', async ({ page }) => {
  await visit(page, '/');
  await page.locator('footer [data-form="general"]').click();

  // The browser sets no length limit on the note; intake stops at 4,000 characters.
  const email = address();
  await form(page).locator('[name="name"]').fill('Alex Doe');
  await form(page).locator('[name="email"]').fill(email);
  await form(page).locator('[name="message"]').fill('x'.repeat(4001));
  await send(page);

  await expect(page.locator('#talk [data-error]')).toBeVisible();
  await expect(form(page).locator('[name="message"]')).toHaveAttribute('aria-invalid', 'true');
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
