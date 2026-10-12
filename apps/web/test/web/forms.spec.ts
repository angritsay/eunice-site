// The dialog opens the right form for each entry point, and the production site
// sends no submission anywhere until a form endpoint is configured: until then the form
// hands off to mail. A production build with analytics on carries the cookie banner.
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { expect, test } from '@playwright/test';
import { BASE, readPage } from './site.ts';

const WEB = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const configOf = (page: string) => {
  const m = readPage(page).match(/<script type="application\/json" id="eunice-config">([^<]*)<\/script>/);
  if (!m?.[1]) throw new Error(`no config block on "${page}"`);
  return JSON.parse(m[1]) as { formEndpoint: string; page: string; audience?: string };
};

test.describe('production guard', () => {
  test('the built site sends no submission anywhere: the endpoint is empty on every page', () => {
    for (const page of ['', 'private-markets/lps/', 'careers/', 'token-disclosure/register/']) {
      expect(configOf(page).formEndpoint).toBe('');
    }
  });

  test('a production build with analytics on builds, and shows the cookie banner linked to the privacy policy', () => {
    // Built into its own folder, so dist/, which the other tests read, is untouched.
    const out = fs.mkdtempSync(path.join(os.tmpdir(), 'eunice-ga-'));
    try {
      execFileSync(process.execPath, ['build.ts'], {
        cwd: WEB,
        env: { ...process.env, SITE_ENV: 'production', PUBLIC_GA_MEASUREMENT_ID: 'G-TEST1234', OUT_DIR: out },
        stdio: 'pipe',
      });
      const home = fs.readFileSync(path.join(out, 'index.html'), 'utf8');
      expect(home).toContain('data-consent hidden');
      expect(home).toMatch(/class="consent"[\s\S]*href="privacy-policy\/"/);
      expect(home).toContain('"analyticsId":"G-TEST1234"');
      expect(fs.existsSync(path.join(out, 'privacy-policy', 'index.html'))).toBe(true);
    } finally {
      fs.rmSync(out, { recursive: true, force: true });
    }
  });

  test('a measurement id that is not a GA4 id refuses to build', () => {
    const build = () =>
      execFileSync(process.execPath, ['build.ts'], {
        cwd: WEB,
        env: { ...process.env, SITE_ENV: 'local', PUBLIC_GA_MEASUREMENT_ID: 'UA-12345-1' },
        stdio: 'pipe',
      });
    expect(build).toThrow(/must look like G-/);
  });

  test('the built site loads no analytics and shows no cookie banner until it is configured', () => {
    for (const page of ['', 'private-markets/lps/', 'careers/']) {
      const html = readPage(page);
      expect(html).not.toContain('googletagmanager');
      expect(html).not.toContain('data-consent');
      expect(configOf(page)).not.toHaveProperty('analyticsId');
    }
  });

  test('each page tells the form where it is, and client-type pages say which client', () => {
    expect(configOf('private-markets/lps/')).toMatchObject({ page: 'private-markets/lps/', audience: 'lps' });
    expect(configOf('token-disclosure/issuers/')).toMatchObject({
      page: 'token-disclosure/issuers/',
      audience: 'issuers',
    });
    expect(configOf('')).toMatchObject({ page: '' });
    expect(configOf('')).not.toHaveProperty('audience');
  });
});

