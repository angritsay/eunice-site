// Line illustrations for fact and client cards: one picture per idea, so a card reads at a glance
// before its words. Drawn on a 96 x 64 canvas in the ink colour (currentColor), 1.5px
// strokes, white fills where shapes overlap, and one soft tint for what matters.
// Decorative: the card's title says the same thing in words. The markup is ours, not
// content, so it goes in raw.

import { type Html, html, raw } from './lib/html.ts';

const ART = {
  /** An audit passed: a shield with a check. */
  shield: `<path d="M48 7 68 14v17c0 13-8.5 21-20 26-11.5-5-20-13-20-26V14Z" class="t"/><path d="m39 31 6.5 6.5L58 25"/>`,
  /** Personal data under an agreement: a document, locked. */
  lock: `<rect x="28" y="7" width="30" height="42" rx="3" fill="#fff"/><path d="M34 17h18M34 24h18M34 31h10"/><rect x="50" y="35" width="22" height="17" rx="3" class="t"/><path d="M55 35v-4a6 6 0 0 1 12 0v4M61 42v4"/>`,
  /** Your documents never flow into a model: document, a crossed path, a model. */
  noTrain: `<rect x="12" y="12" width="26" height="36" rx="3" fill="#fff"/><path d="M18 21h14M18 28h14M18 35h9"/><path d="M42 30h18" stroke-dasharray="3 4"/><path d="m47 25 8 10M55 25l-8 10" class="x"/><circle cx="70" cy="18" r="4.5" class="t"/><circle cx="70" cy="42" r="4.5" class="t"/><circle cx="85" cy="30" r="4.5" class="t"/><path d="M74 20l7 7M74 40l7-7M70 22.5v15"/>`,
  /** A finding cited to its page: a highlighted line with its page tag. */
  cite: `<rect x="22" y="6" width="34" height="46" rx="3" fill="#fff"/><path d="M28 15h22M28 21h22"/><rect x="27" y="25.5" width="24" height="7" rx="2" class="t"/><path d="M28 38h22M28 44h14M51 29h9"/><rect x="60" y="23" width="22" height="12" rx="6" class="f"/>`,
  /** A seed round: a sprout. */
  seed: `<path d="M30 56h36M48 56V32"/><path d="M48 38c-8 0-14-6-14-14 8 0 14 6 14 14Z" class="t"/><path d="M48 32c0-10 7-17 16-17 0 9-7 17-16 17Z" class="t"/>`,
  /** A ranking: a medal on ribbons. */
  award: `<path d="m41 36-5 20 7-4 5 6M55 36l5 20-7-4-5 6"/><circle cx="48" cy="24" r="15" class="t"/><path d="m48 15 2.8 5.7 6.2.9-4.5 4.4 1 6.2-5.5-2.9-5.5 2.9 1-6.2-4.5-4.4 6.2-.9Z" class="f"/>`,
  /** A regulatory sandbox: a token tested inside a fenced space. */
  sandbox: `<rect x="22" y="6" width="52" height="52" rx="7" stroke-dasharray="4 4"/><circle cx="48" cy="32" r="12" class="t"/><circle cx="48" cy="32" r="5.5"/>`,
  /** Many sources, one view: five feeds joining one panel. */
  sources: `<circle cx="16" cy="10" r="3.5"/><circle cx="16" cy="21" r="3.5"/><circle cx="16" cy="32" r="3.5"/><circle cx="16" cy="43" r="3.5"/><circle cx="16" cy="54" r="3.5"/><path d="M20 10c14 0 18 22 34 22M20 21c10 0 16 11 34 11M20 32h34M20 43c10 0 16-11 34-11M20 54c14 0 18-22 34-22"/><rect x="54" y="16" width="28" height="32" rx="3" class="t"/><path d="M60 26h16M60 32h16M60 38h10"/>`,
  /** Several jurisdictions: a globe with marked places. */
  globe: `<circle cx="48" cy="32" r="23" class="t"/><ellipse cx="48" cy="32" rx="10" ry="23"/><path d="M25 32h46M29 20h38M29 44h38"/><circle cx="36" cy="22" r="2.6" class="f"/><circle cx="58" cy="26" r="2.6" class="f"/><circle cx="41" cy="40" r="2.6" class="f"/><circle cx="62" cy="43" r="2.6" class="f"/>`,
  /** A legal review: the scales. */
  legal: `<path d="M48 10v44M38 54h20M26 18h44"/><path d="m26 18-7 15h14Z" class="t"/><path d="m70 18-7 15h14Z" class="t"/><circle cx="48" cy="10" r="2.5" class="f"/>`,
  /** A classification: a document with its label. */
  tag: `<rect x="20" y="8" width="30" height="44" rx="3" fill="#fff"/><path d="M26 18h18M26 25h18M26 32h11"/><path d="M50 28h22l7 8-7 8H50Z" class="t"/><circle cx="56" cy="36" r="2"/>`,
  /** A library of papers: a stack. */
  library: `<rect x="40" y="6" width="30" height="40" rx="3" fill="#fff"/><rect x="34" y="11" width="30" height="40" rx="3" fill="#fff"/><rect x="28" y="16" width="30" height="40" rx="3" class="t"/><path d="M34 26h18M34 33h18M34 40h11"/>`,
  /** A date: a calendar page with the day marked. */
  date: `<rect x="28" y="10" width="40" height="44" rx="4" fill="#fff"/><path d="M28 22h40M38 6v8M58 6v8"/><path d="M36 31h4M46 31h4M56 31h4M36 39h4M56 39h4M36 47h4M46 47h4"/><rect x="44" y="36" width="8" height="7" rx="1.5" class="f"/>`,
  /** Many funds at pace: a stack of papers moving through. */
  pace: `<path d="M14 30h14M18 39h10M14 48h14"/><rect x="50" y="8" width="26" height="34" rx="3" fill="#fff"/><rect x="43" y="15" width="26" height="34" rx="3" fill="#fff"/><rect x="36" y="22" width="26" height="34" rx="3" class="t"/><path d="M42 32h14M42 39h14M42 46h9"/>`,
  /** Close scrutiny of one fund: a document under a lens. */
  scrutiny: `<rect x="22" y="8" width="32" height="44" rx="3" fill="#fff"/><path d="M28 18h20M28 25h20M28 32h12"/><circle cx="58" cy="36" r="12" class="t"/><path d="M52 36h12"/><path d="m66.5 44.5 9 9" class="x"/>`,
  /** Branching out: one stem into three asset classes, the new one marked. */
  branch: `<path d="M48 56V36M48 36c0-10-18-9-18-19M48 36V17M48 36c0-10 18-9 18-19"/><circle cx="30" cy="12" r="5" fill="#fff"/><circle cx="48" cy="12" r="5" fill="#fff"/><circle cx="66" cy="12" r="5" class="t"/><circle cx="48" cy="57" r="3" class="f"/>`,
  /** Reporting to investors: a report with rising bars. */
  report: `<rect x="26" y="6" width="44" height="52" rx="3" fill="#fff"/><path d="M32 15h20M32 21h12M32 50h32"/><rect x="35" y="38" width="6" height="12" rx="1"/><rect x="45" y="32" width="6" height="18" rx="1"/><rect x="55" y="26" width="6" height="24" rx="1" class="t"/>`,
  /** Tenant isolation: each client's data in its own walled space. */
  tenant: `<rect x="12" y="16" width="20" height="32" rx="3" fill="#fff"/><rect x="38" y="16" width="20" height="32" rx="3" class="t"/><rect x="64" y="16" width="20" height="32" rx="3" fill="#fff"/><path d="M17 26h10M17 32h10M43 26h10M43 32h10M69 26h10M69 32h10"/>`,
  /** An audit trail: every action on a line, in order, the latest marked. */
  audit: `<path d="M30 14v28"/><circle cx="30" cy="14" r="3" fill="#fff"/><circle cx="30" cy="28" r="3" fill="#fff"/><circle cx="30" cy="42" r="3" class="f"/><path d="M40 14h28M40 28h22"/><rect x="38" y="37" width="34" height="10" rx="2" class="t"/>`,
  /** Single sign-on: one key opening several apps. */
  sso: `<circle cx="22" cy="32" r="8" class="t"/><path d="M30 32h22M42 32v6M47 32v4M52 32c8 0 8-14 16-14M52 32h16M52 32c8 0 8 14 16 14"/><rect x="68" y="12" width="14" height="12" rx="2" fill="#fff"/><rect x="68" y="26" width="14" height="12" rx="2" fill="#fff"/><rect x="68" y="40" width="14" height="12" rx="2" fill="#fff"/>`,
  /** Role-based access: two people, one with a permission granted. */
  roles: `<circle cx="60" cy="22" r="7" class="t"/><path d="M46 50c0-9 6-14 14-14s14 5 14 14" class="t"/><circle cx="34" cy="22" r="7" fill="#fff"/><path d="M20 50c0-9 6-14 14-14s14 5 14 14" fill="#fff"/><rect x="66" y="40" width="18" height="12" rx="3" fill="#fff"/><path d="m70.5 46 3 3 6-6"/>`,
  /** Delivered end to end: a route from the first step to the finish flag. */
  journey: `<path d="M14 44c14 0 14-20 30-20s16 20 38 20"/><circle cx="14" cy="44" r="4" class="f"/><circle cx="44" cy="24" r="4" fill="#fff"/><path d="M82 44V18"/><path d="M82 18h12l-4 5 4 5H82Z" class="t"/>`,
  /** Human in the loop: a flagged line, and a person who signs it off. */
  review: `<rect x="14" y="10" width="40" height="44" rx="3" fill="#fff"/><path d="M20 20h28M20 27h28M20 45h20"/><rect x="18" y="32" width="32" height="8" rx="2" class="t"/><circle cx="70" cy="26" r="7" fill="#fff"/><path d="M57 54c0-9 6-14 13-14s13 5 13 14"/><circle cx="82" cy="44" r="6" class="t"/><path d="m79 44 2 2 4-4"/>`,
  /** Your framework: settings tuned to your own set-up. */
  framework: `<path d="M20 18h56M20 32h56M20 46h56"/><circle cx="36" cy="18" r="5" fill="#fff"/><circle cx="62" cy="32" r="5" class="t"/><circle cx="44" cy="46" r="5" fill="#fff"/>`,
  /** Alongside, not instead: your system with Eunice beside it. */
  alongside: `<rect x="14" y="14" width="30" height="36" rx="3" fill="#fff"/><path d="M20 24h18M20 31h18M20 38h12M44 32h8"/><rect x="52" y="14" width="30" height="36" rx="3" class="t"/><circle cx="67" cy="32" r="5"/>`,
  /** Minimal work for you: a checklist already ticked. */
  done: `<rect x="26" y="8" width="44" height="48" rx="3" fill="#fff"/><rect x="44" y="40" width="22" height="9" rx="2" class="t"/><path d="m32 20 3 3 5-5M32 32l3 3 5-5M32 44l3 3 5-5M46 21h18M46 33h18M46 45h12"/>`,
  /** Model-agnostic: one task routed to the model that suits it. */
  models: `<rect x="12" y="24" width="18" height="16" rx="3" fill="#fff"/><path d="M30 32h12M42 32c8 0 8-12 16-12M42 32c8 0 8 12 16 12"/><rect x="58" y="12" width="24" height="16" rx="3" class="t"/><rect x="58" y="36" width="24" height="16" rx="3" fill="#fff"/><path d="M64 20h12M64 44h12"/>`,
  /** An exchange: one asset traded for another. */
  exchange: `<circle cx="24" cy="32" r="12" fill="#fff"/><circle cx="72" cy="32" r="12" class="t"/><path d="M40 27h16m-4-4 4 4-4 4M56 37H40m4-4-4 4 4 4"/>`,
  /** A custodian: a vault, its dial set. */
  vault: `<rect x="26" y="10" width="44" height="40" rx="4" fill="#fff"/><circle cx="48" cy="30" r="10" class="t"/><path d="M48 24v12M42 30h12M32 50v5M64 50v5"/>`,
  /** A market maker: both sides of the book, the best quote marked. */
  orderBook: `<path d="M48 10v44"/><rect x="26" y="14" width="18" height="6" rx="1" fill="#fff"/><rect x="18" y="25" width="26" height="6" rx="1" fill="#fff"/><rect x="30" y="36" width="14" height="6" rx="1" fill="#fff"/><rect x="52" y="14" width="22" height="6" rx="1" class="t"/><rect x="52" y="25" width="14" height="6" rx="1" fill="#fff"/><rect x="52" y="36" width="28" height="6" rx="1" fill="#fff"/>`,
  /** A bank: the pediment and its columns. */
  bank: `<path d="M20 24 48 10l28 14Z" class="t"/><path d="M22 24h52M22 50h52M18 55h60M29 28v18M41 28v18M55 28v18M67 28v18"/>`,
  /** Tokenisation: an asset becoming a token. */
  tokenise: `<rect x="12" y="18" width="24" height="32" rx="2" fill="#fff"/><path d="M18 26h4M26 26h4M18 34h4M26 34h4M24 50v-7"/><path d="M42 34h14m-4-4 4 4-4 4"/><circle cx="72" cy="34" r="13" class="t"/><circle cx="72" cy="34" r="6"/>`,
  /** An issuer: a white paper with its seal. */
  issuer: `<rect x="26" y="8" width="34" height="46" rx="3" fill="#fff"/><path d="M32 18h22M32 25h22M32 32h14"/><circle cx="62" cy="44" r="9" class="t"/><path d="m58.5 44 2.5 2.5 5-5"/>`,
} as const;

export type Art = keyof typeof ART;

export const art = (name: Art): Html =>
  html`<svg class="art" viewBox="0 0 96 64" width="96" height="64" aria-hidden="true" focusable="false">${raw(ART[name])}</svg>`;
