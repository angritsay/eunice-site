// Shared building blocks. Pages compose these; nothing here holds page copy.
import type { Placement } from '@eunice/contracts/forms';
import { audiencePages, desks, events, insights, partners, people } from './content/index.ts';
import type { Insight, Quote } from './content/schema.ts';
import type { Ctx, Desk, NavItem, NavKey, ProductDesk } from './lib/types.ts';
import config from './site.config.ts';

// Re-exported: pages import their building blocks from one place.
export { esc, html, join, raw } from './lib/html.ts';

import { esc, type Html, html } from './lib/html.ts';

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
  html`<svg class="logo" width="${((size * 68) / 21).toFixed(2)}" height="${size}" viewBox="0 0 68 21" fill="${color}" role="img"><title>Eunice</title><path d="${GLYPH}"/>${WORDMARK}</svg>`;

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
export function header(ctx: Ctx, navKey: NavKey = 'company'): Html {
  const nav = config.nav[navKey];
  const deskForm = navKey === 'company' ? 'general' : navKey;
  const topLeft = navKey === 'company' ? '' : html`<a href="${ctx.link('')}">Eunice</a>`;
  const current = (item: NavItem) => (!item.hash && item.to === ctx.slug ? html` aria-current="page"` : '');
  return html`
<div class="topbar"><div class="wrap topbar__in">
  <div class="topbar__left">${topLeft || html`<span>Eunice</span>`}</div>
  <nav class="topbar__right" aria-label="Secondary">${nav.top.map((i) => html`<a href="${href(ctx, i)}">${i.label}</a>`)}</nav>
</div></div>
<header class="wrap nav">
  <a class="lockup" href="${ctx.link(navKey === 'company' ? '' : navKey)}">
    ${logo(17)}${nav.lockup ? html`<span class="lockup__rule"></span><span class="lockup__desk">${nav.lockup}</span>` : ''}
  </a>
  <nav class="nav__links" id="nav-links" aria-label="Main">
    ${nav.main.map((i) => html`<a href="${href(ctx, i)}"${current(i)}>${i.label}</a>`)}
    <span class="nav__mobile-extra">${nav.top.map((i) => html`<a href="${href(ctx, i)}">${i.label}</a>`)}</span>
  </nav>
  <div class="nav__actions">
    <button type="button" class="btn btn--dark" data-form="${deskForm}" data-placement="nav">Talk to us</button>
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
          : html`<a href="${href(ctx, l)}">${l.label}</a>`,
      )}
    </div>`,
    )}
  </div>
  <div class="footer__legal">
    <span>${config.legalLine}</span>
    <span class="footer__legal-links"><a href="#">Privacy</a><a href="#">Terms</a><a href="${ctx.link('security')}">Security</a><a href="#">Status</a></span>
  </div>
</footer>`;
}

// ---------- Section scaffolding ----------
export const sectionHead = (label: string, aside = '') =>
  html`<div class="shead"><h2 class="label">${label}</h2>${aside ? html`<p class="shead__aside">${aside}</p>` : ''}</div>`;

// The cards for a desk's personalised pages, in the order the content file lists
// them. A desk page shows these; the home page writes its own, since it speaks to
// someone who has not picked a desk yet.
export const audienceCards = (desk: ProductDesk): AudienceItem[] =>
  audiencePages
    .filter((a) => a.desk === desk)
    .map((a) => ({ id: a.id, desk, title: a.card.title, text: a.card.text, to: `${desk}/${a.id}` }));

export interface AudienceItem {
  id?: string;
  desk: Desk;
  title: string;
  text: string;
  to?: string;
  hash?: string;
}

// An item with a `to` is the whole card: the card itself is the link, so the
// click target is the tile rather than four words at the bottom of it.
export function audiences(ctx: Ctx, items: readonly AudienceItem[]): Html {
  return html`<div class="grid grid--${items.length > 4 ? 6 : 4} audiences">
  ${items.map((a) => {
    const body = html`
      ${deskLabel(a.desk)}
      <h3 class="h4">${a.title}</h3>
      <p class="small muted">${a.text}</p>`;
    const id = a.id ? html` id="${a.id}"` : '';
    return a.to
      ? html`<a class="audience audience--link"${id} href="${ctx.link(a.to, a.hash)}">${body}
      <span class="more">See how</span>
    </a>`
      : html`<div class="audience"${id}>${body}
    </div>`;
  })}
  </div>`;
}

export const facts = (
  items: readonly { title: string; text: string }[],
  cols = items.length,
) => html`<div class="grid grid--${cols} facts">
  ${items.map((f) => html`<div class="fact"><p class="h4">${f.title}</p><p class="small muted">${f.text}</p></div>`)}
</div>`;

export const quoteBlock = (q: Quote, { withDesk = true } = {}) => html`
<figure class="quote quote--${q.desk}">
  ${withDesk ? deskLabel(q.desk) : ''}
  <blockquote class="h3">“${q.text}”</blockquote>
  <figcaption class="caption muted">${q.who}</figcaption>
</figure>`;

export const partnersRow = () => html`
<div class="partners">
  <p class="label">Working with</p>
  <ul>${partners.map((p) => html`<li>${p}</li>`)}</ul>
