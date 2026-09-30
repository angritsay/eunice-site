import {
  bullets,
  button,
  cta,
  eventsBlock,
  facts,
  feature,
  heroField,
  insightsBlock,
  peopleStrip,
  plate,
  sectionHead,
  stage,
  type WhoClient,
  whoCards,
} from '../components.ts';
import { quotes } from '../content/index.ts';
import { html } from '../lib/html.ts';
import type { Page } from '../lib/types.ts';
import { uiMonitor, uiRead, uiReport } from '../ui.ts';

const DESK = 'private-markets';

export default {
  slug: DESK,
  nav: DESK,
  title: 'Private Markets — Eunice',
  description:
    'Operational due diligence, portfolio monitoring, data gap analysis and bespoke reporting for LPs, GPs and family offices.',
  render: (ctx) => html`
<section class="wrap hero hero--pm">
  <div class="hero__text">
    <p class="kicker desk-text--${DESK}">For LPs, GPs and family offices</p>
    <h1 class="h1">Private Markets</h1>
    <p class="lead">Technology for private markets investors, with the training, implementation and support to go with it.</p>
    <div class="buttons">
      ${button(ctx, { label: 'Book demo', form: DESK, placement: 'hero' })}
      ${button(ctx, { label: 'Who we work with', kind: 'outline', to: DESK, hash: 'clients' })}
    </div>
  </div>
  ${heroField(ctx, { desk: DESK })}
</section>

<p class="trustline">Trusted by asset allocators managing over $1 trillion in AUM</p>

<section class="wrap section" id="approach">
  <div class="approach">
    <div class="approach__item">
      <p class="approach__num">01</p>
      <h2 class="h3">Every firm’s needs are different</h2>
      <p class="body muted">In-house or outsourced, every firm runs diligence its own way. Eunice fits around yours.</p>
    </div>
    <div class="approach__item">
      <p class="approach__num">02</p>
      <h2 class="h3">Ready to onboard you now</h2>
      <p class="body muted">We run the training, implementation and hand-holding. Your Board, Investment Committee and clients see the edge it gives you.</p>
    </div>
    <div class="approach__item">
      <p class="approach__num">03</p>
      <h2 class="h3">Raising the standard</h2>
      <p class="body muted">We work with the industry’s trade bodies, so the tools keep pace with today’s standards and tomorrow’s.</p>
    </div>
  </div>
</section>

${whoCards(ctx, {
  desk: DESK,
  kicker: 'Who we work with',
  title: 'Every firm’s needs are different',
  lead: 'Three kinds of investor, one standard of diligence.',
  clients: CLIENTS,
})}

<section class="wrap section section--tight">
  <figure class="quoteline">
    <blockquote>“${quotes.fof.text}”</blockquote>
    <figcaption class="muted">${quotes.fof.who}</figcaption>
  </figure>
</section>

<section class="wrap section">
  ${facts([
    { title: 'SOC 2 Type II', text: 'Audited; the report is available on request' },
    { title: 'GDPR', text: 'Compliant, with a data processing agreement for every engagement' },
    { title: 'No training on your data', text: 'Your documents are never used to train models. They stay yours.' },
    { title: 'Every finding', text: 'Cited to the page it came from' },
  ])}
</section>

${feature({
  id: 'odd',
  num: '01',
  title: 'Operational due diligence',
  desk: DESK,
  body: html`<p class="body muted">Every PPM, DDQ, LPA and audited statement, read against the ODD checklist you already use. Every finding cites its page.</p>`,
  visual: plate(ctx, { tint: DESK, html: uiRead(DESK) }),
})}

${feature({
  id: 'monitoring',
  num: '02',
  title: 'Portfolio monitoring',
  desk: DESK,
  flip: true,
  body: html`<p class="body muted">The same questions asked again each quarter, or as often as it suits your workflow, across every fund you hold.</p>
  ${bullets([
    'Combination of qualitative and quantitative data in one place.',
    'Ask across the portfolio: one question, every fund, every document, answered with the page it came from.',
    'Eunice catches the data that doesn’t line up and runs a cleaning pass before you ever touch it.',
  ])}`,
  visual: plate(ctx, { tint: DESK, html: uiMonitor(DESK) }),
})}

${feature({
  id: 'data-gaps',
  num: '03',
  title: 'Data gap analysis',
  desk: DESK,
  body: html`<p class="body muted">Missing documents, unanswered questions and figures that don’t reconcile, surfaced before they become problems and tracked until closed.</p>`,
  visual: plate(ctx, { tint: DESK, html: uiRead(DESK, { missing: true }) }),
})}

${feature({
  id: 'reporting',
  num: '04',
  title: 'Bespoke reporting',
  desk: DESK,
  flip: true,
  body: html`<p class="body muted">Reports for your Board, committee or clients, built to your template. Every figure traces back to its page.</p>`,
  visual: plate(ctx, { tint: DESK, html: uiReport(DESK) }),
})}

${feature({
  id: 'end-to-end',
  num: '05',
  title: 'Delivered end to end',
  desk: DESK,
  body: html`<p class="body muted">From pipeline to portfolio, we onboard you and stay alongside: the framework kept current, every data gap cleared.</p>`,
  visual: html`<ol class="steps steps--${DESK}">
    <li><span class="h4">Scope</span><span class="small muted">Your checklist, your funds, your committee calendar.</span></li>
    <li><span class="h4">Read</span><span class="small muted">The dataroom read in full, every finding cited to its page.</span></li>
    <li><span class="h4">Review</span><span class="small muted">Findings walked through with your committee; the memo signed off by you.</span></li>
    <li><span class="h4">Monitor</span><span class="small muted">The same questions asked again each quarter. Changes come back as a diff.</span></li>
  </ol>`,
  stage: stage(ctx, {
    photo: 'art-water.jpg',
    video: 'home-hero',
    img: 'home-hero-poster.jpg',
    alt: 'A walk through Eunice: files, the pipeline, live deals and a fund’s due diligence report',
  }),
})}

${insightsBlock(ctx, {
  label: 'From our blog',
  aside: 'Research and news from Eunice.',
  deskFilter: [DESK, 'company'],
  featured: 1,
  rows: 2,
})}

<section class="wrap section" id="team">
  ${sectionHead('The desk', 'Who runs private markets, and who builds what it runs on.')}
  ${peopleStrip(ctx, ['petronela', 'yi', 'philip', 'vinay'])}
</section>

${eventsBlock(ctx, { label: 'Events', aside: 'Where the desk will be, and where it has been.', desk: DESK, today: ctx.today })}

${cta(ctx, {
  title: 'Talk to us about the fund you are reviewing now',
  text: 'A thirty-minute call with the desk. Bring the fund; we show you what Eunice reads, what it returns and how the quarterly cycle runs.',
  buttons: [{ label: 'Book demo', kind: 'light', form: DESK }],
})}`,
} satisfies Page;

