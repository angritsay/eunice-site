// The product, drawn in HTML: the ideas behind Eunice (ask, read, monitor, report) in one
// window that looks the same everywhere: the glyph and a breadcrumb on top, a rail on the
// left, one view. The copy is illustrative (fictional funds and tokens), so nothing here
// goes stale when the product's screens change. Ink on white; the desk colour marks only
// the one thing that matters in each drawing. Every drawing runs on the same nine-second
// loop (the view settles in, the accent lands, holds, the loop starts again). The motion
// is CSS only and stops under prefers-reduced-motion.

import { GLYPH } from './lib/glyph.ts';
import { type Html, html } from './lib/html.ts';
import type { Desk } from './lib/types.ts';

type Row = readonly [string, string, string];

interface Copy {
  space: string;
  ask: { q: string; scope: readonly string[]; a: readonly (readonly [string, string])[]; hot: number; sources: string };
  read: { doc: string; page: string; h: string; before: string; hit: string; after: string; note: string };
  gap: { doc: string; page: string; h: string; lead: string; item: string; note: string };
  monitor: {
    title: string;
    sub: string;
    rows: readonly Row[];
    ticks: readonly string[];
    card: { title: string; meta: string; label: string; from: string; to: string };
  };
  report: { title: string; sub: string; rows: readonly Row[]; hot: number };
}

const PM: Copy = {
  space: 'Portfolio',
  ask: {
    q: 'Which funds changed their key-person terms this year?',
    scope: ['12 funds', '486 documents', 'Since Jan 2026'],
    a: [
      ['Fund C added a second key person in its amended LPA.', 'p. 14'],
      ['Fund F cut its key-person cure period from 180 to 120 days.', 'p. 22'],
      ['No other fund changed its key-person terms.', '12 funds'],
    ],
    hot: 0,
    sources: 'Sources · 3 documents · every line cited',
  },
  read: {
    doc: 'Fund C · Amended LPA',
    page: 'p. 14 of 62',
    h: '4.2 Key persons',
    before: 'The General Partner shall designate ',
    hit: 'a second Key Person, who shall devote substantially all business time',
    after: ' to the Partnership until the end of the Investment Period.',
    note: 'Second key person added',
  },
  gap: {
    doc: 'Fund C · Dataroom',
    page: '214 files',
    h: 'Side letters',
    lead: 'Referenced in the LPA on p. 9:',
    item: 'Side letter · MFN terms',
    note: 'Not in the dataroom. Asked for.',
  },
  monitor: {
    title: '12 funds',
    sub: 'Read again each quarter',
    rows: [
      ['Fund A', 'No change', 'Sep 12'],
      ['Fund B', 'No change', 'Sep 14'],
      ['Fund C', 'Report filed', 'Sep 18'],
      ['Fund D', 'Capital call', 'Sep 20'],
      ['Fund F', 'Changed', 'Sep 24'],
    ],
    ticks: ['Q4', 'Q1', 'Q2', 'Q3'],
    card: {
      title: 'Fund F · LPA amendment',
      meta: 'Clause 4.3 · p. 22',
      label: 'Cure period',
      from: '180 days',
      to: '120 days',
    },
  },
  report: {
    title: 'Fund C · Q3 review',
    sub: 'Your template · 8 sections',
    rows: [
      ['Strategy', 'Mid-market buyout', 'PPM p. 4'],
      ['Key persons', 'Two, named', 'LPA p. 14'],
      ['Management fee', '1.5% after year 5', 'LPA p. 31'],
      ['Net IRR', '14.2%', 'Q2 p. 6'],
      ['ESG policy', 'In place', 'DDQ p. 12'],
    ],
    hot: 1,
  },
};

