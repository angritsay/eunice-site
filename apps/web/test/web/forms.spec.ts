// The dialog opens the right form for each entry point, and the production site
// still never sends a submission anywhere: until a privacy notice is published, the
// build refuses to point the form at a server, and the form hands off to mail.
import { execFileSync } from 'node:child_process';
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

  test('a production build with a form endpoint but no privacy page refuses to build', () => {
    const build = () =>
      execFileSync(process.execPath, ['build.ts'], {
        cwd: WEB,
        env: { ...process.env, SITE_ENV: 'production', PUBLIC_FORM_ENDPOINT: 'https://intake.example/v1/submissions' },
        stdio: 'pipe',
      });
    // The guard runs before the build writes anything, so dist/ — which the other,
    // parallel tests are reading — is left exactly as it was.
    expect(build).toThrow(/no privacy page/);
  });

  test('a production build with analytics but no privacy page refuses to build', () => {
    const build = () =>
      execFileSync(process.execPath, ['build.ts'], {
        cwd: WEB,
        env: {
          ...process.env,
          SITE_ENV: 'production',
          PUBLIC_ANALYTICS_SRC: 'https://analytics.example/script.js',
          PUBLIC_ANALYTICS_HOST: 'https://analytics.example',
          PUBLIC_ANALYTICS_WEBSITE_ID: '6b0e6c1d-6c3a-4a3e-9d7b-0e1c2f3a4b5c',
        },
        stdio: 'pipe',
      });
    expect(build).toThrow(/Analytics is configured .* no privacy page/);
  });

  test('the built site loads no analytics until it is configured', () => {
    for (const page of ['', 'private-markets/lps/', 'careers/']) {
      expect(readPage(page)).not.toContain('data-website-id');
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
  // A demo form needs only the work email (ADR-0013); the white paper and sample report
  // forms ask a name, an email and a note. Optional fields say so in their label.
  const cases = [
    {
      page: 'private-markets/lps/',
      button: 'main >> [data-placement="hero"]',
      title: 'Talk to the Private Markets Desk',
      field: 'Name (optional)',
      inputs: 2,
    },
    {
      page: 'digital-assets/',
      button: 'main >> [data-placement="hero"]',
      title: 'Talk to the Digital Assets Desk',
      field: 'What would you like to cover? (optional)',
      inputs: 3,
    },
    {
      page: 'digital-assets/',
      button: '[data-form="sample-report"] >> nth=0',
      title: 'See a Sample Report',
      field: 'Anything to tailor it to? (optional)',
      inputs: 3,
    },
    {
      page: 'token-disclosure/',
      button: 'main >> [data-placement="hero"]',
      title: 'Start a White Paper',
      field: 'About the token (optional)',
      inputs: 3,
    },
    {
      page: 'mica-whitepaper/',
      button: 'main >> [data-placement="band"]',
      title: 'Start a White Paper',
      field: 'About the token (optional)',
      inputs: 3,
    },
    { page: '', button: 'footer [data-form="general"]', title: 'Talk to Us', field: 'Work email', inputs: 2 },
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
      // Nothing more to fill than the variant asks.
      await expect(dialog.locator('fieldset:not([disabled])').locator('input, textarea, select')).toHaveCount(c.inputs);
    });
  }

  test('the closing line sends the work email on its own, without opening a form', async ({ page }) => {
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
    const ask = page.locator('form.ask');
    await ask.getByLabel('Work email').fill('jane@acme.example');
    await ask.getByRole('button', { name: 'Book demo' }).click();
    await expect(ask.getByRole('status')).toHaveText('Your mail app has the request ready: press send.');
    await expect(page.getByRole('dialog')).toBeHidden();
    expect(posts).toEqual([]);
    expect(page.url()).not.toContain('acme');
    const mailto = decodeURIComponent(await page.evaluate(() => (window as unknown as { mailto: string }).mailto));
    expect(mailto).toBe(
      'mailto:inquiries@eunice.ai?subject=private-markets — jane@acme.example&body=email: jane@acme.example',
    );
  });

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
    await active.getByLabel('Name (optional)').fill('Jane Doe');
    await active.getByLabel('Work email').fill('jane@acme.example');
    await dialog.getByRole('button', { name: 'Send' }).click();
    await expect(dialog.getByText('your note is on its way')).toBeVisible();
    expect(posts).toEqual([]);
    const mailto = decodeURIComponent(await page.evaluate(() => (window as unknown as { mailto: string }).mailto));
    expect(mailto).toMatch(/^mailto:inquiries@eunice\.ai\?subject=private-markets — Jane Doe&body=/);
    expect(mailto).toContain('email: jane@acme.example');
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
