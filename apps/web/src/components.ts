// Shared building blocks. Pages compose these; nothing here holds page copy.
import type { Placement } from '@eunice/contracts/forms';
import { audiencePages, desks, events, insights, integrations, partners, people } from './content/index.ts';
import type { Insight, Person, Quote } from './content/schema.ts';
import type { Ctx, Desk, NavItem, NavKey, ProductDesk } from './lib/types.ts';
import config from './site.config.ts';

// Re-exported: pages import their building blocks from one place.
export { esc, html, join, raw } from './lib/html.ts';

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

// The master brand file, split so the glyph can be used without the wordmark.
// Both are filled, not stroked, so `color` recolours them at the call site.
// Coordinates are the master's own, on its 68 x 21 canvas.
const GLYPH =
  'M17.8114 5.1871L9.15253 0.104897L0.493652 5.1871V15.3585L9.15253 20.4413L17.8114 15.3585V13.457L16.1311 12.4974L9.15253 16.648L3.58606 13.3357V7.20867L9.15253 3.89828L12.9173 6.13656L7.5415 9.33383V11.2232L9.15253 12.1689L17.8114 7.08602V5.1871Z';
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
  kind?: 'dark' | 'light' | 'outline' | 'outline-light';
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
  const cls = `btn btn--${kind}${small ? ' btn--sm' : ''}`;
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
// A section's label, with an aside or an action (a button) on the right.
export const sectionHead = (label: string, aside = '', action: Html | '' = '') =>
  html`<div class="shead"><h2 class="label">${label}</h2>${aside ? html`<p class="shead__aside">${aside}</p>` : ''}${action ? html`<div class="shead__action">${action}</div>` : ''}</div>`;

export const facts = (
  items: readonly { title: string; text: string }[],
  cols = items.length,
) => html`<div class="grid grid--${cols} facts">
  ${items.map((f) => html`<div class="fact"><p class="h4">${f.title}</p><p class="small muted">${f.text}</p></div>`)}
</div>`;

// Proof as numbers: one big figure and a one-line label each, the way the references
// show scale. Only figures that already appear elsewhere on the site.
export const numbers = (items: readonly { n: string; label: string }[]) => html`<ul class="numbers">
  ${items.map((i) => html`<li><span class="numbers__n">${i.n}</span><span class="numbers__label">${i.label}</span></li>`)}
</ul>`;

// Credentials as small outlined badges: named, not explained.
export const badges = (items: readonly string[]) =>
  html`<ul class="badges">${items.map((b) => html`<li>${b}</li>`)}</ul>`;

// One card for every quote: the same ground, the words in mono, and the product it
// is about named by the Eunice mark in that product's colour.
export const quoteBlock = (q: Quote, { withDesk = true } = {}) => html`
<figure class="quote">
  ${withDesk ? html`<span class="desk desk--${q.desk} quote__desk">${mark(12)}${desks[q.desk].label}</span>` : ''}
  <blockquote class="quote__text">“${q.text}”</blockquote>
  <figcaption class="caption muted">${q.who}</figcaption>
</figure>`;

export const partnersRow = (ctx: Ctx) => html`
<div class="partners">
  <p class="label">Working with</p>
  <ul>${partners.map((p) => {
    const s = imageSize(`img/logos/${p.logo}`);
    const width = s ? Math.round((s.width / s.height) * p.height) : p.height * 4;
    return html`<li><img src="${ctx.asset(`img/logos/${p.logo}`)}" alt="${p.name}" width="${width}" height="${p.height}" loading="lazy"></li>`;
  })}</ul>
</div>`;

// A photograph that fills its frame. The frame sets the crop, not the file.
export function photo(ctx: Ctx, { img, alt, variant }: { img: string; alt: string; variant: string }): Html {
  return html`<figure class="photo photo--${variant}"><img src="${ctx.asset(`img/${img}`)}" alt="${alt}" loading="lazy"></figure>`;
}

