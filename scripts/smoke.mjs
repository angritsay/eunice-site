// After a deploy: every public page answers 200 and an unknown path answers 404.
// Usage: node scripts/smoke.mjs https://angritsay.github.io/eunice-site/
import urls from '../test/web/urls.json' with { type: 'json' };

const base = (process.argv[2] || 'https://angritsay.github.io/eunice-site/').replace(/\/?$/, '/');
const ATTEMPTS = 6; // Pages can take a minute to serve a new deployment everywhere.

async function status(url) {
  const res = await fetch(url, { redirect: 'follow', headers: { 'cache-control': 'no-cache' } });
  return res.status;
}

async function check(url, want) {
  for (let i = 1; i <= ATTEMPTS; i++) {
    const got = await status(url).catch(() => 0);
    if (got === want) return null;
    if (i < ATTEMPTS) await new Promise((r) => setTimeout(r, 10_000));
    else return `${url}: expected ${want}, got ${got}`;
  }
}

const results = await Promise.all([
  ...urls.pages.map((p) => check(base + p, 200)),
  check(base + 'this-page-does-not-exist/', 404),
]);
const failures = results.filter(Boolean);
if (failures.length) { console.error(failures.join('\n')); process.exit(1); }
console.log(`Smoke: ${urls.pages.length} pages answer 200 and unknown paths 404, at ${base}`);
