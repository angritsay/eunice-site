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
  const cases = [
    {
      page: 'private-markets/lps/',
      button: 'main >> [data-placement="hero"]',
      title: 'Talk to the Private Markets desk',
      field: 'The fund you are reviewing',
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
      field: 'Where it will be offered',
    },
    {
      page: 'careers/',
      button: '[data-placement="roles"] >> nth=0',
      title: 'Apply: GTM Lead, Digital Assets',
      field: 'Link to your CV or work',
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
    await active.getByLabel('The fund you are reviewing').fill('Gridiron Capital Fund V');
    await dialog.getByRole('button', { name: 'Send' }).click();
    await expect(dialog.getByText('your note is on its way')).toBeVisible();
    expect(posts).toEqual([]);
    const mailto = decodeURIComponent(await page.evaluate(() => (window as unknown as { mailto: string }).mailto));
    expect(mailto).toMatch(/^mailto:hello@eunice\.ai\?subject=private-markets — Jane Doe&body=/);
    expect(mailto).toContain('fund: Gridiron Capital Fund V');
  });

  test('required fields are enforced before anything is sent', async ({ page }) => {
    await page.goto(`${BASE}careers/`);
    await page.locator('[data-placement="roles"] >> nth=0').click();
    const dialog = page.getByRole('dialog');
    await dialog.getByRole('button', { name: 'Send' }).click();
    await expect(dialog.getByText('your note is on its way')).toBeHidden();
    const invalid = await dialog.locator('fieldset:not([disabled]) :invalid').count();
    expect(invalid).toBeGreaterThan(0);
  });
});
