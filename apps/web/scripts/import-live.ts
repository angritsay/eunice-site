// Imports long-form copy from the live eunice.ai (Framer) into src/content/, word for
// word: job descriptions and blog posts. Run by hand when the live copy changes; the
// build never touches the network.
//
//   node scripts/import-live.ts jobs    → src/content/jobs/<slug>.{html,json}
//   node scripts/import-live.ts posts   → src/content/posts/<slug>.{html,json}, images in src/assets/img/blog/
//
// Framer renders its pages server-side, so a headless browser reads the finished DOM.
// Each body is reduced to a small set of tags (src/lib/rich-text.ts checks the same set
// at build time), links to the site become site paths, and images are downloaded so
// the site serves them itself.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { type Browser, chromium, type Page } from '@playwright/test';
import { roles } from '../src/content/index.ts';

const LIVE = 'https://eunice.ai';
const WEB = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const CONTENT = path.join(WEB, 'src', 'content');

/** The live blog, as its sitemap lists it. */
export const POSTS = [
  'preparing-for-the-new-uk-crypto-regime-getting-ahead-on-a-d-and-marc',
  'eunice-and-gunnercooke-partner-to-make-uk-token-classification-clearer',
  'eunice-is-part-of-the-london-fintech-delegation-to-singapore',
  'eunice-makes-the-fintech-50',
  'eunice-raises-8m-to-replace-manual-due-diligence',
  'esma-consolidated-statement-on-mica-technical-standards',
  'eunice-accepted-into-fca-regulatory-sandbox',
  'balancer-v2-failure',
  'unveiling-eunice-bridging-gaps-in-crypto-transparency-ai-powered-risk-monitoring',
  'cryptoasset-classification-under-mica-other-regimes',
  'introducing-the-ai-powered-mica-whitepaper-library',
  'macroeconomic-drivers-of-cryptoassets-ethsofia',
  'what-is-the-role-of-risk-management-in-cryptoassets',
  'derisking-defi-consensus',
  'eunice-moodys-for-tokens',
] as const;

/** Paths on the live site that exist on this one, under the same or a new name. */
const SITE_PATHS: [RegExp, string][] = [
  [/^\/?blog\/([a-z0-9-]+)\/?$/, '/blog/$1/'],
  [/^\/?blog\/?$/, '/insights/'],
  [/^\/?careers\/([a-z0-9-]+)\/?$/, '/careers/$1/'],
  [/^\/?careers\/?$/, '/careers/'],
  [/^\/?(mica-whitepaper|security|private-markets)\/?$/, '/$1/'],
  [/^\/?digital-asset\/?$/, '/digital-assets/'],
  [/^\/?$/, '/'],
];

function siteLink(href: string): string {
  const url = new URL(href, `${LIVE}/`);
  if (url.hostname === 'eunice.ai' || url.hostname === 'www.eunice.ai') {
    const rel = url.pathname.replace(/^\//, '');
    for (const [re, to] of SITE_PATHS) if (re.test(rel)) return rel.replace(re, to) + url.hash;
  }
  if (url.protocol === 'http:') url.protocol = 'https:';
  return url.protocol === 'mailto:' ? href : url.toString();
}

/** A fresh page per URL: Framer's client-side routing can interrupt a reused one. */
async function load(browser: Browser, url: string): Promise<Page> {
  for (let attempt = 1; ; attempt++) {
    const page = await browser.newPage({ ignoreHTTPSErrors: Boolean(process.env['HTTPS_PROXY']) });
    try {
      await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60_000 });
      await page.waitForSelector('h1', { timeout: 20_000 });
      // Scroll through once, so lazy images load and report their size.
      await page.evaluate(async () => {
        for (let y = 0; y < document.body.scrollHeight; y += 600) {
          window.scrollTo(0, y);
          await new Promise((done) => setTimeout(done, 100));
        }
        window.scrollTo(0, 0);
      });
      await page.waitForTimeout(1_500);
      return page;
    } catch (err) {
      await page.close();
      if (attempt === 4) throw err;
    }
  }
}

interface Extracted {
  html: string;
  images: string[];
  title: string;
  label: string;
  date: string;
  standfirst: string;
  hero: string;
  video: string;
}