const DA: Copy = {
  space: 'Tokens',
  ask: {
    q: 'Which tokens changed their unlock schedule this quarter?',
    scope: ['40 tokens', '1,120 sources', 'Since Jul 2026'],
    a: [
      ['Token B moved its team unlock from March to June.', 'Vote #42'],
      ['Token D added a 12-month cliff for new advisors.', 'p. 18'],
      ['No other token changed its schedule.', '40 tokens'],
    ],
    hot: 0,
    sources: 'Sources · on-chain and 3 documents · every line cited',
  },
  read: {
    doc: 'Token D · White paper v3',
    page: 'p. 18 of 44',
    h: '6.1 Vesting',
    before: 'Team allocations vest over 36 months, ',
    hit: 'with a 12-month cliff for every advisor who joins after launch',
    after: ', released monthly thereafter.',
    note: 'Advisor cliff added',
  },
  gap: {
    doc: 'Token D · Sources',
    page: '38 files',
    h: 'Audits',
    lead: 'Referenced in the white paper on p. 7:',
    item: 'Audit · treasury contract',
    note: 'Not published. Asked for.',
  },
  monitor: {
    title: '40 tokens',
    sub: 'On-chain and off, every day',
    rows: [
      ['Token A', 'No change', 'Sep 12'],
      ['Token E', 'No change', 'Sep 15'],
      ['Token C', 'Audit published', 'Sep 18'],
      ['Token F', 'Vote opened', 'Sep 21'],
      ['Token B', 'Changed', 'Sep 24'],
    ],
    ticks: ['Jul', 'Aug', 'Sep', 'Oct'],
    card: { title: 'Token B · Treasury', meta: 'Governance vote #42', label: 'Signers', from: '3 of 5', to: '2 of 5' },
  },
  report: {
    title: 'Token A · Due diligence',
    sub: 'Your template · 9 sections',
    rows: [
      ['Issuer', 'Foundation, Zug', 'Reg. p. 2'],
      ['Custody', 'Qualified custodian', 'Policy p. 5'],
      ['Contract audit', 'Two, no critical', 'Audit p. 1'],
      ['Treasury', '2 of 5 multisig', 'On-chain'],
      ['MiCA', 'In scope', 'Legal p. 3'],
    ],
    hot: 3,
  },
};

const TD: Copy = {
  space: 'White papers',
  ask: {
    q: 'Is our white paper ready to publish under MiCA?',
    scope: ['Annex I', '38 pages', 'Draft 4'],
    a: [
      ['Parts A to G are complete, each cited to its source.', 'p. 1–24'],
      ['Part H needs the audit scope stated.', 'p. 27'],
      ['The summary covers every required item.', 'Annex I'],
    ],
    hot: 1,
    sources: 'Sources · 6 documents · every line cited',
  },
  read: {
    doc: 'MiCA white paper · Part D',
    page: 'p. 11 of 38',
    h: 'D.4 Rights and obligations',
    before: 'Holders have ',
    hit: 'no claim on the offeror and no right of redemption',
    after: ', as set out in the terms of the offer to the public.',
    note: 'Matches the offer terms',
  },
  gap: {
    doc: 'MiCA white paper · Part H',
    page: 'p. 27 of 38',
    h: 'H.3 Audit',
    lead: 'Annex I asks for:',
    item: 'Scope of the smart-contract audit',
    note: 'Not stated yet. Drafted from the audit.',
  },
  monitor: {
    title: '3 white papers',
    sub: 'Checked against every update',
    rows: [
      ['Paper A', 'Published', 'Aug 30'],
      ['Paper B', 'No change', 'Sep 10'],
      ['Paper D', 'In review', 'Sep 16'],
      ['Paper C', 'Changed', 'Sep 22'],
    ],
    ticks: ['Jul', 'Aug', 'Sep', 'Oct'],
    card: { title: 'Paper C · Part E', meta: 'Offer terms · p. 14', label: 'Offer ends', from: '30 Nov', to: '15 Dec' },
  },
  report: {
    title: 'MiCA white paper · Draft 4',
    sub: 'Annex I · parts A to J',
    rows: [
      ['A · Offeror', 'Complete', 'Reg. p. 1'],
      ['D · Project', 'Complete', 'Deck p. 4'],
      ['E · Offer', 'Complete', 'Terms p. 2'],
      ['H · Technology', 'Needs review', 'Audit p. 7'],
      ['J · Sustainability', 'Complete', 'Data p. 3'],
    ],
    hot: 3,
  },
};