test.describe('entry points open the right form', () => {
  const cases = [
    {
      page: 'private-markets/lps/',
      button: 'main >> [data-placement="hero"]',
      title: 'Talk to the Private Markets desk',
      field: 'What would you like to cover?',
    },
    {
      page: 'digital-assets/',
      button: '[data-form="sample-report"] >> nth=0',
      title: 'See a sample report',
      field: 'Anything to tailor it to?',
    },
    {
      page: 'token-disclosure/',
      button: 'main >> [data-placement="hero"]',
      title: 'Start a white paper',
      field: 'About the token',
    },
    {
      page: 'mica-whitepaper/',
      button: 'main >> [data-placement="band"]',
      title: 'Start a white paper',
      field: 'About the token',
    },
    { page: '', button: 'footer [data-form="general"]', title: 'Talk to us', field: 'What would you like to cover?' },
  ];
  for (const c of cases) {
    test(`${c.page || 'home'} → "${c.title}"`, async ({ page }) => {
      await page.goto(BASE + c.page);
      await page.locator(c.button).click();
      const dialog = page.getByRole('dialog');
      await expect(dialog.getByRole('heading', { level: 2 })).toHaveText(c.title);
      // Scoped to the enabled fieldset: every variant is in the DOM, only one is live.
      await expect(dialog.locator('fieldset:not([disabled])').getByLabel(c.field)).toBeVisible();
      // Only the active variant is enabled; every other field is out of the form.
      const enabled = await dialog.locator('fieldset:not([disabled])').count();
      expect(enabled).toBe(1);
      // Name, work email and a note: nothing else to fill.
      await expect(dialog.locator('fieldset:not([disabled])').locator('input, textarea, select')).toHaveCount(3);
    });
  }

  test('with no endpoint, submitting hands off to the mail app instead of the network', async ({ page }) => {
    // Record the mailto: link instead of following it: headless Chromium has no mail app.
    await page.addInitScript(() => {
      const click = HTMLAnchorElement.prototype.click;
      HTMLAnchorElement.prototype.click = function (this: HTMLAnchorElement) {
        if (this.href.startsWith('mailto:')) (window as unknown as { mailto: string }).mailto = this.href;
        else click.call(this);
      };
    });
    const posts: string[] = [];
    page.on('request', (r) => {
      if (r.method() === 'POST') posts.push(r.url());
    });
    await page.goto(`${BASE}private-markets/`);
    await page.locator('main [data-placement="hero"]').click();
    const dialog = page.getByRole('dialog');
    const active = dialog.locator('fieldset:not([disabled])');
    await active.getByLabel('Name').fill('Jane Doe');
    await active.getByLabel('Work email').fill('jane@acme.example');
    await active.getByLabel('What would you like to cover?').fill('Gridiron Capital Fund V');
    await dialog.getByRole('button', { name: 'Send' }).click();
    await expect(dialog.getByText('your note is on its way')).toBeVisible();
    expect(posts).toEqual([]);
    const mailto = decodeURIComponent(await page.evaluate(() => (window as unknown as { mailto: string }).mailto));
    expect(mailto).toMatch(/^mailto:inquiries@eunice\.ai\?subject=private-markets — Jane Doe&body=/);
    expect(mailto).toContain('message: Gridiron Capital Fund V');
  });

  test('required fields are enforced before anything is sent', async ({ page }) => {
    await page.goto(BASE);
    await page.locator('footer [data-form="general"]').click();
    const dialog = page.getByRole('dialog');
    await dialog.getByRole('button', { name: 'Send' }).click();
    await expect(dialog.getByText('your note is on its way')).toBeHidden();
    const invalid = await dialog.locator('fieldset:not([disabled]) :invalid').count();
    expect(invalid).toBeGreaterThan(0);
  });
});

test.describe('careers', () => {
  test('each open role leads to its page, whose Apply opens that role’s form in a new tab', async ({ page }) => {
    await page.goto(`${BASE}careers/`);
    const roles = page.locator('#roles .jobs__role');
    await expect(roles).toHaveCount(3);
    const pages = await roles.evaluateAll((as) => as.map((a) => (a as HTMLAnchorElement).href));
    const forms = ['https://tally.so/r/VLdQOv', 'https://tally.so/r/1Axdpb', 'https://tally.so/r/PdBqJQ'];
    for (const [i, href] of pages.entries()) {
      await page.goto(href);
      const apply = page.locator('main a', { hasText: 'Apply' }).first();
      await expect(apply).toHaveAttribute('href', forms[i] ?? '');
      await expect(apply).toHaveAttribute('target', '_blank');
    }
  });

  test('a role that is not listed is an email, not a form', async ({ page }) => {
    await page.goto(`${BASE}careers/`);
    await expect(page.locator('main a[href="mailto:career@eunice.ai"]').first()).toBeVisible();
    await expect(page.locator('main [data-form]')).toHaveCount(0);
  });
});