// Figma has no reporting screen yet, so this one stays a drawn stand-in.

// Who Private Markets is for: the three client types we serve now, each cut to
// a line and the needs it names. Where a client-type page matches, the card links to it.
const CLIENTS: readonly WhoClient[] = [
  {
    who: 'High-activity asset allocators',
    line: 'High levels of dealmaking, large numbers of funds and managers.',
    needs: ['Fast-paced due diligence', 'Portfolio monitoring at scale'],
    to: `${DESK}/lps`,
  },
  {
    who: 'Focused asset allocators',
    line: 'Smaller size and lower deal activity, but higher levels of scrutiny.',
    needs: ['On-the-ground operational due diligence', 'Sophisticated portfolio management'],
    to: `${DESK}/lps`,
  },
  {
    who: 'Family offices',
    line: 'Lean teams with ambitious goals, branching out into new asset classes.',
    needs: ['Generalist expertise', 'The fundamentals of each private asset class'],
    to: `${DESK}/family-offices`,
  },
  {
    who: 'General Partners',
    line: 'Private assets funds and separately managed accounts.',
    needs: [
      'Liquidity tools for evergreen funds',
      'Scenario analysis and forecasting',
      'Bespoke LP reporting',
      'Opportunity scoring and style filters',
    ],
    to: `${DESK}/managers`,
  },
];
