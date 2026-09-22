// Shared building blocks. Pages compose these; nothing here holds page copy.
import config from './site.config.js';
import { desks, people, insights, events, partners } from './content/index.js';

export const esc = (s = '') =>
  String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const MONTHS_LONG = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
export const fmtDay = (iso) => { const [y, m, d] = iso.split('-').map(Number); return `${d} ${MONTHS[m - 1]} ${y}`; };
export const fmtDayLong = (iso) => { const [y, m, d] = iso.split('-').map(Number); return `${d} ${MONTHS_LONG[m - 1]} ${y}`; };
export const fmtMonth = (ym) => { const [y, m] = ym.split('-').map(Number); return `${MONTHS_LONG[m - 1]} ${y}`; };

// Resolve a nav/link item to an href.
export function href(ctx, item) {
  if (item.href === 'login') return config.loginUrl;
  if (item.href) return item.href;
  return ctx.link(item.to, item.hash, item.query);
}

// The Eunice mark. TODO: swap for the master SVG from the brand files.
export const mark = (size = 22, color = 'currentColor') =>
  `<svg class="mark" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2.6" stroke-linejoin="round" stroke-linecap="round" aria-hidden="true"><path d="M19.5 7 12 2.8 4.5 7v10l7.5 4.2 7.5-4.2"/><path d="M9 12h7.5"/></svg>`;

export const deskLabel = (desk, extra = '') =>
  `<span class="desk desk--${desk}"><span class="dot"></span>${esc(desks[desk].label)}${extra ? ` <span class="desk__meta">· ${esc(extra)}</span>` : ''}</span>`;

// ---------- Buttons ----------
// kind: 'dark' | 'light' | 'outline' | 'outline-light'
export function button(ctx, { label, kind = 'dark', to, hash, query, href: h, talk, role }) {
  const cls = `btn btn--${kind}`;
  if (talk !== undefined || role !== undefined) {
    const data = role ? `data-role="${esc(role)}"` : `data-talk="${esc(talk)}"`;
    return `<button type="button" class="${cls}" ${data}>${esc(label)}</button>`;
  }
  return `<a class="${cls}" href="${esc(href(ctx, { to, hash, query, href: h }))}">${esc(label)}</a>`;
}

// ---------- Header ----------
export function header(ctx, navKey = 'company') {
  const nav = config.nav[navKey];
  const deskTalk = navKey === 'company' ? 'general' : navKey;
  const topLeft = navKey === 'company' ? '' : `<a href="${ctx.link('')}">Eunice</a>`;
  const current = (item) => (!item.hash && item.to === ctx.slug ? ' aria-current="page"' : '');
  return `
<div class="topbar"><div class="wrap topbar__in">
  <div class="topbar__left">${topLeft || '<span>Eunice</span>'}</div>
  <nav class="topbar__right" aria-label="Secondary">${nav.top.map((i) => `<a href="${esc(href(ctx, i))}">${esc(i.label)}</a>`).join('')}</nav>
</div></div>
<header class="wrap nav">
  <a class="lockup" href="${ctx.link(navKey === 'company' ? '' : navKey)}">
    ${mark(20)}<span class="lockup__name">Eunice</span>${nav.lockup ? `<span class="lockup__rule"></span><span class="lockup__desk">${esc(nav.lockup)}</span>` : ''}
  </a>
  <nav class="nav__links" id="nav-links" aria-label="Main">
    ${nav.main.map((i) => `<a href="${esc(href(ctx, i))}"${current(i)}>${esc(i.label)}</a>`).join('')}
    <span class="nav__mobile-extra">${nav.top.map((i) => `<a href="${esc(href(ctx, i))}">${esc(i.label)}</a>`).join('')}</span>
  </nav>
  <div class="nav__actions">
    <button type="button" class="btn btn--dark" data-talk="${deskTalk}">Talk to us</button>
    <button type="button" class="nav__menu" aria-controls="nav-links" aria-expanded="false" aria-label="Open menu">
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><path d="M4 8h16M4 16h16"/></svg>
    </button>
  </div>
</header>`;
}