const COMPANY: Copy = {
  ...PM,
  ask: {
    q: 'What changed across our investments this quarter?',
    scope: ['Private markets', 'Crypto & RWA', 'Since Jul 2026'],
    a: [
      ['Two funds amended their LPAs; both changes are cited.', 'p. 14'],
      ['One token changed who controls its treasury.', 'Vote #42'],
      ['Nothing else moved.', '52 read'],
    ],
    hot: 0,
    sources: 'Sources · 5 documents and on-chain · every line cited',
  },
};

const COPY: Record<Desk, Copy> = {
  'private-markets': PM,
  'digital-assets': DA,
  'token-disclosure': TD,
  company: COMPANY,
};

/** The shared window. `on` is the rail item lit for this view. */
const win = (desk: Desk, kind: string, label: string, on: number, crumb: Html, view: Html): Html => html`
<div class="wf wf--${kind} wf--${desk}" role="img" aria-label="${label}">
  <div class="wf__win" aria-hidden="true">
    ${bar(crumb)}
    ${rail(on)}
    <div class="wf__view">${view}</div>
  </div>
</div>`;

const bar = (crumb: Html) =>
  html`<div class="wf__bar"><svg viewBox="0 0 18.3 20.55" fill="currentColor"><path d="${GLYPH}"/></svg><span>${crumb}</span></div>`;
const rail = (on: number) =>
  html`<div class="wf__rail">${[0, 1, 2, 3, 4].map((i) => html`<i class="wf__r${i}${i === on ? ' is-on' : ''}"></i>`)}</div>`;

const chip = (text: string, hot = false) => html`<span class="wf__chip${hot ? ' wf__chip--hot' : ''}">${text}</span>`;

const askView = ({ ask }: Copy) => html`
    <div class="wf__q"><span class="wf__typed"><span>${ask.q}</span></span><span class="wf__send"></span></div>
    <div class="wf__scope">${ask.scope.map((s) => chip(s))}</div>
    <div class="wf__answer">${ask.a.map(
      ([text, cite], i) =>
        html`<div class="wf__arow wf__in wf__d${i + 4}"><p>${text}</p>${chip(cite, i === ask.hot)}</div>`,
    )}</div>
    <p class="wf__foot wf__in wf__d7">${ask.sources}</p>`;

const readView = ({ read, gap }: Copy, missing: boolean) => {
  const doc = missing ? gap : read;
  return html`
    <div class="wf__doc">
      <div class="wf__pages"><i></i><i class="is-on"></i><i></i><i></i></div>
      <div class="wf__page">
        <div class="wf__dochead"><b>${doc.doc}</b><span>${doc.page}</span></div>
        <p class="wf__h">${doc.h}</p>
        ${
          missing
            ? html`<p class="wf__clause">${gap.lead}</p><p class="wf__gap">${gap.item}</p>`
            : html`<p class="wf__clause">${read.before}<mark>${read.hit}</mark>${read.after}</p>`
        }
        <span class="wf__ln"></span><span class="wf__ln"></span><span class="wf__ln wf__ln--s"></span>
        <span class="wf__ln wf__ln--h"></span><span class="wf__ln"></span><span class="wf__ln"></span><span class="wf__ln"></span><span class="wf__ln wf__ln--s"></span>
      </div>
      <div class="wf__margin wf__in wf__d5">${chip(missing ? 'Missing' : `Cited · ${read.page.split(' of ')[0]}`, true)}<p>${missing ? gap.note : read.note}</p></div>
    </div>`;
};

