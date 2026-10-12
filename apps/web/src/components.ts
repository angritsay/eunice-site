// Shared building blocks. Pages compose these; nothing here holds page copy.
import type { Placement } from '@eunice/contracts/forms';
import { audiencePages, clients, desks, events, insights, integrations, partners, people } from './content/index.ts';
import type { Firm, Insight, Person, Quote } from './content/schema.ts';
import type { Ctx, Desk, NavItem, NavKey, ProductDesk } from './lib/types.ts';
import config from './site.config.ts';

// Re-exported: pages import their building blocks from one place.
export { esc, html, join, raw } from './lib/html.ts';

import { type Art, art } from './art.ts';
import { GLYPH } from './lib/glyph.ts';
import { esc, type Html, html } from './lib/html.ts';
import { imageSize } from './lib/image-size.ts';
import { postHero } from './lib/post-hero.ts';
import { uiAsk } from './ui.ts';

type MaybeHtml = Html | '';
export type PersonId = keyof typeof people;

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const MONTHS_LONG = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];
export const fmtDay = (iso: string) => {
  const [y, m = 1, d] = iso.split('-').map(Number);
  return `${d} ${MONTHS[m - 1]} ${y}`;
};
export const fmtDayLong = (iso: string) => {
  const [y, m = 1, d] = iso.split('-').map(Number);
  return `${d} ${MONTHS_LONG[m - 1]} ${y}`;
};
export const fmtMonth = (ym: string) => {
  const [y, m = 1] = ym.split('-').map(Number);
  return `${MONTHS_LONG[m - 1]} ${y}`;
};

// Resolve a nav/link item to an href.
export function href(ctx: Ctx, item: Omit<NavItem, 'label'>): string {
  if (item.href === 'login') return config.loginUrl;
  if (item.href) return item.href;
  return ctx.link(item.to, item.hash, item.query);
}

// The master brand file, split so the glyph (lib/glyph.ts) can be used without the wordmark.
// Both are filled, not stroked, so `color` recolours them at the call site.
// Coordinates are the master's own, on its 68 x 21 canvas.
const WORDMARK = [
  'M23.9966 15.3572H30.8252V13.8549H25.5479V10.4612H29.9342V8.95888H25.5479V5.8779H30.8252V4.37555H23.9966V15.3572Z',
  'M35.1825 15.5784C36.3474 15.5784 37.2454 15.1284 37.8319 14.3735V15.3572H39.2123V7.12097H37.6464V11.4069C37.6464 13.3592 36.7262 14.0684 35.6127 14.0684C33.9057 14.0684 33.5867 12.4517 33.5867 11.1705V7.12097H32.0132V11.6967C32.0132 12.9702 32.4212 15.5784 35.1825 15.5784Z',
  'M46.4745 11.3077V15.3572H48.048V10.7815C48.048 9.50796 47.64 6.89981 44.8787 6.89981C43.7138 6.89981 42.8158 7.34975 42.2293 8.10475V7.12097H40.8413V15.3572H42.4148V11.0713C42.4148 9.11903 43.3351 8.40979 44.4485 8.40979C46.1555 8.40979 46.4745 10.0265 46.4745 11.3077Z',
  'M49.6846 5.77114H51.2359V4.22303H49.6846V5.77114ZM49.6846 15.3572H51.2359V7.12097H49.6846V15.3572Z',
  'M56.4478 15.586C58.1701 15.586 59.4169 14.709 59.9438 13.0923L58.3703 12.711C58.0436 13.5956 57.4424 14.0837 56.4478 14.0837C54.9785 14.0837 54.2286 12.9397 54.2216 11.2391C54.2286 9.59185 54.9264 8.39454 56.4478 8.39454C57.3458 8.39454 58.0957 8.936 58.4001 9.85877L59.9438 9.4012C59.5428 7.85309 58.2222 6.89219 56.4701 6.89219C54.043 6.89219 52.5883 8.69196 52.5737 11.2391C52.5883 13.7481 53.9916 15.586 56.4478 15.586Z',
  'M64.3476 15.586C65.8989 15.586 67.257 14.7395 67.8804 13.2677L66.359 12.772C65.9656 13.6185 65.2386 14.0837 64.2732 14.0837C62.9228 14.0837 62.136 13.2143 62.0102 11.689H67.9846C68.148 8.73772 66.7225 6.89219 64.2732 6.89219C61.9282 6.89219 60.3477 8.60808 60.3477 11.3077C60.3477 13.8549 61.9504 15.586 64.3476 15.586ZM62.047 10.446C62.2472 9.0504 63.0041 8.30303 64.333 8.30303C65.5652 8.30303 66.2332 8.99701 66.3965 10.446H62.047Z',
].map((d) => html`<path d="${d}"/>`);

