// Line illustrations for fact cards: one picture per idea, so a card reads at a glance
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
} as const;

export type Art = keyof typeof ART;

export const art = (name: Art): Html =>
  html`<svg class="art" viewBox="0 0 96 64" width="96" height="64" aria-hidden="true" focusable="false">${raw(ART[name])}</svg>`;
