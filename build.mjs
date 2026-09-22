// Build the Eunice site. No dependencies: `node build.mjs`.
//   dist/          static site, one folder per page (deploy this)
//   preview.html   every page in a single file with images inlined (for sharing a link)
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import config from './src/site.config.js';
import { header, footer, esc } from './src/components.js';

import home from './src/pages/home.js';
import privateMarkets from './src/pages/private-markets.js';
import digitalAssets from './src/pages/digital-assets.js';
import company from './src/pages/company.js';
import careers from './src/pages/careers.js';
import insightsPage from './src/pages/insights.js';
import audiencePagesBuilt from './src/pages/audience.js';

// The personalised client-type pages are generated from content, so adding one
// is an edit to src/content/index.js and nothing here.
const PAGES = [home, privateMarkets, digitalAssets, company, careers, insightsPage, ...audiencePagesBuilt];
const ROOT = path.dirname(fileURLToPath(import.meta.url));
const SRC = path.join(ROOT, 'src');
const DIST = path.join(ROOT, 'dist');
const TODAY = process.env.SITE_DATE || new Date().toISOString().slice(0, 10);

const FONTS = '<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500&family=Manrope:wght@400;500&display=swap">';

// ---------- Link and asset resolution ----------
function siteCtx(page) {
  // Pages nest: 'private-markets' is one level down, 'private-markets/lps' is two.
  const depth = page.slug ? page.slug.split('/').length : 0;
  const up = '../'.repeat(depth);
  return {
    slug: page.slug, today: TODAY, preview: false,
    link(to = '', hash, query) {
      const q = query ? `?desk=${query}` : '';
      const h = hash ? `#${hash}` : '';
      if (to === page.slug && !q) return h || './';
      return `${up}${to ? to + '/' : ''}${q}${h}` || './';
    },
    asset: (p) => `${up}assets/${p}`,
  };
}

const MIME = { '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp', '.svg': 'image/svg+xml' };
const dataUris = new Map();
function inlineAsset(p) {
  if (!dataUris.has(p)) {
    const file = path.join(SRC, 'assets', p);
    dataUris.set(p, `data:${MIME[path.extname(p)]};base64,${fs.readFileSync(file).toString('base64')}`);
  }
  return dataUris.get(p);
}
function previewCtx(page) {
  return {
    slug: page.slug, today: TODAY, preview: true,
    link(to = '', hash, query) {
      return `#/${to || 'home'}${hash ? '/' + hash : ''}${query ? `?desk=${query}` : ''}`;
    },
    asset: inlineAsset,
  };
}

// ---------- Shared chrome ----------
const dialog = () => `
<dialog class="dialog" id="talk" aria-labelledby="talk-title">
  <div class="dialog__in">
    <div class="dialog__head">
      <h2 class="h3" id="talk-title" data-title>Talk to us</h2>
      <button type="button" class="dialog__close" data-close aria-label="Close"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18"/></svg></button>
    </div>
    <p class="small muted dialog__lead" data-lead></p>
    <form class="form" novalidate>
      <input type="hidden" name="topic"><input type="hidden" name="role">
      <label class="field"><span>Name</span><input name="name" autocomplete="name" required></label>
      <label class="field"><span>Work email</span><input name="email" type="email" autocomplete="email" required></label>
      <label class="field full"><span>Firm</span><input name="company" autocomplete="organization"></label>
      <label class="field full"><span>What would you like to cover?</span><textarea name="message"></textarea></label>
      <div class="form__foot full">
        <p class="form__note">We use your details only to reply.</p>
        <button type="submit" class="btn btn--dark">Send</button>
      </div>
      <p class="form__note full" data-error hidden>That did not go through. Email us instead at ${esc(config.contactEmail)}.</p>
    </form>
    <div class="dialog__done">
      <p class="body">Thank you — your note is on its way to <span data-done-to>the desk</span>. We reply within one working day.</p>
      <div class="buttons"><button type="button" class="btn btn--outline" data-close>Close</button></div>
    </div>
  </div>
</dialog>`;

const runtimeConfig = (preview) => `<script>window.EUNICE=${JSON.stringify({
  preview, contactEmail: config.contactEmail, careersEmail: config.careersEmail, formEndpoint: config.formEndpoint,
})}</script>`;

const pageBody = (ctx, page) => `${header(ctx, page.nav)}\n<main>${page.render(ctx)}</main>\n${footer(ctx)}`;

// ---------- Site build ----------
function buildSite() {
  fs.rmSync(DIST, { recursive: true, force: true });
  fs.mkdirSync(DIST, { recursive: true });
  fs.cpSync(path.join(SRC, 'assets'), path.join(DIST, 'assets'), { recursive: true });
  fs.writeFileSync(path.join(DIST, '.nojekyll'), '');

  for (const page of PAGES) {
    const ctx = siteCtx(page);
    const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>${esc(page.title)}</title>
<meta name="description" content="${esc(page.description)}">
<meta property="og:title" content="${esc(page.title)}">
<meta property="og:description" content="${esc(page.description)}">
<link rel="icon" href="${ctx.asset('favicon.svg')}" type="image/svg+xml">
${FONTS}
<link rel="stylesheet" href="${ctx.asset('site.css')}">
</head>
<body>
${pageBody(ctx, page)}
${dialog()}
${runtimeConfig(false)}
<script src="${ctx.asset('site.js')}" defer></script>
</body>
</html>`;
    const dir = path.join(DIST, page.slug);
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(path.join(dir, 'index.html'), html);
  }

  // 404 uses the home chrome with absolute-safe links back to the root.
  const nf = { slug: '', nav: 'company', title: 'Page not found — Eunice', render: () => '' };
  fs.writeFileSync(path.join(DIST, '404.html'), `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>${nf.title}</title>${FONTS}<link rel="stylesheet" href="${config.basePath}assets/site.css"></head><body>
<main class="wrap hero hero--short"><div class="hero__text"><h1 class="h1">This page has moved</h1><p class="lead">The address may be from the old site. Start from the home page.</p><div class="buttons"><a class="btn btn--dark" href="${config.basePath}">Go to the home page</a></div></div></main></body></html>`);
  console.log(`dist/: ${PAGES.length} pages + 404`);
}

// ---------- One-file preview ----------
function buildPreview() {
  const css = fs.readFileSync(path.join(SRC, 'assets', 'site.css'), 'utf8');
  const js = fs.readFileSync(path.join(SRC, 'assets', 'site.js'), 'utf8');
  const routes = PAGES.map((page) => {
    const ctx = previewCtx(page);
    return `<div data-route="${page.slug || 'home'}" data-title="${esc(page.title)}" hidden>\n${pageBody(ctx, page)}\n</div>`;
  }).join('\n');
  const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>${esc(home.title)}</title>
${FONTS}
<style>${css}</style>
</head>
<body>
${routes}
${dialog()}
${runtimeConfig(true)}
<script>${js}</script>
</body>
</html>`;
  fs.writeFileSync(path.join(ROOT, 'preview.html'), html);
  console.log(`preview.html: ${(html.length / 1024 / 1024).toFixed(1)} MB`);
}

const arg = process.argv[2];
if (arg !== '--preview-only') buildSite();
if (arg === '--preview' || arg === '--preview-only') buildPreview();