// The glyph on its own, for use beside a heading. Decorative: the words next to
// it carry the meaning. `size` is its height; the width follows the artwork.
export const mark = (size = 22, color = 'currentColor') =>
  html`<svg class="mark" width="${((size * 18.3) / 20.55).toFixed(2)}" height="${size}" viewBox="0 0 18.3 20.55" fill="${color}" aria-hidden="true"><path d="${GLYPH}"/></svg>`;

// The full lockup, glyph and wordmark, exactly as the master file draws it.
// It carries the name, so nothing should print "Eunice" beside it. `size` is its height.
export const logo = (size = 21, color = 'currentColor') =>
  html`<svg class="logo" width="${((size * 68) / 21).toFixed(2)}" height="${size}" viewBox="0 0 68 21" fill="${color}" role="img"><title>Eunice</title><path class="logo__glyph" d="${GLYPH}"/>${WORDMARK}</svg>`;

export const deskLabel = (desk: Desk, extra = '') =>
  html`<span class="desk desk--${desk}"><span class="dot"></span>${desks[desk].label}${extra ? html` <span class="desk__meta">· ${extra}</span>` : ''}</span>`;

// ---------- Buttons ----------
// kind: 'dark' | 'light' | 'outline' | 'outline-light'
// A button that opens the contact dialog names its form variant (see
// @eunice/contracts/forms) and where on the page it sits. With the page path, that is
// the entry point the submission records: which page, which button, which form.
export interface ButtonOptions {
  label: string;
  /** 'desk' fills the button with the colour of the desk its form belongs to. */
  kind?: 'dark' | 'light' | 'outline' | 'outline-light' | 'desk';
  small?: boolean;
  to?: string;
  hash?: string;
  query?: string;
  href?: string;
  /** A form variant from @eunice/contracts/forms: the button opens the dialog instead of linking. */
  form?: string;
  placement?: Placement;
  /** An external page (an application form): opens in a new tab. */
  newTab?: boolean;
}

export function button(
  ctx: Ctx,
  {
    label,
    kind = 'dark',
    small = false,
    to,
    hash,
    query,
    href: h,
    form,
    placement = 'body',
    newTab = false,
  }: ButtonOptions,
): Html {
  const fill = kind === 'desk' ? `desk-${form ?? 'general'}` : kind;
  const cls = `btn btn--${fill}${small ? ' btn--sm' : ''}`;
  if (form !== undefined) {
    return html`<button type="button" class="${cls}" data-form="${form}" data-placement="${placement}">${label}</button>`;
  }
  const tab = newTab ? html` target="_blank" rel="noopener noreferrer"` : '';
  return html`<a class="${cls}" href="${href(ctx, { to, hash, query, href: h })}"${tab}>${label}</a>`;
}

// ---------- Header ----------
const CHEVRON = html`<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m6 9 6 6 6-6"/></svg>`;

export function header(ctx: Ctx, navKey: NavKey = 'company'): Html {
  const deskForm = navKey === 'company' ? 'general' : navKey;
  const lockup = config.lockups[navKey];
  const login = config.loginOn.includes(navKey);
  // Keyed by page: preview.html holds every page in one document.
  const idFor = (menu: string) => `menu-${(ctx.slug || 'home').replaceAll('/', '-')}-${menu}`;
  return html`
<header class="wrap nav">
  <a class="lockup lockup--${navKey}" href="${ctx.link(lockup ? navKey : '')}">
    ${logo(17)}${lockup ? html`<span class="lockup__rule"></span><span class="lockup__desk">${lockup}</span>` : ''}
  </a>
  <nav class="nav__links" id="nav-links" aria-label="Main">
    <ul class="menus">${config.menus.map(
      (m) => html`
      <li class="menu${m.keys.includes(navKey) ? ' is-current' : ''}">
        <a class="menu__top" href="${ctx.link(m.to)}"${m.to === ctx.slug ? html` aria-current="page"` : ''}>${m.label}</a>
        <button type="button" class="menu__toggle" aria-expanded="false" aria-controls="${idFor(m.id)}" aria-label="${m.label}: sections">${CHEVRON}</button>
        <ul class="menu__panel" id="${idFor(m.id)}">${m.items.map((i) => html`<li><a href="${href(ctx, i)}">${i.label}</a></li>`)}</ul>
      </li>`,
    )}
    </ul>
    <span class="nav__mobile-extra">
      ${login ? html`<a href="${config.loginUrl}">User login</a>` : ''}
      <button type="button" class="btn btn--dark" data-form="${deskForm}" data-placement="nav">Book demo</button>
    </span>
  </nav>
  <div class="nav__actions">
    ${login ? html`<a class="btn btn--outline nav__login" href="${config.loginUrl}">User login</a>` : ''}
    <button type="button" class="btn btn--dark" data-form="${deskForm}" data-placement="nav">Book demo</button>
    <button type="button" class="nav__menu" aria-controls="nav-links" aria-expanded="false" aria-label="Open menu">
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><path d="M4 8h16M4 16h16"/></svg>
    </button>
  </div>
</header>`;
}

