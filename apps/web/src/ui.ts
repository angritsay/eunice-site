// Conceptual product UI, drawn in HTML: the ideas behind Eunice (read, cite, monitor,
// report, ask), not screenshots of today's screens. No fund names, figures or real
// layouts, so nothing here goes stale when the product changes, and nothing hands a
// competitor a walkthrough. Monochrome; the one element that matters carries the
// desk's colour hint. Motion is CSS only and stops under prefers-reduced-motion.

import { type Html, html } from './lib/html.ts';
import type { Desk } from './lib/types.ts';

const lines = (n: number, cls = '') =>
  html`${Array.from({ length: n }, () => html`<span class="wf__line${cls}"></span>`)}`;

/** A document read in full: one line found (or found missing), cited to its page. */
export const uiRead = (desk: Desk, { missing = false, label = '' } = {}): Html => html`
<div class="wf wf--read wf--${desk}" role="img" aria-label="${label || (missing ? 'A document read in full, with a missing item flagged' : 'A document read in full, with one finding cited to its page')}">
  <span class="wf__sheet wf__sheet--b2"></span><span class="wf__sheet wf__sheet--b1"></span>
  <span class="wf__sheet">
    <span class="wf__head"></span>
    ${lines(3)}
    ${
      missing
        ? html`<span class="wf__line wf__line--gap"><span class="wf__chip">Missing</span></span>`
        : html`<span class="wf__line wf__line--hit"><span class="wf__chip">p. 14</span></span>`
    }
    ${lines(2)}<span class="wf__line wf__line--short"></span>
  </span>
</div>`;

/** A quiet stream of events, and the one that changed rising out of it. */
export const uiMonitor = (desk: Desk, label = 'Events monitored over time, one change flagged'): Html => html`
<div class="wf wf--monitor wf--${desk}" role="img" aria-label="${label}">
  <span class="wf__panel">
    <span class="wf__card"><span class="wf__chip">Changed</span>${lines(1)}<span class="wf__line wf__line--short"></span></span>
    <span class="wf__track">${Array.from({ length: 9 }, (_, i) => html`<span class="wf__dot${i === 6 ? ' wf__dot--flag' : ''}"></span>`)}</span>
    <span class="wf__rows">${lines(2)}<span class="wf__line wf__line--short"></span></span>
  </span>
</div>`;

/** A report in your own template: every line carries its source. */
export const uiReport = (
  desk: Desk,
  label = 'A report built to your template, every line with its source',
): Html => html`
<div class="wf wf--report wf--${desk}" role="img" aria-label="${label}">
  <span class="wf__sheet">
    <span class="wf__head"></span>
    ${Array.from({ length: 6 }, (_, i) => html`<span class="wf__row"><span class="wf__line${i % 2 ? ' wf__line--short' : ''}"></span><span class="wf__src"></span></span>`)}
  </span>
</div>`;

/** A question, and an answer whose every line ends in a citation. */
export const uiAsk = (desk: Desk, label = 'A question asked, and an answer where every line is cited'): Html => html`
<div class="wf wf--ask wf--${desk}" role="img" aria-label="${label}">
  <span class="wf__panel">
    <span class="wf__q"><span class="wf__line wf__line--short"></span><span class="wf__send"></span></span>
    <span class="wf__a">${Array.from({ length: 4 }, (_, i) => html`<span class="wf__row"><span class="wf__line${i === 3 ? ' wf__line--short' : ''}"></span><span class="wf__cite"></span></span>`)}</span>
  </span>
</div>`;
