import { quotes } from '../content/index.js';
import {
  button, sectionHead, audiences, facts, plate, feature, bullets,
  insightsBlock, eventsBlock, peopleGrid, cta,
} from '../components.js';

const DESK = 'private-markets';

export default {
  slug: DESK,
  nav: DESK,
  title: 'Eunice Private Markets — Operational due diligence, delivered end to end',
  description: 'Eunice reads the dataroom against your ODD checklist, cites every finding to its page and asks the same questions again each quarter.',
  render: (ctx) => `
<section class="wrap hero hero--pm">
  <div class="hero__text">
    <p class="kicker desk-text--${DESK}">For LPs, asset owners, fund managers and family offices</p>
    <h1 class="h1">Operational due diligence, delivered end to end</h1>
    <p class="lead">Eunice reads the dataroom against your ODD checklist, cites every finding to its page and asks the same questions again each quarter. Our team runs the process with you.</p>
    <p class="lead">Eunice was built in London, the city that invented the modern investment fund, pioneered institutional venture capital, and wrote the rules of underwriting syndication the industry still runs on. We hold ourselves to the same standard the world now measures private markets by.</p>
    <div class="buttons">
      ${button(ctx, { label: 'Talk to us', talk: DESK })}
      ${button(ctx, { label: 'How it works', kind: 'outline', to: DESK, hash: 'odd' })}
    </div>
  </div>
  <div class="hero__visual hero__visual--stacked">
    <div class="photo photo--city" role="img" aria-label="Aerial photograph of the City of London"><span>City of London, aerial</span></div>
    ${plate(ctx, { img: 'home-hero.png', alt: 'Pipeline: five funds, one in tracking' })}
  </div>
</section>

<p class="trustline">Trusted by asset allocators managing over $1 trillion in AUM</p>

<section class="wrap section" id="who">
  ${sectionHead('Who we build for', 'Pick the one that sounds like your week.')}
  ${audiences(ctx, [
    { id: 'lps', desk: DESK, title: 'LPs and asset owners', text: 'Ten fund documents, one committee, and a question you have to answer by Thursday.' },
    { id: 'managers', desk: DESK, title: 'Fund managers', text: 'The same ODD questionnaire, asked eleven ways, by eleven different LPs.' },
    { id: 'family-offices', desk: DESK, title: 'Family offices', text: 'Enable you to do more with a lean team.' },
    { id: 'consultants', desk: DESK, title: 'Investment consultants', text: 'Twenty managers to compare on terms that were never written the same way.' },
  ])}
  <figure class="quoteline">
    <blockquote>“${quotes.fof.text}”</blockquote>
    <figcaption class="muted">${quotes.fof.who}</figcaption>
  </figure>
</section>

<section class="wrap section split">
  <div class="photo photo--mayfair" role="img" aria-label="Aerial photograph of Mayfair"><span>Mayfair, aerial</span></div>
  ${facts([
    { title: 'SOC 2 Type II', text: 'Audited; the report is available on request' },
    { title: 'GDPR', text: 'Compliant, with a data processing agreement for every engagement' },
    { title: 'No training on your data', text: 'Your documents are never used to train models. They stay yours.' },
    { title: 'Every finding', text: 'Cited to the page it came from' },
  ], 2)}
</section>

${feature({
  id: 'odd', num: '01', title: 'Operational due diligence', desk: DESK,
  body: '<p class="body muted">Every PPM, DDQ, LPA, valuation policy and audited statement read against the ODD checklist you already use. What is missing is the finding, not what is present, and every finding cites its page.</p>',
  visual: plate(ctx, { tint: DESK, html: documentsMock() }),
})}

${feature({
  id: 'monitoring', num: '02', title: 'Portfolio monitoring', desk: DESK, flip: true,
  body: `<p class="body muted">The same questions asked again each quarter, or as often as it suits your workflow, across every fund you hold.</p>
  ${bullets([
    'Combination of qualitative and quantitative data in one place.',
    'Ask across the portfolio: one question, every fund, every document, answered with the page it came from.',
    'Eunice catches the data that doesn’t line up and runs a cleaning pass before you ever touch it.',
  ])}`,
  visual: plate(ctx, { tint: DESK, html: portfolioMock() }),
})}

${feature({
  id: 'end-to-end', num: '03', title: 'Delivered end to end', desk: DESK,
  body: '<p class="body muted">From pipeline, investment and operational due diligence, through to live deals, portfolio monitoring and bespoke reporting as well as integrations, we are experienced in implementing seamless onboardings. We will partner with you end to end, keeping the framework current and clearing every data gap along the way.</p>',
  visual: `<ol class="steps steps--${DESK}">
    <li><span class="h4">Scope</span><span class="small muted">Your checklist, your funds, your committee calendar.</span></li>
    <li><span class="h4">Read</span><span class="small muted">The dataroom read in full, every finding cited to its page.</span></li>
    <li><span class="h4">Review</span><span class="small muted">Findings walked through with your committee; the memo signed off by you.</span></li>
    <li><span class="h4">Monitor</span><span class="small muted">The same questions asked again each quarter. Changes come back as a diff.</span></li>
  </ol>`,
})}

${insightsBlock(ctx, {
  label: 'Insights for private markets', aside: 'Written by the people who run the desk.',
  deskFilter: [DESK], featured: 1, rows: 2,
  // Wording pending from Petronela (22 Sep 2026).
  override: { title: '[Note title — wording to follow]', standfirst: '[Two or three lines — wording to follow]', placeholder: true },
})}

<section class="wrap section" id="team">
  ${sectionHead('Leadership', 'The people who run the desk, and the company.')}
  ${peopleGrid(ctx, ['petronela', 'yi', 'philip', 'chrislyn'])}
</section>

${eventsBlock(ctx, { label: 'Events', aside: 'Where the desk will be, and where it has been.', desk: DESK, today: ctx.today })}

${cta(ctx, {
  title: 'Talk to us about the fund you are reviewing now',
  text: 'A thirty-minute call with the desk. Bring the fund; we show you what Eunice reads, what it returns and how the quarterly cycle runs.',
  buttons: [{ label: 'Talk to us', kind: 'light', talk: DESK }],
})}`,
};

// Stand-ins until the real Documents and Portfolio screenshots are exported.
function documentsMock() {
  const row = (name, cat, stage, date, cls = '') =>
    `<div class="mock__row ${cls}"><span>${name}</span><span>${cat}</span><span class="${stage === 'Monitoring' ? 'ok' : 'blue'}">${stage}</span><span class="faint">${date}</span></div>`;
  const group = (name, date) => `<div class="mock__row mock__row--group"><span>${name}</span><span></span><span></span><span class="faint">${date}</span></div>`;
  return `<div class="mock" aria-label="Documents view for Gridiron Capital Fund V">
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
  return `<div class="mock" aria-label="Portfolio overview">
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

const markSmall = () => '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#f08a4b" stroke-width="2.8" stroke-linejoin="round" stroke-linecap="round" aria-hidden="true"><path d="M19.5 7 12 2.8 4.5 7v10l7.5 4.2 7.5-4.2"/><path d="M9 12h7.5"/></svg>';