// ---------- Footer ----------
export function footer(ctx: Ctx): Html {
  return html`
<footer class="wrap footer">
  <div class="footer__grid">
    <div class="footer__brand">
      <a class="lockup" href="${ctx.link('')}">${logo(15)}</a>
      <p>${config.tagline}</p>
    </div>
    ${config.footer.map(
      (col) => html`
    <div class="footer__col">
      <p class="label">${col.title}</p>
      ${col.links.map((l) =>
        l.form
          ? html`<button type="button" class="linklike" data-form="${l.form}" data-placement="footer">${l.label}</button>`
          : l.href?.startsWith('https://')
            ? html`<a href="${l.href}" target="_blank" rel="noopener noreferrer">${l.label}</a>`
            : html`<a href="${href(ctx, l)}">${l.label}</a>`,
      )}
    </div>`,
    )}
  </div>
  <div class="footer__legal">
    <span>${config.legalLine}</span>
    <span class="footer__legal-links"><a href="${ctx.link('privacy-policy')}">Privacy</a><a href="${ctx.link('terms-and-conditions')}">Terms</a><a href="${ctx.link('security')}">Security</a></span>
  </div>
</footer>`;
}

// ---------- Section scaffolding ----------
// A section's label: the heading alone, no aside under or beside it (owner's call, Oct 2026).
export const sectionHead = (label: string) => html`<div class="shead"><h2 class="shead__title">${label}</h2></div>`;

// Every fact carries its picture (art.ts), so the row reads before its words do.
export const facts = (
  items: readonly { art: Art; title: string; text: string }[],
  cols = items.length,
) => html`<div class="grid grid--${cols} facts">
  ${items.map((f) => html`<div class="fact">${art(f.art)}<p class="h4">${f.title}</p><p class="small muted">${f.text}</p></div>`)}
</div>`;

// Proof as numbers: a lead on the left, a recognition shown by its publisher's logo
// with the line it gave us, then figures on the right, one per hairline row, each with
// a short note.
export const numbers = (
  ctx: Ctx,
  {
    lead,
    rows,
  }: {
    lead: { logo: string; name: string; text: string; note?: string };
    rows: readonly { n: string; label: string }[];
  },
) => {
  const s = imageSize(`img/logos/${lead.logo}`);
  const h = 44;
  const w = s ? Math.round((s.width / s.height) * h) : h * 4;
  return html`<div class="numbers">
  <div class="numbers__lead">
    <img src="${ctx.asset(`img/logos/${lead.logo}`)}" alt="${lead.name}" width="${w}" height="${h}">
    <p class="h2">${lead.text}</p>
    ${lead.note ? html`<p class="small muted">${lead.note}</p>` : ''}
  </div>
  <ul class="numbers__rows">
    ${rows.map((r) => html`<li><span class="h3">${r.n}</span><span class="small muted">${r.label}</span></li>`)}
  </ul>
</div>`;
};

// A journey read left to right: stops on one line, each a short title and a
// line of text. With `onward`, the line runs on past the last stop, which is drawn as
// the stop still in progress. On a phone the path turns and runs down the left.
export const path = (
  stops: readonly { title: string; text: string }[],
  { onward = false, label = '' }: { onward?: boolean; label?: string } = {},
) => html`<ol class="path${onward ? ' path--onward' : ''}"${label ? html` aria-label="${label}"` : ''}>
  ${stops.map(
    (s) =>
      html`<li class="path__stop"><span class="path__title">${s.title}</span><p class="path__text">${s.text}</p></li>`,
  )}
</ol>`;

// Credentials as small outlined badges: named, not explained.
export const badges = (items: readonly string[]) =>
  html`<ul class="badges">${items.map((b) => html`<li>${b}</li>`)}</ul>`;

// One card for every quote: the same ground, the words in mono, and the product it
// is about named by the Eunice mark in that product's colour.
// One quote given the stage: large, on ink, the quotation mark in the desk's colour.
export const pullQuote = (q: Quote) => html`<figure class="pullquote pullquote--${q.desk}">
  <span class="pullquote__mark" aria-hidden="true">“</span>
  <blockquote class="pullquote__text">${q.text}</blockquote>
  <figcaption class="pullquote__who">${q.who}</figcaption>
</figure>`;