const monitorView = ({ monitor: m }: Copy) => html`
    <div class="wf__head"><b>${m.title}</b><span>${m.sub}</span></div>
    <ul class="wf__table">${m.rows.map(
      ([name, status, date], i) =>
        html`<li class="wf__in wf__l${i + 1}${i === m.rows.length - 1 ? ' is-changed' : ''}"><span>${name}</span><span>${status}</span><span>${date}</span></li>`,
    )}</ul>
    <div class="wf__time">
      <div class="wf__track">${[0, 1, 2, 3, 4, 5, 6].map((i) => html`<i${i === 5 ? html` class="is-flag"` : ''}></i>`)}</div>
      <div class="wf__ticks">${m.ticks.map((t) => html`<span>${t}</span>`)}</div>
    </div>
    <div class="wf__card">
      ${chip('Changed', true)}
      <b>${m.card.title}</b>
      <span class="wf__meta">${m.card.meta}</span>
      <p>${m.card.label} <del>${m.card.from}</del> <ins>${m.card.to}</ins></p>
    </div>`;

const reportView = ({ report: r }: Copy) => html`
    <div class="wf__head"><b>${r.title}</b><span class="wf__btn">Export</span></div>
    <span class="wf__meta">${r.sub}</span>
    <ul class="wf__rep">${r.rows.map(
      ([k, v, src], i) =>
        html`<li class="wf__in wf__l${i + 1}"><span>${k}</span><span>${v}</span>${chip(src, i === r.hot)}</li>`,
    )}</ul>`;

/** A question, and an answer whose every line ends in a citation. */
export const uiAsk = (desk: Desk, label = 'A question asked, and an answer where every line is cited'): Html =>
  win(desk, 'ask', label, 0, html`${COPY[desk].space} › <b>Ask</b>`, askView(COPY[desk]));

/** A document read in full: one passage found (or found missing), cited to its page. */
export const uiRead = (desk: Desk, { missing = false, label = '' } = {}): Html => {
  const c = COPY[desk];
  return win(
    desk,
    'read',
    label ||
      (missing
        ? 'A document read in full, with a missing item flagged'
        : 'A document read in full, with one finding cited to its page'),
    1,
    html`Documents › <b>${(missing ? c.gap : c.read).doc}</b>`,
    readView(c, missing),
  );
};

/** A quiet stream of events, and the one that changed rising out of it. */
export const uiMonitor = (desk: Desk, label = 'Events monitored over time, one change flagged'): Html =>
  win(desk, 'monitor', label, 2, html`Monitoring › <b>${COPY[desk].monitor.title}</b>`, monitorView(COPY[desk]));

/** A report in your own template: every line carries its source. */
export const uiReport = (desk: Desk, label = 'A report built to your template, every line with its source'): Html =>
  win(desk, 'report', label, 3, html`Reports › <b>${COPY[desk].report.title}</b>`, reportView(COPY[desk]));

/** The product film, drawn: ask, the cited answer, the page it came from, the change it
 *  watches for, and the line they add up to. site.js steps through the scenes (data-step)
 *  and holds the scene while the pointer rests on it; without it, or with reduced motion,
 *  the first scene stands. */
export const uiFilm = (
  desk: Desk,
  label = 'A question asked, an answer cited line by line, the source page, a change caught while monitoring: every answer traces back to its page',
): Html => {
  const c = COPY[desk];
  return html`<div class="wf wf--film wf--${desk}" data-film data-step="0" role="img" aria-label="${label}">
  <div class="wf__win" aria-hidden="true">
    ${bar(html`${c.space} › <b class="wf__c0">Ask</b><b class="wf__c1">${c.read.doc}</b><b class="wf__c2">Monitoring</b>`)}
    ${rail(-1)}
    <div class="wf__view wf__scene is-on">${askView(c)}</div>
    <div class="wf__view wf__scene">${readView(c, false)}</div>
    <div class="wf__view wf__scene">${monitorView(c)}</div>
  </div>
  <div class="wf__close" aria-hidden="true"><p>Every answer traces back to its page.</p></div>
</div>`;
};
