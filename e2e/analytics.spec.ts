// Analytics, self-hosted (ADR-0010): a visit and each step of the form funnel reach our
// own Umami, tagged with the entry point — and nothing personal, and no cookie, goes with them.
import { expect, test } from '@playwright/test';
import { eventually, sql } from './stack.ts';

interface Recorded {
  name: string | null;
  data: Record<string, string> | null;
}

/** Everything Umami recorded for visits carrying this campaign tag. */
const recorded = (tag: string) =>
  sql<Recorded>(`
    select json_build_object(
      'name', e.event_name,
      'data', (select json_object_agg(d.data_key, coalesce(d.string_value, d.number_value::text))
               from umami.event_data d where d.website_event_id = e.event_id))
    from umami.website_event e
    where e.url_query like '%${tag.replace(/[^a-z0-9-]/g, '')}%'
    order by e.created_at`);

test('a visit and the form funnel are recorded per entry point, without cookies or personal data', async ({
  page,
  context,
}) => {
  const tag = `e2e-${Date.now()}`;
  await page.clock.install();
  await page.goto(`/private-markets/lps/?utm_campaign=${tag}`);
  await page.waitForFunction(() => 'umami' in window);

  await page.locator('main [data-form="private-markets"][data-placement="hero"]').first().click();
  const form = page.locator('#talk fieldset:not([disabled])');
  const email = `${tag}@example.com`;
  await form.locator('[name="name"]').fill('Jane Analytics');
  await form.locator('[name="email"]').fill(email);
  await page.clock.fastForward('00:05');
  await page.locator('#talk [type="submit"]').click();
  await expect(page.locator('#talk')).toHaveClass(/is-done/);

  const events = await eventually(async () => {
    const rows = recorded(tag);
    return rows.some((r) => r.name === 'form_success') ? rows : undefined;
  });

  // A page view, then the funnel in order.
  expect(events.map((e) => e.name)).toEqual([null, 'form_open', 'form_start', 'form_submit', 'form_success']);
  expect(events.find((e) => e.name === 'form_open')?.data).toEqual({
    variant: 'private-markets',
    entry: 'private-markets/lps/ · hero',
    page: '/private-markets/lps/',
    placement: 'hero',
    audience: 'lps',
  });
  expect(events.find((e) => e.name === 'form_success')?.data).toMatchObject({ channel: 'api' });

  // What was typed never leaves the form for analytics.
  expect(JSON.stringify(events)).not.toContain(email);
  expect(JSON.stringify(events)).not.toContain('Jane Analytics');
  // Cookieless: nothing stored in the browser to recognise the visitor.
  expect(await context.cookies()).toEqual([]);
});

test('the edge exposes the tracker, not the analytics dashboard or its API', async ({ request }) => {
  expect((await request.get('/analytics/script.js')).status()).toBe(200);
  expect((await request.get('/analytics/api/websites')).status()).toBe(404);
  expect((await request.get('/analytics/login')).status()).toBe(404);
});