export const quoteBlock = (q: Quote, { withDesk = true } = {}) => html`
<figure class="quote">
  ${withDesk ? html`<span class="desk desk--${q.desk} quote__desk">${mark(12)}${desks[q.desk].label}</span>` : ''}
  <blockquote class="quote__text">“${q.text}”</blockquote>
  <figcaption class="caption muted">${q.who}</figcaption>
</figure>`;

// A labelled row of logos that drifts slowly to the left, in a loop. The firms are
// written once for readers; the copies that make the loop seamless are hidden from
// them. Each half of the track holds at least ten logos, so a short row still fills
// the width. Under reduced motion the copies go and the row stands still.
const FIRMS = {
  clients: { label: 'Trusted by leading firms', firms: clients },
  partners: { label: 'Partners', firms: partners },
};

export function logoMarquee(ctx: Ctx, row: keyof typeof FIRMS): Html {
  const { label, firms } = FIRMS[row];
  const list = (hidden: boolean) =>
    html`<ul class="logos__list"${hidden ? html` aria-hidden="true"` : ''}>${firms.map((f: Firm) => {
      const s = imageSize(`img/logos/${f.logo}`);
      const width = s ? Math.round((s.width / s.height) * f.height) : f.height * 4;
      return html`<li><img src="${ctx.asset(`img/logos/${f.logo}`)}" alt="${hidden ? '' : f.name}" width="${width}" height="${f.height}" loading="lazy"></li>`;
    })}</ul>`;
  const perHalf = Math.max(1, Math.ceil(10 / firms.length));
  const copies = Array.from({ length: perHalf * 2 }, (_, i) => list(i > 0));
  return html`
<div class="logos logos--${row}">
  <p class="caption muted logos__label">${label}</p>
  <div class="logos__view"><div class="logos__track">${copies}</div></div>
</div>`;
}

// Both rows together, for pages that show them as one block.
export const partnersRow = (ctx: Ctx) => html`
<div class="partners">
  ${logoMarquee(ctx, 'clients')}
  ${logoMarquee(ctx, 'partners')}
</div>`;

// A product image on a tinted field. `img` is a file under /assets/img; `html` is inline markup.
export interface PlateOptions {
  img?: string;
  /** Inline markup, for a visual drawn in HTML rather than a screenshot (see ui.ts). */
  html?: Html;
  alt?: string;
  tint?: string;
}

/** width and height attributes for an image under assets/, when its size can be read. */
const sizedAsset = (file: string) => {
  const s = imageSize(file);
  return s ? html` width="${s.width}" height="${s.height}"` : '';
};
/** The same, for an image under assets/img/. */
export const sized = (img: string) => sizedAsset(`img/${img}`);

// The product hero: the drawn question and cited answer (uiAsk). The drawing carries its
// own frame of the desk's background art, a thin border round the product (ui.ts).
export const heroField = ({ desk }: { desk: ProductDesk }): Html =>
  html`<div class="hero__visual hero__visual--field">${uiAsk(desk)}</div>`;

export function plate(ctx: Ctx, { img, html: markup, alt = '', tint = 'none' }: PlateOptions): Html {
  const inner = img ? html`<img src="${ctx.asset(`img/${img}`)}" alt="${alt}"${sized(img)} loading="lazy">` : markup;
  return html`<figure class="plate plate--${tint}">${inner}</figure>`;
}

// The product film (uiFilm), full width under a feature.
export const stage = ({ film }: { film: Html }): Html => html`<figure class="stage">${film}</figure>`;

// Product row: text on one side, visual on the other.
export interface FeatureOptions {
  id?: string;
  title: string;
  body: Html;
  visual: Html;
  flip?: boolean;
  desk?: ProductDesk;
  /** Full width under the text and visual, e.g. a film on a photo stage. */
  stage?: Html;
}

export function feature({
  id,
  title,
  body,
  visual,
  flip = false,
  desk = 'private-markets',
  stage: below,
}: FeatureOptions): Html {
  return html`
<section class="wrap feature feature--${desk}${flip ? ' feature--flip' : ''}" ${id ? html`id="${id}"` : ''}>
  <div class="feature__text">
    <h2 class="h2">${title}</h2>
    ${body}
  </div>
  <div class="feature__visual">${visual}</div>
  ${below ? html`<div class="feature__stage">${below}</div>` : ''}
</section>`;
}

