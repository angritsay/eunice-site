// Build the Eunice site. No dependencies: `node build.mjs`.
//   dist/          static site, one folder per page (deploy this)
//   preview.html   every page in a single file with images inlined (for sharing a link)
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import config from './src/site.config.js';
import { header, footer, esc } from './src/components.js';
import { dialog } from './src/forms.js';

import home from './src/pages/home.js';
import privateMarkets from './src/pages/private-markets.js';
import digitalAssets from './src/pages/digital-assets.js';
import company from './src/pages/company.js';
import careers from './src/pages/careers.js';
import insightsPage from './src/pages/insights.js';
import tokenDisclosure from './src/pages/token-disclosure.js';
import register from './src/pages/register.js';
import audiencePagesBuilt from './src/pages/audience.js';

// The personalised client-type pages are generated from content, so adding one
// is an edit to src/content/index.js and nothing here.
const PAGES = [
  home, privateMarkets, digitalAssets, tokenDisclosure, register,
  company, careers, insightsPage, ...audiencePagesBuilt,
];
const ROOT = path.dirname(fileURLToPath(import.meta.url));
const SRC = path.join(ROOT, 'src');
const DIST = path.join(ROOT, 'dist');
const TODAY = process.env.SITE_DATE || new Date().toISOString().slice(0, 10);

// Fonts are served from the site itself: no request to a third party on every page
// view, no visitor IP sent to Google, and nothing for the CSP to allow off-site.
const fonts = (asset) => ['inter-latin-400-normal', 'manrope-latin-400-normal']
  .map((f) => `<link rel="preload" href="${asset(`fonts/${f}.woff2`)}" as="font" type="font/woff2" crossorigin>`)
  .join('');

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
// Build-time settings. SITE_ENV defaults to production so the guards apply unless a
// build says otherwise; the local compose stack builds with SITE_ENV=local.
const SITE_ENV = process.env.SITE_ENV || 'production';
const FORM_ENDPOINT = process.env.PUBLIC_FORM_ENDPOINT ?? config.formEndpoint;
// Self-hosted Umami (ADR-0010): the tracker's URL, where it sends events, and the site's
// id in Umami. All three, or no analytics at all.
const ANALYTICS = {
  src: process.env.PUBLIC_ANALYTICS_SRC,
  hostUrl: process.env.PUBLIC_ANALYTICS_HOST,
  websiteId: process.env.PUBLIC_ANALYTICS_WEBSITE_ID,
};
const ANALYTICS_ON = Boolean(ANALYTICS.src && ANALYTICS.hostUrl && ANALYTICS.websiteId);

// A live form collects personal data, and GDPR (Art. 13) requires the privacy notice
// to be available at the point of collection. So a production build that points the
// form at a real endpoint fails unless the site has a privacy page. Until then the
// form falls back to the visitor's mail app, which collects nothing on our side.
// Analytics falls under the same rule: cookieless, but the notice must say what is measured.
const HAS_PRIVACY_PAGE = PAGES.some((p) => p.slug === 'privacy');
if (SITE_ENV === 'production' && FORM_ENDPOINT && !HAS_PRIVACY_PAGE) {
  throw new Error('PUBLIC_FORM_ENDPOINT is set for a production build, but there is no privacy page. See the go-live gate in docs.');
}
if (SITE_ENV === 'production' && ANALYTICS_ON && !HAS_PRIVACY_PAGE) {
  throw new Error('Analytics is configured for a production build, but there is no privacy page. See the go-live gate in docs.');
}

// Umami's tracker: no cookies, and it honours Do Not Track. Loaded from our own instance.
const analyticsTag = () =>
  ANALYTICS_ON
    ? `\n<script src="${esc(ANALYTICS.src)}" data-website-id="${esc(ANALYTICS.websiteId)}" data-host-url="${esc(ANALYTICS.hostUrl)}" data-do-not-track="true" defer></script>`
    : '';

const pagePath = (page) => (page.slug ? `${page.slug}/` : '');

// Data, not code: a JSON block is never executed, so the strict Content-Security-Policy
// (script-src 'self') holds. site.js reads it.
const runtimeConfig = (preview, page) => `<script type="application/json" id="eunice-config">${JSON.stringify({
  preview,
  contactEmail: config.contactEmail,
  careersEmail: config.careersEmail,
  formEndpoint: FORM_ENDPOINT,
  page: preview ? '' : pagePath(page),
  ...(page.audience ? { audience: page.audience } : {}),
}).replace(/</g, '\\u003c')}</script>`;

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
${fonts(ctx.asset)}
<link rel="stylesheet" href="${ctx.asset('site.css')}">
</head>
<body>
${pageBody(ctx, page)}
${dialog(config)}
${runtimeConfig(false, page)}
<script src="${ctx.asset('site.js')}" defer></script>${analyticsTag()}
</body>
</html>`;
    const dir = path.join(DIST, page.slug);
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(path.join(dir, 'index.html'), html);
  }

  // 404 uses the home chrome with absolute-safe links back to the root.
  const nf = { slug: '', nav: 'company', title: 'Page not found — Eunice', render: () => '' };
  fs.writeFileSync(path.join(DIST, '404.html'), `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>${nf.title}</title>${fonts((a) => `${config.basePath}assets/${a}`)}<link rel="stylesheet" href="${config.basePath}assets/site.css"></head><body>
<main class="wrap hero hero--short"><div class="hero__text"><h1 class="h1">This page has moved</h1><p class="lead">The address may be from the old site. Start from the home page.</p><div class="buttons"><a class="btn btn--dark" href="${config.basePath}">Go to the home page</a></div></div></main></body></html>`);
  console.log(`dist/: ${PAGES.length} pages + 404`);
}

// ---------- One-file preview ----------
function buildPreview() {
  // One self-contained file: the stylesheet's font files are inlined as data URIs too.
  const css = fs.readFileSync(path.join(SRC, 'assets', 'site.css'), 'utf8')
    .replace(/url\('(fonts\/[^']+)'\)/g, (_, f) => `url('${inlineAsset(f)}')`);
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
<style>${css}</style>
</head>
<body>
${routes}
${dialog(config)}
${runtimeConfig(true, { slug: '' })}
<script>${js}</script>
</body>
</html>`;
  fs.writeFileSync(path.join(ROOT, 'preview.html'), html);
  console.log(`preview.html: ${(html.length / 1024 / 1024).toFixed(1)} MB`);
}

const arg = process.argv[2];
if (arg !== '--preview-only') buildSite();
if (arg === '--preview' || arg === '--preview-only') buildPreview();