// A product image on a tinted field. `img` is a file under /assets/img; `html` is inline markup.
export interface PlateOptions {
  img?: string;
  /** A silent product film: its name under assets/video/, which holds a VP9 .webm (Chrome,
   *  Firefox, Edge) and an H.264 .mp4 (Safari, iOS). It plays on its own, loops, and has a
   *  pause button (WCAG 2.2.2); with reduced motion it starts paused. `img` is its poster,
   *  shown until it plays and giving the box its size. */
  video?: string;
  /** Inline markup, for a visual drawn in HTML rather than a screenshot. */
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

// The product hero, as in the Figma file (Eunice · Site v5): a photo field (misted ridges,
// generated art, for private markets; copper for everything under Crypto & RWA) and on it the drawn UI in
// a frosted glass frame that runs off the right and bottom edges.
const FIELD: Record<ProductDesk, string> = {
  'private-markets': 'art-ridges.jpg',
  'digital-assets': 'hero-crypto.jpg',
  'token-disclosure': 'hero-crypto.jpg',
};
export const heroField = (ctx: Ctx, { desk }: { desk: ProductDesk }): Html => html`
<div class="hero__visual hero__visual--field hero__visual--${desk}">
  <img class="field__photo" src="${ctx.asset(`img/${FIELD[desk]}`)}" alt=""${sized(FIELD[desk])}>
  <div class="field__glass">${uiAsk(desk)}</div>
</div>`;

/** A silent product film with its pause button: see PlateOptions.video. */
const film = (ctx: Ctx, { video, img, alt }: { video: string; img?: string | undefined; alt: string }): Html =>
  html`<span class="plate__media"><video${img ? html` poster="${ctx.asset(`img/${img}`)}"${sized(img)}` : ''} aria-label="${alt}" autoplay muted loop playsinline preload="auto" data-autoplay>
    <source src="${ctx.asset(`video/${video}.webm`)}" type="video/webm">
    <source src="${ctx.asset(`video/${video}.mp4`)}" type="video/mp4">
  </video>
  <button type="button" class="plate__toggle" data-video-toggle aria-pressed="false" aria-label="Pause the film"></button></span>`;

export function plate(ctx: Ctx, { img, video, html: markup, alt = '', tint = 'none' }: PlateOptions): Html {
  const inner = video
    ? film(ctx, { video, img, alt })
    : img
      ? html`<img src="${ctx.asset(`img/${img}`)}" alt="${alt}"${sized(img)} loading="lazy">`
      : markup;
  return html`<figure class="plate plate--${tint}${video ? ' plate--video' : ''}">${inner}</figure>`;
}

// A product film on a photograph, full width under a feature: the photo is the stage and
// the film sits on it in the same frosted glass frame as the product heroes.
export const stage = (
  ctx: Ctx,
  { photo, video, img, alt }: { photo: string; video: string; img?: string | undefined; alt: string },
): Html => html`<figure class="stage">
  <img class="stage__photo" src="${ctx.asset(`img/${photo}`)}" alt=""${sized(photo)} loading="lazy">
  <div class="stage__glass">${film(ctx, { video, img, alt })}</div>
</figure>`;

// Numbered product row: text on one side, visual on the other.
export interface FeatureOptions {
  id?: string;
  num: string;
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
  num,
  title,
  body,
  visual,
  flip = false,
  desk = 'private-markets',
  stage: below,
}: FeatureOptions): Html {
  return html`
<section class="wrap feature${flip ? ' feature--flip' : ''}" ${id ? html`id="${id}"` : ''}>
  <div class="feature__text">
    <p class="num num--${desk}">${num}</p>
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
  aside?: string;
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
  {
    id = 'insights',
    label,
    aside,
    deskFilter,
    featured = 3,
    rows = 5,
    override = null,
    band = false,
  }: InsightsBlockOptions,
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
  ${sectionHead(label, aside)}
  ${
    only && cards.length === 1
      ? html`<div class="ifeature">${insightCard(ctx, only, override)}<div class="ifeature__list">${rowList}${all}</div></div>`
      : html`<div class="grid grid--${Math.max(cards.length, 1)} icards">${cards.map((c, n) => insightCard(ctx, c, n === 0 ? override : null))}</div>
  ${rowList}${all}`
  }
</div></section>`;
}