export const bullets = (items: readonly string[], desk: Desk = 'private-markets') =>
  html`<ul class="bullets bullets--${desk}">${items.map((i) => html`<li>${i}</li>`)}</ul>`;

// ---------- Insights ----------
const byDateDesc = (a: Insight, b: Insight) => (a.date < b.date ? 1 : -1);

/** Where an insight is read: its post on this site, or wherever else it lives. */
const insightHref = (ctx: Ctx, it: Insight) => (it.post ? ctx.link(`blog/${it.post}`) : it.url);

export function insightRow(ctx: Ctx, it: Insight, { showDesk = true } = {}): Html {
  const href = insightHref(ctx, it);
  const title = href ? html`<a href="${href}">${it.title}</a>` : esc(it.title);
  return html`<li class="irow" data-desk="${it.desk}">
    <span class="irow__date">${fmtDay(it.date)}</span>
    <span class="irow__title">${title}</span>
    ${showDesk ? html`<span class="irow__tag tag--${it.desk}">${desks[it.desk].label} · ${it.type}</span>` : html`<span class="irow__tag tag--${it.desk}">${it.type}</span>`}
  </li>`;
}

// A featured insight: the post's cover image, and over it the desk, type, date and title.
// Without a cover (a piece that lives elsewhere), the card is the desk's own colour.
export function insightCard(ctx: Ctx, it: Insight, override: Partial<Insight> | null = null): Html {
  const o = { ...it, ...(override || {}) };
  const href = insightHref(ctx, o);
  const hero = o.post ? postHero(o.post) : undefined;
  const inner = html`${hero ? html`<img class="icard__img" src="${ctx.asset(hero)}" alt=""${sizedAsset(hero)} loading="lazy">` : ''}
    <span class="icard__body">
      <span class="icard__meta"><span class="icard__desk">${o.desk === 'company' ? '' : mark(10)}${desks[o.desk].label}</span> · ${o.type} · ${fmtDay(o.date)}</span>
      <span class="icard__title${o.placeholder ? ' placeholder' : ''}">${o.title}</span>
    </span>`;
  const cls = `icard icard--${o.desk}${hero ? '' : ' icard--plain'}`;
  return href ? html`<a class="${cls}" href="${href}">${inner}</a>` : html`<article class="${cls}">${inner}</article>`;
}

// desks: which desks to include. featured: how many cards on top. override: replace the first card's copy.
export interface InsightsBlockOptions {
  id?: string;
  label: string;
  /** Which desks to include; all when absent. */
  deskFilter?: readonly Desk[];
  /** How many cards on top. */
  featured?: number;
  rows?: number;
  /** Replaces the first card's copy. */
  override?: Partial<Insight> | null;
  band?: boolean;
}

export function insightsBlock(
  ctx: Ctx,
  { id = 'insights', label, deskFilter, featured = 3, rows = 5, override = null, band = false }: InsightsBlockOptions,
): Html {
  const list = insights.filter((i) => !deskFilter || deskFilter.includes(i.desk)).sort(byDateDesc);
  const cards = list.filter((i) => i.featured).slice(0, featured);
  const rest = list.filter((i) => !cards.includes(i)).slice(0, rows);
  if (!list.length) return html``;
  const [only] = cards;
  const rowList = html`<ul class="irows">${rest.map((r) => insightRow(ctx, r))}</ul>`;
  const all = html`<p class="all"><a class="more" href="${ctx.link('insights', null, deskFilter && deskFilter.length === 1 ? deskFilter[0] : null)}">All insights</a></p>`;
  return html`
<section class="${band ? 'band ' : ''}section" id="${id}"><div class="wrap">
  ${sectionHead(label)}
  ${
    only && cards.length === 1
      ? html`<div class="ifeature">${insightCard(ctx, only, override)}<div class="ifeature__list">${rowList}${all}</div></div>`
      : html`<div class="grid grid--${Math.max(cards.length, 1)} icards">${cards.map((c, n) => insightCard(ctx, c, n === 0 ? override : null))}</div>
  ${rowList}${all}`
  }
</div></section>`;
}

// ---------- Events ----------
// One row per event: when, what, and a line about it. With `insights`, the latest posts
// join the same list in the same rows, newest first, so news and events read as one.
// Notes (an office move) stay out of it. A row with somewhere to go is one link, the
// whole row; one without stays text.
export interface EventsBlockOptions {
  id?: string;
  label?: string;
  desk?: ProductDesk;
  pastOnly?: boolean;
  band?: boolean;
  today: string;
  insights?: { deskFilter: readonly Desk[]; count: number };
}

interface EventRow {
  key: string;
  month: string;
  kind?: string;
  name: string;
  note: string;
  href?: string | undefined;
}