// ---------- Footer ----------
export function footer(ctx) {
  return `
<footer class="wrap footer">
  <div class="footer__grid">
    <div class="footer__brand">
      <a class="lockup" href="${ctx.link('')}">${mark(18)}<span class="lockup__name">Eunice</span></a>
      <p>${esc(config.tagline)}</p>
    </div>
    ${config.footer.map((col) => `
    <div class="footer__col">
      <p class="label">${esc(col.title)}</p>
      ${col.links.map((l) => (l.talk
        ? `<button type="button" class="linklike" data-talk="${l.talk}">${esc(l.label)}</button>`
        : `<a href="${esc(href(ctx, l))}">${esc(l.label)}</a>`)).join('')}
    </div>`).join('')}
  </div>
  <div class="footer__legal">
    <span>${esc(config.legalLine)}</span>
    <span class="footer__legal-links"><a href="#">Privacy</a><a href="#">Terms</a><a href="${ctx.link('company', 'how-we-work')}">Security</a><a href="#">Status</a></span>
  </div>
</footer>`;
}

// ---------- Section scaffolding ----------
export const sectionHead = (label, aside = '') =>
  `<div class="shead"><h2 class="label">${esc(label)}</h2>${aside ? `<p class="shead__aside">${esc(aside)}</p>` : ''}</div>`;

// items: { id, desk, title, text, to, hash }
export function audiences(ctx, items, { links = false } = {}) {
  return `<div class="grid grid--${items.length > 4 ? 6 : 4} audiences">
  ${items.map((a) => `
    <div class="audience" ${a.id ? `id="${a.id}"` : ''}>
      ${deskLabel(a.desk)}
      <h3 class="h4">${esc(a.title)}</h3>
      <p class="small muted">${esc(a.text)}</p>
      ${links && a.to ? `<a class="more" href="${ctx.link(a.to, a.hash)}">See how</a>` : ''}
    </div>`).join('')}
  </div>`;
}

// items: { title, text }
export const facts = (items, cols = items.length) => `<div class="grid grid--${cols} facts">
  ${items.map((f) => `<div class="fact"><p class="h4">${esc(f.title)}</p><p class="small muted">${esc(f.text)}</p></div>`).join('')}
</div>`;

export const quoteBlock = (q, { withDesk = true } = {}) => `
<figure class="quote quote--${q.desk}">
  ${withDesk ? deskLabel(q.desk) : ''}
  <blockquote class="h3">“${esc(q.text)}”</blockquote>
  <figcaption class="caption muted">${esc(q.who)}</figcaption>
</figure>`;

export const partnersRow = () => `
<div class="partners">
  <p class="label">Working with</p>
  <ul>${partners.map((p) => `<li>${esc(p)}</li>`).join('')}</ul>
</div>`;

// A product image on a tinted field. `img` is a file under /assets/img; `html` is inline markup.
export function plate(ctx, { img, html, alt = '', tint = 'none', bleed = false }) {
  const inner = img ? `<img src="${ctx.asset('img/' + img)}" alt="${esc(alt)}" loading="lazy">` : html;
  return `<figure class="plate plate--${tint}${bleed ? ' plate--bleed' : ''}">${inner}</figure>`;
}

// Numbered product row: text on one side, visual on the other.
export function feature({ id, num, title, body, visual, flip = false, desk = 'private-markets' }) {
  return `
<section class="wrap feature${flip ? ' feature--flip' : ''}" ${id ? `id="${id}"` : ''}>
  <div class="feature__text">
    <p class="num num--${desk}">${num}</p>
    <h2 class="h2">${esc(title)}</h2>
    ${body}
  </div>
  <div class="feature__visual">${visual}</div>
</section>`;
}

export const bullets = (items, desk = 'private-markets') =>
  `<ul class="bullets bullets--${desk}">${items.map((i) => `<li>${esc(i)}</li>`).join('')}</ul>`;

// ---------- Insights ----------
const byDateDesc = (a, b) => (a.date < b.date ? 1 : -1);

export function insightRow(ctx, it, { showDesk = true } = {}) {
  const title = it.url ? `<a href="${esc(it.url)}">${esc(it.title)}</a>` : esc(it.title);
  return `<li class="irow" data-desk="${it.desk}">
    <span class="irow__date">${fmtDay(it.date)}</span>
    <span class="irow__title">${title}</span>
    ${showDesk ? `<span class="irow__tag tag--${it.desk}">${esc(desks[it.desk].label)} · ${esc(it.type)}</span>` : `<span class="irow__tag tag--${it.desk}">${esc(it.type)}</span>`}
  </li>`;
}

