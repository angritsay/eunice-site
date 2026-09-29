import {
  bullets,
  button,
  cta,
  eventsBlock,
  facts,
  feature,
  insightsBlock,
  mark,
  peopleStrip,
  photo,
  plate,
  sectionHead,
  type WhoClient,
  whoCards,
} from '../components.ts';
import { quotes } from '../content/index.ts';
import { html } from '../lib/html.ts';
import type { Page } from '../lib/types.ts';

const DESK = 'private-markets';

export default {
  slug: DESK,
  nav: DESK,
  title: 'Private market tools — Eunice',
  description:
    'Operational due diligence, portfolio monitoring, data gap analysis and bespoke reporting for LPs, GPs, family offices and consultants.',
  render: (ctx) => html`
<section class="wrap hero hero--pm">
  <div class="hero__text">
    <p class="kicker desk-text--${DESK}">For LPs, GPs, family offices and consultants</p>
    <h1 class="h1">Private market tools</h1>
    <p class="lead">Technology for private markets investors, with the training, implementation and support to go with it.</p>
    <div class="buttons">
      ${button(ctx, { label: 'Book demo', form: DESK, placement: 'hero' })}
      ${button(ctx, { label: 'Who we work with', kind: 'outline', to: DESK, hash: 'clients' })}
    </div>
  </div>
  <div class="hero__visual hero__visual--stacked">
    ${photo(ctx, { img: 'city-of-london.jpg', variant: 'city', alt: 'The City of London at dusk, looking along the Thames to St Paul’s' })}
    ${plate(ctx, { img: 'home-hero.png', alt: 'The Eunice pipeline: funds and managers under review' })}
  </div>
</section>

<p class="trustline">Trusted by asset allocators managing over $1 trillion in AUM</p>

<section class="wrap section" id="approach">
  <div class="approach">
    <div class="approach__item">
      <p class="approach__num">01</p>
      <h2 class="h3">Every firm’s needs are different</h2>
      <p class="body muted">The investment profession has a very specific need for technology infrastructure and it is not spared trends when it comes to ways of thinking and best practices. See our blogs below drawing on research on these contrasting views. From in house built to outsourced technology, every firm’s needs are different and we support clients with a variety of needs.</p>
    </div>
    <div class="approach__item">
      <p class="approach__num">02</p>
      <h2 class="h3">Ready to onboard you now</h2>
      <p class="body muted">We are ready to onboard you now and we carry out all training, implementation and handholding required. Chances are your competitors are already using Eunice. We are designed to build your competitive advantage further and to illustrate it more transparently to your Board, your Investment Committee or your clients or ultimate beneficiaries.</p>
    </div>
    <div class="approach__item">
      <p class="approach__num">03</p>
      <h2 class="h3">Raising the standard</h2>
      <p class="body muted">In an ecosystem where the investment opportunities best suited to your investment style or to your clients leads to a healthier and more prosperous market overall and we are proud to contribute to improving investing best practices. As such, we remain engaged with the main industry trade bodies to ensure our tools are continuously updated to meet the highest standards solving pain points experienced by investors in private assets today as well as those on the verge of crystallising tomorrow.</p>
    </div>
  </div>
</section>

${whoCards(ctx, {
  desk: DESK,
  kicker: 'Who we work with',
  title: 'Every firm’s needs are different',
  lead: 'Seven kinds of investor, one standard of diligence.',
  clients: CLIENTS,
})}

<section class="wrap section section--tight">
  <figure class="quoteline">
    <blockquote>“${quotes.fof.text}”</blockquote>
    <figcaption class="muted">${quotes.fof.who}</figcaption>
  </figure>
</section>

<section class="wrap section split">
  ${photo(ctx, { img: 'mayfair.jpg', variant: 'mayfair', alt: 'A Mayfair street corner after rain' })}
  ${facts(
    [
      { title: 'SOC 2 Type II', text: 'Audited; the report is available on request' },
      { title: 'GDPR', text: 'Compliant, with a data processing agreement for every engagement' },
      { title: 'No training on your data', text: 'Your documents are never used to train models. They stay yours.' },
      { title: 'Every finding', text: 'Cited to the page it came from' },
    ],
    2,
  )}
</section>

${feature({
  id: 'odd',
  num: '01',
  title: 'Operational due diligence',
  desk: DESK,
  body: html`<p class="body muted">Every PPM, DDQ, LPA, valuation policy and audited statement read against the ODD checklist you already use. What is missing is the finding, not what is present, and every finding cites its page.</p>`,
  visual: plate(ctx, {
    tint: DESK,
    img: 'pm-documents.png',
    alt: 'Documents for a fund, grouped by folder, with category, stage and dates',
  }),
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
  visual: plate(ctx, {
    tint: DESK,
    img: 'pm-portfolio.png',
    alt: 'Portfolio overview: ask anything, key metrics and quarterly updates',
  }),
})}

${feature({
  id: 'data-gaps',
  num: '03',
  title: 'Data gap analysis',
  desk: DESK,
  body: html`<p class="body muted">Every missing document, unanswered question and figure that does not reconcile, surfaced before it becomes a problem. Eunice checks what each manager has given you against what your framework requires, runs a cleaning pass on the data that does not line up, and tracks each gap until it is closed.</p>`,
  visual: plate(ctx, {
    tint: DESK,
    img: 'pm-gaps.png',
    alt: 'A data gap analysis for a fund, every gap cited to its page',
  }),
})}

${feature({
  id: 'reporting',
  num: '04',
  title: 'Bespoke reporting',
  desk: DESK,
  flip: true,
  body: html`<p class="body muted">Reports for your Board, your Investment Committee, your clients or ultimate beneficiaries, built to your template. Every figure and every claim traces back to the document and page it came from, so each report can be defended line by line.</p>`,
  visual: plate(ctx, { tint: DESK, html: reportMock() }),
})}

${feature({
  id: 'end-to-end',
  num: '05',
  title: 'Delivered end to end',
  desk: DESK,
  body: html`<p class="body muted">From pipeline, investment and operational due diligence, through to live deals, portfolio monitoring and bespoke reporting as well as integrations, we are experienced in implementing seamless onboardings. We will partner with you end to end, keeping the framework current and clearing every data gap along the way.</p>`,
  visual: html`<ol class="steps steps--${DESK}">
    <li><span class="h4">Scope</span><span class="small muted">Your checklist, your funds, your committee calendar.</span></li>
    <li><span class="h4">Read</span><span class="small muted">The dataroom read in full, every finding cited to its page.</span></li>
    <li><span class="h4">Review</span><span class="small muted">Findings walked through with your committee; the memo signed off by you.</span></li>
    <li><span class="h4">Monitor</span><span class="small muted">The same questions asked again each quarter. Changes come back as a diff.</span></li>
  </ol>`,
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
function reportMock() {
  return html`<div class="mock" role="img" aria-label="A quarterly report for an investment committee, every line cited">
  <div class="mock__bar">${markSmall()}<b>Investment Committee · Q2 2026</b><i>Your template</i></div>
  <div class="mock__notes"><b>Portfolio summary</b>
    <p><span>Net IRR 21.9%</span> · Gridiron Q2 report, p. 3</p>
    <p><span>One covenant waiver</span> · Pampas Frontier II Q2 letter, p. 14</p>
    <p><span>Key person change</span> · Northgate Growth III notice, p. 1</p>
  </div>
</div>`;
}

const markSmall = () => mark(11, '#f08a4b');

// Who the private market tools are for: the owner's seven client types, each cut to
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
  {
    who: 'Investment consultants',
    line: 'Fast turnaround analysis that is fully auditable.',
    needs: ['Every claim source-traceable', 'Sliced and diced live'],
    to: `${DESK}/consultants`,
  },
  {
    who: 'Technology consultants',
    line: 'Technology for faster investment decisions, in a unified way.',
    needs: ['Wraps around existing operating models and processes'],
  },
  {
    who: 'Specialist investors',
    line: 'A niche in sustainability or another domain of expertise.',
    needs: ['Highly customised workflows and reporting'],
  },
];