export function eventsBlock(
  ctx: Ctx,
  { id = 'events', label = 'Events', desk, pastOnly = false, band = true, today, insights: news }: EventsBlockOptions,
): Html {
  const nowYm = today.slice(0, 7);
  const rows: EventRow[] = events
    .filter((e) => !desk || e.desks.includes(desk))
    .filter((e) => !pastOnly || e.month <= nowYm)
    .map((e) => ({
      key: `${e.month}-01`,
      month: e.month,
      name: e.name,
      note: e.note,
      href: e.post ? ctx.link(`blog/${e.post}`) : e.url,
    }));
  if (news) {
    const told = new Set(events.map((e) => e.post).filter(Boolean));
    const posts = insights
      .filter(
        (it) =>
          news.deskFilter.includes(it.desk) && it.type !== 'Note' && !it.placeholder && !(it.post && told.has(it.post)),
      )
      .sort(byDateDesc)
      .slice(0, news.count);
    for (const it of posts) {
      rows.push({
        key: it.date,
        month: it.date.slice(0, 7),
        kind: it.type,
        name: it.title,
        note: it.standfirst ?? '',
        href: insightHref(ctx, it),
      });
    }
  }
  rows.sort((a, b) => (a.key < b.key ? 1 : -1));
  return html`
<section class="${band ? 'band ' : ''}section" id="${id}"><div class="wrap">
  ${sectionHead(label)}
  <ul class="events">${rows.map((r) => {
    const soon = !r.kind && r.month > nowYm;
    const tag = soon ? 'Upcoming' : r.kind;
    const inner = html`
      <span class="event__when">${fmtMonth(r.month)}${tag ? html`<span class="event__soon">${tag}</span>` : ''}</span>
      <span class="event__name h4">${r.name}</span>
      <span class="event__note muted">${r.note}</span>`;
    const cls = `event${soon ? ' event--upcoming' : ''}`;
    return r.href
      ? html`
    <li><a class="${cls} event--link" href="${r.href}">${inner}</a></li>`
      : html`
    <li class="${cls}">${inner}</li>`;
  })}
  </ul>
</div></section>`;
}

// ---------- People ----------
// variant 'row': small portrait beside the name (product pages). 'portrait': tall photo (company, careers).

const initials = (name: string) =>
  name
    .split(/\s+/)
    .map((w) => w[0])
    .join('')
    .slice(0, 2);

// The lines under a person's name, from the fact base. Nothing when there are none yet.
const factList = (p: Person, size: 'body' | 'small') =>
  p.facts.length ? html`<ul class="pfacts ${size}">${p.facts.map((f) => html`<li>${f}</li>`)}</ul>` : '';

// A founder, larger: portrait (or their film, once there is one), name, role, bio.
export function founder(ctx: Ctx, id: PersonId): Html {
  const p = people[id];
  const portrait = html`<img src="${ctx.asset(`img/people/${p.photo}`)}" alt="${p.name}" loading="lazy">`;
  return html`
<article class="founder">
  <div class="founder__media">${
    p.video
      ? html`<video controls preload="none" poster="${ctx.asset(`img/people/${p.photo}`)}"><source src="${ctx.asset(`video/${p.video}`)}" type="video/mp4"><p>${p.name}: <a href="${ctx.asset(`video/${p.video}`)}">watch the film</a>.</p></video>`
      : portrait
  }</div>
  <div class="founder__text">
    <h3 class="h3">${p.name}</h3>
    <p class="caption muted">${p.role}</p>
    ${factList(p, 'body')}
    ${p.linkedin ? html`<a class="more" href="${p.linkedin}" target="_blank" rel="noopener noreferrer" aria-label="${p.name} on LinkedIn">LinkedIn</a>` : ''}
  </div>
</article>`;
}

// The integrations strip along the top of every page: a slow loop of logos. The
// list is written twice so the loop has no seam; the copy is hidden from readers.
export function logoStrip(ctx: Ctx): Html {
  if (!integrations.length) return html``;
  const row = (hidden: boolean) =>
    html`<ul class="strip__row"${hidden ? html` aria-hidden="true"` : ''}>${integrations.map(
      (i) => html`<li><img src="${ctx.asset(`img/logos/${i.logo}`)}" alt="${hidden ? '' : i.name}" height="20"></li>`,
    )}</ul>`;
  return html`<div class="strip" role="region" aria-label="Integrations"><div class="strip__track">${row(false)}${row(true)}</div></div>`;
}