export function insightCard(ctx, it, override = null) {
  const o = { ...it, ...(override || {}) };
  return `<article class="icard">
    <p class="icard__meta tag--${o.desk}">${esc(desks[o.desk].label)} <span>· ${esc(o.type)} · ${fmtDay(o.date)}</span></p>
    <h3 class="h3 ${o.placeholder ? 'placeholder' : ''}">${esc(o.title)}</h3>
    ${o.standfirst ? `<p class="small muted ${o.placeholder ? 'placeholder' : ''}">${esc(o.standfirst)}</p>` : ''}
    ${o.url || o.placeholder ? `<a class="more" href="${esc(o.url || '#')}">Read the ${esc(o.type.toLowerCase())}</a>` : ''}
  </article>`;
}

// desks: which desks to include. featured: how many cards on top. override: replace the first card's copy.
export function insightsBlock(ctx, { id = 'insights', label, aside, deskFilter, featured = 3, rows = 5, override = null, band = true }) {
  const list = insights.filter((i) => !deskFilter || deskFilter.includes(i.desk)).sort(byDateDesc);
  const cards = list.filter((i) => i.featured).slice(0, featured);
  const rest = list.filter((i) => !cards.includes(i)).slice(0, rows);
  return `
<section class="${band ? 'band ' : ''}section" id="${id}"><div class="wrap">
  ${sectionHead(label, aside)}
  <div class="grid grid--${Math.max(cards.length, 1)} icards">${cards.map((c, n) => insightCard(ctx, c, n === 0 ? override : null)).join('')}</div>
  <ul class="irows">${rest.map((r) => insightRow(ctx, r)).join('')}</ul>
  <p class="all"><a class="more" href="${ctx.link('insights', null, deskFilter && deskFilter.length === 1 ? deskFilter[0] : null)}">All insights</a></p>
</div></section>`;
}

// ---------- Events ----------
export function eventsBlock(ctx, { id = 'events', label = 'Events', aside, desk, pastOnly = false, band = true, today }) {
  const nowYm = today.slice(0, 7);
  const list = events
    .filter((e) => !desk || e.desks.includes(desk))
    .filter((e) => !pastOnly || e.month <= nowYm)
    .sort((a, b) => (a.month < b.month ? 1 : -1));
  return `
<section class="${band ? 'band ' : ''}section" id="${id}"><div class="wrap">
  ${sectionHead(label, aside)}
  <ul class="events">${list.map((e) => `
    <li class="event${e.month > nowYm ? ' event--upcoming' : ''}">
      <span class="event__when">${fmtMonth(e.month)}${e.month > nowYm ? '<span class="event__soon">Upcoming</span>' : ''}</span>
      <span class="event__name h4">${esc(e.name)}</span>
      <span class="event__note muted">${esc(e.note)}</span>
    </li>`).join('')}
  </ul>
</div></section>`;
}

// ---------- People ----------
// variant 'row': small portrait beside the name (product pages). 'portrait': tall photo (company, careers).
export function person(ctx, id, variant = 'row') {
  const p = people[id];
  const photo = p.photo
    ? `<img src="${ctx.asset('img/people/' + p.photo)}" alt="${esc(p.name)}" loading="lazy">`
    : '';
  const bioId = `bio-${id}-${Math.random().toString(36).slice(2, 7)}`;
  const nameEl = p.bio
    ? `<button type="button" class="person__name h4" aria-expanded="false" aria-controls="${bioId}">${esc(p.name)}<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m6 9 6 6 6-6"/></svg></button>`
    : `<p class="person__name h4">${esc(p.name)}</p>`;
  return `
<div class="person person--${variant}${p.bio ? ' person--has-bio' : ''}">
  <div class="person__photo">${photo}</div>
  <div class="person__text">
    ${nameEl}
    <p class="caption muted">${esc(p.role)}</p>
    ${variant === 'portrait' ? `<p class="small">${esc(p.owns)}</p>` : ''}
    ${p.bio ? `<div class="person__bio" id="${bioId}"><div><p class="small muted">${esc(p.bio)}</p></div></div>` : ''}
  </div>
</div>`;
}

export const peopleGrid = (ctx, ids, variant = 'row', extra = '') =>
  `<div class="grid grid--${variant === 'row' ? 4 : 5} people people--${variant}">${ids.map((id) => person(ctx, id, variant)).join('')}${extra}</div>`;

// ---------- Closing call to action ----------
export const cta = (ctx, { title, text, buttons }) => `
<section class="wrap section">
  <div class="cta">
    <div><h2 class="h2">${esc(title)}</h2><p class="cta__text">${esc(text)}</p></div>
    <div class="cta__buttons">${buttons.map((b) => button(ctx, b)).join('')}</div>
  </div>
</section>`;
