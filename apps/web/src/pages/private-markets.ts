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
    ${plate(ctx, { img: 'home-hero.png', alt: 'Pipeline: five funds, one in tracking' })}
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

<section class="band section" id="clients"><div class="wrap">
  <ul class="who">
    <li class="who__intro">
      <p class="kicker desk-text--${DESK}">Who we work with</p>
      <h2 class="h2">Every firm’s needs are different</h2>
      <p class="body muted">Seven kinds of investor, one standard of diligence.</p>
    </li>
    ${CLIENTS.map((c, n) => {
      const inner = html`<span class="who__num">${String(n + 1).padStart(2, '0')}</span>
        <span class="who__title">${c.who}</span>
        <span class="who__line">${c.line}</span>
        <span class="who__needs">${c.needs.map((x) => html`<span>${x}</span>`)}</span>`;
      return c.to
        ? html`<li><a class="who__card who__card--link" href="${ctx.link(c.to)}">${inner}</a></li>`
        : html`<li><div class="who__card">${inner}</div></li>`;
    })}
  </ul>
  <figure class="quoteline who__quote">
    <blockquote>“${quotes.fof.text}”</blockquote>
    <figcaption class="muted">${quotes.fof.who}</figcaption>
  </figure>
</div></section>

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
  visual: plate(ctx, { tint: DESK, html: documentsMock() }),
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
  visual: plate(ctx, { tint: DESK, html: portfolioMock() }),
})}

${feature({
  id: 'data-gaps',
  num: '03',
  title: 'Data gap analysis',
  desk: DESK,
  body: html`<p class="body muted">Every missing document, unanswered question and figure that does not reconcile, surfaced before it becomes a problem. Eunice checks what each manager has given you against what your framework requires, runs a cleaning pass on the data that does not line up, and tracks each gap until it is closed.</p>`,
  visual: plate(ctx, { tint: DESK, html: gapsMock() }),
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

// Stand-ins until the real Documents and Portfolio screenshots are exported.
function documentsMock() {
  const row = (name: string, cat: string, stage: string, date: string, cls = '') =>
    html`<div class="mock__row ${cls}"><span>${name}</span><span>${cat}</span><span class="${stage === 'Monitoring' ? 'ok' : 'blue'}">${stage}</span><span class="faint">${date}</span></div>`;
  const group = (name: string, date: string) =>
    html`<div class="mock__row mock__row--group"><span>${name}</span><span></span><span></span><span class="faint">${date}</span></div>`;
  return html`<div class="mock" role="img" aria-label="Documents view for Gridiron Capital Fund V">
  <div class="mock__bar">${markSmall()}<b>Gridiron Capital Fund V</b><i>Fund</i><i class="warm">Onboarding</i></div>
  <div class="mock__tabs"><span>Overview</span><span class="on">Documents 78</span><span>Reports</span></div>
  <div class="mock__row mock__row--head"><span>Name</span><span>Category</span><span>Stage</span><span>Uploaded</span></div>
  ${group('1. Presentation', 'Sep 26, 2025')}
  ${row('Gridiron Presentation – December 2025.pdf', 'Deck', 'Pre-investment', 'Sep 26, 2025', 'in')}
  ${group('2. Due diligence questionnaire', 'Nov 1, 2025')}
  ${row('Gridiron ILPA Due Diligence Questionnaire.pdf', 'DDQ', 'Pre-investment', 'Nov 1, 2025', 'in')}
  ${group('3. Fund documents', 'Oct 12, 2025')}
  ${row('Gridiron Capital Fund V – LPA.pdf', 'LPA', 'Pre-investment', 'Oct 12, 2025', 'in sel')}
  ${row('Gridiron AGM 2025.pdf', 'AGM', 'Monitoring', 'Mar 4, 2026', 'in')}
  ${group('4. Financial statements', 'Mar 4, 2026')}
</div>`;
}

function portfolioMock() {
  return html`<div class="mock" role="img" aria-label="Portfolio overview">
  <div class="mock__bar">${markSmall()}<b>Portfolio</b></div>
  <div class="mock__tabs"><span class="on">Overview</span><span>Dashboards</span><span>Investments</span><span>Data</span></div>
  <div class="mock__ask"><b>Ask anything about your portfolio</b><span class="mock__input">Type a question, or pick one below</span>
    <span class="mock__chips"><i>Compare TVPI and DPI across active funds</i><i>What changed in the latest quarter?</i></span></div>
  <div class="mock__kpis">
    <span><em>Total NAV</em><b>$91.4M</b></span><span><em>Committed</em><b>$84.8M</b></span>
    <span><em>Net IRR</em><b>21.9%</b></span><span><em>TVPI · DPI</em><b>1.30x · 2.56x</b></span>
  </div>
  <div class="mock__notes"><b>Quarterly updates</b>
    <p><span>Pampas Frontier II</span> · Q2 letter read: two companies re-valued, one covenant waiver disclosed on page 14.</p>
    <p><span>Gridiron Capital Fund V</span> · One figure does not line up with the AGM deck; flagged for the cleaning pass.</p>
  </div>
</div>`;
}

function gapsMock() {
  const row = (item: string, fund: string, status: string, cls: string) =>
    html`<div class="mock__row in"><span>${item}</span><span>${fund}</span><span class="${cls}">${status}</span><span class="faint">Q2 2026</span></div>`;
  return html`<div class="mock" role="img" aria-label="Data gaps across three funds">
  <div class="mock__bar">${markSmall()}<b>Data gaps</b><i>3 open</i></div>
  <div class="mock__row mock__row--head"><span>Item</span><span>Fund</span><span>Status</span><span>Period</span></div>
  ${row('Valuation policy', 'Pampas Frontier II', 'Missing', 'warm')}
  ${row('NAV bridge vs. AGM deck', 'Gridiron Capital Fund V', 'Does not reconcile', 'warm')}
  ${row('DDQ §4.2 key person', 'Northgate Growth III', 'Unanswered', 'blue')}
  ${row('Audited statements 2025', 'Gridiron Capital Fund V', 'Received', 'ok')}
</div>`;
}

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
const CLIENTS: readonly { who: string; line: string; needs: readonly string[]; to?: string }[] = [
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