// ---------- Who we work with ----------
// One card per client type: its drawing where it has one, the type, one line and,
// where given, the needs it names. A card links to its client page where there is
// one. The accent follows the desk.
export interface WhoClient {
  who: string;
  line: string;
  art?: Art;
  needs?: readonly string[];
  to?: string;
  /** Where the card goes, said at its foot ("See Token Disclosure"), when the corner arrow is not enough. */
  more?: string;
}

export function whoCards(
  ctx: Ctx,
  { desk, title, lead, clients }: { desk: ProductDesk; title: string; lead?: string; clients: readonly WhoClient[] },
): Html {
  // With a multiple of four cards, or of three (laid out three across), the intro takes a
  // row of its own so no card is left alone.
  const three = clients.length % 3 === 0 && clients.length % 4 !== 0;
  const wide = clients.length % 4 === 0 || three;
  return html`
<section class="band section" id="clients"><div class="wrap">
  <ul class="who who--${desk}${wide ? ' who--wide-intro' : ''}${three ? ' who--three' : ''}">
    <li class="who__intro">
      <h2 class="h2">${title}</h2>
      ${lead ? html`<p class="body muted">${lead}</p>` : ''}
    </li>
    ${clients.map((c) => {
      const inner = html`${c.art ? art(c.art) : ''}<span class="who__title">${c.who}</span>
        <span class="who__line">${c.line}</span>
        ${c.needs ? html`<span class="who__needs">${c.needs.map((x) => html`<span>${x}</span>`)}</span>` : ''}
        ${c.more ? html`<span class="who__more">${c.more} <span aria-hidden="true">→</span></span>` : ''}`;
      return c.to
        ? html`<li><a class="who__card who__card--link${c.more ? ' who__card--more' : ''}" href="${ctx.link(c.to)}">${inner}</a></li>`
        : html`<li><div class="who__card">${inner}</div></li>`;
    })}
  </ul>
</div></section>`;
}

/** The one-line pitch of a client-type page, as its card on the desk page reads. */
export const audienceLine = (desk: ProductDesk, id: string) => {
  const a = audiencePages.find((x) => x.desk === desk && x.id === id);
  if (!a) throw new Error(`No client page ${desk}/${id}`);
  return a.card.text;
};

// ---------- Article template ----------
// Every long-form page (a blog post, a job description, a legal notice) is the same
// template, after the live eunice.ai pages: a rounded card with the breadcrumb, a
// tag, the title and date on the left and the cover (or a panel) on the right; then
// the text in one reading column. On tablet and phone the right side drops below.
export type TagTone = 'video' | 'article' | 'press' | 'plain';

export interface ArticleOptions {
  crumbs: readonly { label: string; to: string }[];
  tag: { label: string; tone: TagTone };
  title: string;
  /** Under the title: a date, or where a role is based. */
  date?: Html | string;
  /** The right side of the card: a cover image, a video link or a panel. */
  media?: MaybeHtml;
  standfirst?: string;
  body: Html;
  /** Under the text: a link back, a call to action. */
  after?: MaybeHtml;
  /** Legal notices read as one plain left-aligned column. */
  plain?: boolean;
}

export const article = (ctx: Ctx, o: ArticleOptions): Html => html`
<div class="wrap article${o.plain ? ' article--plain' : ''}">
  <header class="acard${o.media ? '' : ' acard--solo'}">
    <div class="acard__text">
      <nav class="acrumbs" aria-label="Breadcrumb">${o.crumbs.map((c) => html`<a href="${ctx.link(c.to)}">${c.label}</a><span aria-hidden="true">/</span>`)}<span aria-current="page">${o.title}</span></nav>
      <p class="tag-pill tag-pill--${o.tag.tone}">${o.tag.label}</p>
      <h1 class="h1 acard__title">${o.title}</h1>
      ${o.date ? html`<p class="acard__date">${o.date}</p>` : ''}
    </div>
    ${o.media ? html`<div class="acard__media">${o.media}</div>` : ''}
  </header>
  <div class="aread">
    ${o.standfirst ? html`<p class="aread__lead">${o.standfirst}</p>` : ''}
    <div class="prose body">${o.body}</div>
    ${o.after || ''}
  </div>
</div>`;

// ---------- List cards ----------
// The one list layout: /blog/ and /careers/ (and the careers section on the welcome
// page). A card is a whole link when it has one destination; a role card has two
// (read the role, apply), so its title is the link and its actions sit below.
export interface ListCard {
  href: string;
  meta: Html | string;
  title: string;
  text?: string;
  cover?: MaybeHtml;
  /** Shown instead of a cover: a short word on a tinted tile. */
  tile?: string;
  actions?: Html;
}