// ---------- Events ----------
export interface EventsBlockOptions {
  id?: string;
  label?: string;
  aside?: string;
  desk?: ProductDesk;
  pastOnly?: boolean;
  band?: boolean;
  today: string;
}

export function eventsBlock(
  _ctx: Ctx,
  { id = 'events', label = 'Events', aside, desk, pastOnly = false, band = true, today }: EventsBlockOptions,
): Html {
  const nowYm = today.slice(0, 7);
  const list = events
    .filter((e) => !desk || e.desks.includes(desk))
    .filter((e) => !pastOnly || e.month <= nowYm)
    .sort((a, b) => (a.month < b.month ? 1 : -1));
  return html`
<section class="${band ? 'band ' : ''}section" id="${id}"><div class="wrap">
  ${sectionHead(label, aside)}
  <ul class="events">${list.map(
    (e) => html`
    <li class="event${e.month > nowYm ? ' event--upcoming' : ''}">
      <span class="event__when">${fmtMonth(e.month)}${e.month > nowYm ? html`<span class="event__soon">Upcoming</span>` : ''}</span>
      <span class="event__name h4">${e.name}</span>
      <span class="event__note muted">${e.note}</span>
    </li>`,
  )}
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
// One card per client type: a number, the type, one line and the needs it names.
// A card links to its client page where there is one. The accent follows the desk.
export interface WhoClient {
  who: string;
  line: string;
  needs: readonly string[];
  to?: string;
}

export function whoCards(
  ctx: Ctx,
  {
    desk,
    kicker,
    title,
    lead,
    clients,
  }: { desk: ProductDesk; kicker: string; title: string; lead: string; clients: readonly WhoClient[] },
): Html {
  // With a multiple of four cards, the intro takes a row of its own so none is left alone.
  const wide = clients.length % 4 === 0;
  return html`
<section class="band section" id="clients"><div class="wrap">
  <ul class="who who--${desk}${wide ? ' who--wide-intro' : ''}">
    <li class="who__intro">
      <p class="kicker desk-text--${desk}">${kicker}</p>
      <h2 class="h2">${title}</h2>
      <p class="body muted">${lead}</p>
    </li>
    ${clients.map((c, n) => {
      const inner = html`<span class="who__num">${String(n + 1).padStart(2, '0')}</span>
        <span class="who__title">${c.who}</span>
        <span class="who__line">${c.line}</span>
        <span class="who__needs">${c.needs.map((x) => html`<span>${x}</span>`)}</span>`;
      return c.to
        ? html`<li><a class="who__card who__card--link" href="${ctx.link(c.to)}">${inner}</a></li>`
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
          html`<span class="pstrip__name">We are hiring</span><span class="pstrip__role">${opening.title}</span>`,
          html`<p class="h3">${opening.title}</p>
      <p class="caption muted">Open role</p>
      <p class="small">${opening.line}</p>
      <a class="more" href="${ctx.link(`careers/${opening.slug}`)}">Read the role and apply</a>`,
        )
      : ''
  }</ul>`;
}

// ---------- Closing call to action ----------
export const cta = (
  ctx: Ctx,
  { title, text, buttons }: { title: string; text: string; buttons: readonly ButtonOptions[] },
) => html`
<section class="wrap section">
  <div class="cta">
    <div><h2 class="h2">${title}</h2><p class="cta__text">${text}</p></div>
    <div class="cta__buttons">${buttons.map((b) => button(ctx, { placement: 'closing', ...b }))}</div>
  </div>
</section>`;