</div>`;

// A photograph that fills its frame. The frame sets the crop, not the file.
export function photo(ctx: Ctx, { img, alt, variant }: { img: string; alt: string; variant: string }): Html {
  return html`<figure class="photo photo--${variant}"><img src="${ctx.asset(`img/${img}`)}" alt="${alt}" loading="lazy"></figure>`;
}

// A product image on a tinted field. `img` is a file under /assets/img; `html` is inline markup.
export interface PlateOptions {
  img?: string;
  /** Inline markup, for a visual drawn in HTML rather than a screenshot. */
  html?: Html;
  alt?: string;
  tint?: string;
  bleed?: boolean;
}

export function plate(ctx: Ctx, { img, html: markup, alt = '', tint = 'none', bleed = false }: PlateOptions): Html {
  const inner = img ? html`<img src="${ctx.asset(`img/${img}`)}" alt="${alt}" loading="lazy">` : markup;
  return html`<figure class="plate plate--${tint}${bleed ? ' plate--bleed' : ''}">${inner}</figure>`;
}

// Numbered product row: text on one side, visual on the other.
export interface FeatureOptions {
  id?: string;
  num: string;
  title: string;
  body: Html;
  visual: Html;
  flip?: boolean;
  desk?: ProductDesk;
}

export function feature({
  id,
  num,
  title,
  body,
  visual,
  flip = false,
  desk = 'private-markets',
}: FeatureOptions): Html {
  return html`
<section class="wrap feature${flip ? ' feature--flip' : ''}" ${id ? html`id="${id}"` : ''}>
  <div class="feature__text">
    <p class="num num--${desk}">${num}</p>
    <h2 class="h2">${title}</h2>
    ${body}
  </div>
  <div class="feature__visual">${visual}</div>
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

export function insightCard(ctx: Ctx, it: Insight, override: Partial<Insight> | null = null): Html {
  const o = { ...it, ...(override || {}) };
  const href = insightHref(ctx, o);
  return html`<article class="icard">
    <p class="icard__meta tag--${o.desk}">${desks[o.desk].label} <span>· ${o.type} · ${fmtDay(o.date)}</span></p>
    <h3 class="h3 ${o.placeholder ? 'placeholder' : ''}">${o.title}</h3>
    ${o.standfirst ? html`<p class="small muted ${o.placeholder ? 'placeholder' : ''}">${o.standfirst}</p>` : ''}
    ${href || o.placeholder ? html`<a class="more" href="${href || '#'}">${o.type === 'Video' ? 'Watch' : 'Read'} the ${o.type.toLowerCase()}</a>` : ''}
  </article>`;
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
    band = true,
  }: InsightsBlockOptions,
): Html {
  const list = insights.filter((i) => !deskFilter || deskFilter.includes(i.desk)).sort(byDateDesc);
  const cards = list.filter((i) => i.featured).slice(0, featured);
  const rest = list.filter((i) => !cards.includes(i)).slice(0, rows);
  return html`
<section class="${band ? 'band ' : ''}section" id="${id}"><div class="wrap">
  ${sectionHead(label, aside)}
  <div class="grid grid--${Math.max(cards.length, 1)} icards">${cards.map((c, n) => insightCard(ctx, c, n === 0 ? override : null))}</div>
  <ul class="irows">${rest.map((r) => insightRow(ctx, r))}</ul>
  <p class="all"><a class="more" href="${ctx.link('insights', null, deskFilter && deskFilter.length === 1 ? deskFilter[0] : null)}">All insights</a></p>
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
export function person(ctx: Ctx, id: PersonId, variant: 'row' | 'portrait' = 'row'): Html {
  const p = people[id];
  const photo = p.photo ? html`<img src="${ctx.asset(`img/people/${p.photo}`)}" alt="${p.name}" loading="lazy">` : '';
  // Keyed by page as well as person: preview.html holds every page in one document,
  // so the same bio appears several times there. Deterministic, unlike a random suffix.
  const bioId = `bio-${(ctx.slug || 'home').replaceAll('/', '-')}-${id}`;
  const nameEl = p.bio
    ? html`<button type="button" class="person__name h4" aria-expanded="false" aria-controls="${bioId}">${p.name}<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m6 9 6 6 6-6"/></svg></button>`
    : html`<p class="person__name h4">${p.name}</p>`;
  return html`
<div class="person person--${variant}${p.bio ? ' person--has-bio' : ''}">
  <div class="person__photo">${photo}</div>
  <div class="person__text">
    ${nameEl}
    <p class="caption muted">${p.role}</p>
    ${variant === 'portrait' ? html`<p class="small">${p.owns}</p>` : ''}
    ${p.bio ? html`<div class="person__bio" id="${bioId}"><div><p class="small muted">${p.bio}</p></div></div>` : ''}
  </div>
</div>`;
}

export const peopleGrid = (
  ctx: Ctx,
  ids: readonly PersonId[],
  variant: 'row' | 'portrait' = 'row',
  extra: MaybeHtml = '',
) =>
  html`<div class="grid grid--${variant === 'row' ? 4 : 5} people people--${variant}">${ids.map((id) => person(ctx, id, variant))}${extra}</div>`;

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