export const listCards = (cards: readonly ListCard[]): Html => html`
<ul class="lcards">${cards.map((c) => {
  const media = html`<span class="lcard__media">${c.cover || html`<span class="lcard__tile">${c.tile ?? ''}</span>`}</span>`;
  const text = html`<span class="lcard__meta">${c.meta}</span><span class="lcard__title">${c.title}</span>${c.text ? html`<span class="lcard__text">${c.text}</span>` : ''}`;
  return c.actions
    ? html`<li class="lcard lcard--split">${media}<a class="lcard__link" href="${c.href}">${text}</a><span class="lcard__actions">${c.actions}</span></li>`
    : html`<li><a class="lcard" href="${c.href}">${media}${text}</a></li>`;
})}</ul>`;

// ---------- People strip ----------
// The team in one row. One person is always open: their portrait and, to its right,
// who they are. Pointing at, focusing or tapping another opens them instead; the row
// never snaps back to empty. On tablet and phone it is an accordion.
// `open`: who is open when the page loads (the first person unless given).
export function peopleStrip(
  ctx: Ctx,
  ids: readonly PersonId[],
  opening?: { title: string; slug: string; line: string },
  open: PersonId | undefined = ids[0],
): Html {
  const key = (ctx.slug || 'home').replaceAll('/', '-');
  const item = (id: string, open: boolean, face: Html, label: Html, info: Html) => html`
  <li class="pstrip__item${open ? ' is-open' : ''}">
    <button type="button" class="pstrip__face" aria-expanded="${String(open)}" aria-controls="ps-${key}-${id}">${face}<span class="pstrip__label">${label}</span></button>
    <div class="pstrip__info" id="ps-${key}-${id}">${info}</div>
  </li>`;
  return html`<ul class="pstrip" data-strip>${ids.map((id) => {
    const p = people[id];
    const face = p.photo
      ? html`<img src="${ctx.asset(`img/people/${p.photo}`)}" alt="" loading="lazy">`
      : html`<span class="pstrip__initials" aria-hidden="true">${initials(p.name)}</span>`;
    return item(
      id,
      id === open,
      face,
      html`<span class="pstrip__name">${p.name}</span><span class="pstrip__role">${p.role}</span>`,
      html`<p class="h3">${p.name}</p>
      <p class="caption muted">${p.role}</p>
      ${factList(p, 'small')}
      ${p.linkedin ? html`<a class="more" href="${p.linkedin}" target="_blank" rel="noopener noreferrer" aria-label="${p.name} on LinkedIn">LinkedIn</a>` : ''}`,
    );
  })}${
    opening
      ? item(
          'opening',
          false,
          html`<span class="pstrip__empty">Your photo here</span>`,
          html`<span class="pstrip__name">We Are Hiring</span><span class="pstrip__role">${opening.title}</span>`,
          html`<p class="h3">${opening.title}</p>
      <p class="caption muted">Open role</p>
      <p class="small">${opening.line}</p>
      <a class="more" href="${ctx.link(`careers/${opening.slug}`)}">Read the role and apply</a>`,
        )
      : ''
  }</ul>`;
}

// ---------- Closing call to action ----------
// "Book demo" as one line: the visitor's work email and the button, in the desk's
// colour. A demo request asks nothing else (ADR-0013), so site.js sends it from here and
// thanks the visitor in place; method="dialog" keeps the address out of the URL when
// there is no script. Token Disclosure's own form is the white paper, which needs a
// name, so its pages ask for a demo through the general form, in the desk's gold.
const DEMO = 'Book demo';
const DEMO_FORMS = new Set(['general', 'private-markets', 'digital-assets']);
export const demoAsk = (desk: string, placement: Placement = 'closing') => html`
<form class="ask" method="dialog" data-form="${DEMO_FORMS.has(desk) ? desk : 'general'}" data-placement="${placement}">
  <label class="ask__field"><span class="sr-only">Work email</span><input type="email" name="email" placeholder="What’s your work email?" autocomplete="email" required></label>
  <button type="submit" class="btn btn--desk-${desk}">${DEMO}</button>
  <p class="ask__msg" role="status"></p>
</form>`;

// The closing call to action, the same on every page: the work-email line for a demo, in
// the desk's colour (`demo`), with any other way forward beside it, centred on white.
// Careers and the role pages leave the demo out: applications never go through a form here.
export const cta = (ctx: Ctx, { demo, buttons = [] }: { demo?: string; buttons?: readonly ButtonOptions[] }) => html`
<section class="wrap section">
  <div class="cta">
    <div class="cta__buttons">${buttons.map((b) => button(ctx, { placement: 'closing', ...b }))}${demo ? demoAsk(demo) : ''}</div>
  </div>
</section>`;