/** The page's longest rich-text block, reduced to the allowed tags; and what surrounds it. */
const extract = (page: Page) =>
  page.evaluate((): Extracted => {
    const KEEP: Record<string, string> = {
      P: 'p',
      H1: 'h2',
      H2: 'h2',
      H3: 'h3',
      H4: 'h3',
      H5: 'h2',
      H6: 'h3',
      STRONG: 'strong',
      B: 'strong',
      EM: 'em',
      I: 'em',
      A: 'a',
      UL: 'ul',
      OL: 'ol',
      LI: 'li',
      BLOCKQUOTE: 'blockquote',
      CODE: 'code',
      PRE: 'pre',
      BR: 'br',
      IMG: 'img',
      FIGURE: 'figure',
      FIGCAPTION: 'figcaption',
    };
    const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    const attr = (s: string) => esc(s).replace(/"/g, '&quot;');
    const src = (i: HTMLImageElement) => (i.currentSrc || i.getAttribute('src') || '').split('?')[0] ?? '';
    const images: string[] = [];
    const walk = (n: Node): string => {
      if (n.nodeType === Node.TEXT_NODE) return esc(n.textContent ?? '');
      if (!(n instanceof HTMLElement)) return '';
      const inner = [...n.childNodes].map(walk).join('');
      const tag = KEEP[n.tagName];
      if (!tag) return inner;
      // A paragraph that is all of a list item's text: the item is enough.
      if (
        tag === 'p' &&
        n.parentElement?.tagName === 'LI' &&
        n.parentElement.querySelectorAll(':scope > p').length === 1
      )
        return inner;
      if (tag === 'br') return '<br>';
      if (tag === 'img') {
        const i = n as HTMLImageElement;
        images.push(src(i));
        const size = i.naturalWidth ? ` width="${i.naturalWidth}" height="${i.naturalHeight}"` : '';
        const img = `<img src="${attr(src(i))}" alt="${attr(i.alt)}"${size}>`;
        // An image on its own line is a figure; inside a paragraph it stays inline.
        return n.closest('p, li') ? img : `<figure>${img}</figure>`;
      }
      // A link wrapping a paragraph is a button (Framer's "Book a Demo"): the site has
      // its own calls to action, so it is left out.
      if (tag === 'a' && n.querySelector('p')) return '';
      if (tag === 'a') return `<a href="${attr(n.getAttribute('href') ?? '')}">${inner}</a>`;
      return `<${tag}>${inner}</${tag}>`;
    };
    const boxes = [...document.querySelectorAll<HTMLElement>('[data-framer-component-type="RichTextContainer"]')];
    const time = document.querySelector('time');
    const textOf = (el: HTMLElement) =>
      [...el.querySelectorAll<HTMLElement>('*')].find((x) =>
        [...x.childNodes].some((c) => c.nodeType === Node.TEXT_NODE && c.textContent?.trim()),
      ) ?? el;
    // A post: the column of text blocks below its date. A job: its one long block.
    let blocks: HTMLElement[];
    if (time) {
      const below = time.getBoundingClientRect().bottom;
      blocks = boxes.filter((b) => {
        const r = b.getBoundingClientRect();
        return r.width >= 600 && r.top >= below && b.innerText.trim();
      });
    } else {
      const longest = boxes.sort((a, b) => b.innerText.length - a.innerText.length)[0];
      blocks = longest ? [longest] : [];
    }
    if (!blocks.length) throw new Error('no text on the page');
    // A post's standfirst: the first block, when it is set larger than the body.
    let standfirst = '';
    const first = blocks[0];
    if (time && first && blocks.length > 1 && Number.parseFloat(getComputedStyle(textOf(first)).fontSize) > 18) {
      standfirst = first.innerText.trim();
      blocks.shift();
    }
    const inBody = (el: Element) => blocks.some((b) => b.contains(el));
    const h1 = document.querySelector('h1');
    // The label above the title: a job's team, a post's type.
    const before = [...document.querySelectorAll<HTMLElement>('h5, p')].filter(
      (e) => h1 && e.compareDocumentPosition(h1) & Node.DOCUMENT_POSITION_FOLLOWING && e.innerText.trim(),
    );
    // A post's header image: a large picture outside the body, above it.
    const hero =
      [...document.querySelectorAll<HTMLImageElement>('img')]
        .filter((i) => !inBody(i) && i.getBoundingClientRect().width > 400 && src(i))
        .map(src)[0] ?? '';
    const yt = document.documentElement.innerHTML.match(/youtube\.com\/embed\/([A-Za-z0-9_-]{11})/);
    // A block of bare text is one paragraph.
    const html = blocks
      .map((b) => walk(b).trim())
      .map((h) => (/^<(p|h2|h3|ul|ol|blockquote|pre|figure)>/.test(h) ? h : `<p>${h}</p>`))
      .join('');
    return {
      html,
      images,
      title: h1?.innerText.trim() ?? '',
      label: before.at(-1)?.innerText.trim() ?? '',
      date: time?.getAttribute('datetime') ?? time?.innerText.trim() ?? '',
      standfirst,
      hero,
      video: yt?.[1] ?? '',
    };
  });

/** Framer's spacing paragraphs and list-item wrappers, gone; site links made site paths. */
function tidy(html: string): string {
  return html
    .replace(/(<br>)+<\/(p|li|h2|h3)>/g, '</$2>')
    .replace(/<(p|h2|h3)>(\s|<br>)*<\/\1>/g, '')
    .replace(/<(h2|h3)><strong>([\s\S]*?)<\/strong><\/\1>/g, '<$1>$2</$1>')
    .replace(/<a href="([^"]*)">/g, (_, href: string) => `<a href="${siteLink(href.replace(/&amp;/g, '&'))}">`)
    .replace(/(<\/(?:p|h2|h3|ul|ol|li|blockquote|pre|figure)>)/g, '$1\n')
    .trim();
}

/** Framer serves a smaller copy on request; 1024 px is sharp at the width a post shows. */
const sized = (url: string) => (/framerusercontent\.com\/images\//.test(url) ? `${url}?scale-down-to=1024` : url);

async function download(url: string, file: string) {
  const res = await fetch(sized(url));
  if (!res.ok) throw new Error(`${url}: HTTP ${res.status}`);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, Buffer.from(await res.arrayBuffer()));
}

const ext = (url: string) => (url.match(/\.(png|jpe?g|webp|gif|svg)$/i)?.[1] ?? 'png').toLowerCase();

async function importJobs(browser: Browser) {
  for (const role of roles) {
    const page = await load(browser, `${LIVE}/careers/${role.slug}`);
    const x = await extract(page);
    await page.close();
    const dir = path.join(CONTENT, 'jobs');
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(path.join(dir, `${role.slug}.html`), `${tidy(x.html)}\n`);
    fs.writeFileSync(
      path.join(dir, `${role.slug}.json`),
      `${JSON.stringify({ title: x.title, team: x.label }, null, 2)}\n`,
    );
    console.log(`jobs/${role.slug}: ${x.title} (${x.label})`);
  }
}

async function importPosts(browser: Browser) {
  for (const slug of POSTS) {
    const page = await load(browser, `${LIVE}/blog/${slug}`);
    const x = await extract(page);
    await page.close();
    let html = tidy(x.html);
    let n = 0;
    for (const url of x.images) {
      const name = `img/blog/${slug}-${++n}.${ext(url)}`;
      await download(url, path.join(WEB, 'src', 'assets', name));
      html = html.split(`src="${url}"`).join(`src="${name}"`);
    }
    let hero = '';
    if (x.hero) {
      hero = `img/blog/${slug}.${ext(x.hero)}`;
      await download(x.hero, path.join(WEB, 'src', 'assets', hero));
    }
    let video = '';
    if (x.video) {
      // The site's CSP loads no third party, so a video is a link out, shown with its thumbnail.
      video = x.video;
      if (!hero) {
        hero = `img/blog/${slug}.jpg`;
        await download(`https://i.ytimg.com/vi/${x.video}/hqdefault.jpg`, path.join(WEB, 'src', 'assets', hero));
      }
    }
    const dir = path.join(CONTENT, 'posts');
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(path.join(dir, `${slug}.html`), `${html}\n`);
    const meta = { title: x.title, type: x.label, date: x.date, standfirst: x.standfirst, hero, video };
    fs.writeFileSync(path.join(dir, `${slug}.json`), `${JSON.stringify(meta, null, 2)}\n`);
    console.log(
      `posts/${slug}: ${x.title} · ${x.label} · ${x.date}${hero ? ` · ${hero}` : ''}${video ? ' · video' : ''}`,
    );
  }
}

const what = process.argv[2];
if (what !== 'jobs' && what !== 'posts') {
  console.error('usage: node scripts/import-live.ts jobs|posts');
  process.exit(2);
}
const proxy = process.env['HTTPS_PROXY'];
const browser = await chromium.launch({
  ...(process.env['PW_CHROMIUM_EXECUTABLE'] ? { executablePath: process.env['PW_CHROMIUM_EXECUTABLE'] } : {}),
  ...(proxy ? { proxy: { server: proxy } } : {}),
});
try {
  await (what === 'jobs' ? importJobs(browser) : importPosts(browser));
} finally {
  await browser.close();
}
