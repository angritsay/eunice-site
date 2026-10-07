import {
  audienceLine,
  button,
  cta,
  eventsBlock,
  facts,
  feature,
  heroField,
  insightsBlock,
  mark,
  partnersRow,
  peopleStrip,
  plate,
  quoteBlock,
  sectionHead,
  whoCards,
} from '../components.ts';
import { quotes } from '../content/index.ts';
import { html } from '../lib/html.ts';
import type { Page } from '../lib/types.ts';
import { uiMonitor, uiRead, uiReport } from '../ui.ts';

const DESK = 'digital-assets';

export default {
  slug: DESK,
  nav: DESK,
  title: 'Digital Assets — Eunice',
  description:
    'Token due diligence in the format your risk committee already uses, and monitoring that surfaces what changes the same day, with the source attached.',
  render: (ctx) => html`
<section class="wrap hero">
  <div class="hero__text">
    <h1 class="h1">Digital Assets</h1>
    <p class="lead">Token due diligence in the format your risk committee already uses, and monitoring that surfaces what changes the same day, with the source attached.</p>
    <div class="buttons">
      ${button(ctx, { label: 'Book demo', form: DESK, placement: 'hero' })}
      ${button(ctx, { label: 'Who we work with', kind: 'outline', to: DESK, hash: 'working-with' })}
    </div>
  </div>
  ${heroField({ desk: DESK })}
</section>

${whoCards(ctx, {
  desk: DESK,
  title: 'One desk for listing, holding and trading',
  lead: 'And for the issuers whose disclosures they read.',
  clients: [
    {
      who: 'Exchanges',
      line: audienceLine(DESK, 'exchanges'),
      needs: ['Listing diligence', 'Committee-ready reports'],
      to: `${DESK}/exchanges`,
    },
    {
      who: 'Custodians',
      line: audienceLine(DESK, 'custodians'),
      needs: ['Live risk events', 'Reserve movements'],
      to: `${DESK}/custodians`,
    },
    {
      who: 'Market makers',
      line: audienceLine(DESK, 'market-makers'),
      needs: ['Disclosure changes', 'Monitoring'],
      to: `${DESK}/market-makers`,
    },
    {
      who: 'Issuers and counsel',
      line: audienceLine('token-disclosure', 'issuers'),
      needs: ['MiCA white paper', 'UK token classification'],
      to: 'token-disclosure',
    },
  ],
})}

<section class="wrap section" id="working-with">
  ${partnersRow(ctx)}
  <div class="grid grid--3 quotes">${quoteBlock(quotes.falconx)}${quoteBlock(quotes.zodia)}${quoteBlock(quotes.libeara)}</div>
</section>

<section class="wrap section section--tight">
  ${facts([
    {
      art: 'sandbox',
      title: 'FCA Regulatory Sandbox',
      text: 'Participant since November 2025, testing disclosure standards',
    },
    { art: 'shield', title: 'SOC 2 Type II', text: 'Audited; GDPR compliant' },
    { art: 'cite', title: 'Every claim', text: 'Cited to the source it came from' },
    { art: 'globe', title: '4 jurisdictions', text: 'MiCA, the UK regime, MAS and VARA' },
  ])}
</section>

${feature({
  id: 'listing',
  title: 'Listing diligence',
  desk: DESK,
  body: html`<p class="body muted">One report per token covering the team, the code, the reserve where there is one, and the jurisdiction, in the shape a listing committee signs off on.</p>`,
  visual: plate(ctx, { tint: DESK, html: uiRead(DESK) }),
})}

${feature({
  id: 'monitoring',
  title: 'Continuous monitoring',
  desk: DESK,
  flip: true,
  body: html`<p class="body muted">Exploits, protocol changes, enforcement actions and reserve movements, surfaced the same day, with the source attached. Drawn from Allium, CoinGecko, CoinMarketCap, DeFiLlama and X, each cited by name.</p>`,
  visual: plate(ctx, { tint: DESK, html: uiMonitor(DESK) }),
})}

${feature({
  id: 'jurisdictions',
  title: 'Jurisdiction by jurisdiction',
  desk: DESK,
  body: html`<p class="body muted">MiCA, the UK regime, MAS and VARA in one view, so an asset cleared in one place is not re-cleared from scratch in another.</p>`,
  visual: plate(ctx, { tint: DESK, html: uiReport(DESK) }),
})}

<section class="band band--td section" id="token-disclosure"><div class="wrap feature feature--flat">
  <div class="feature__text">
    <h2 class="h2 td-title">${mark(21, '#b27a14')}Token Disclosure</h2>
    <p class="body">The other side of the desk: a MiCA white paper drafted from 1,000+ pre-filled papers, reviewed by CMS and published where any exchange can check it.</p>
    <div class="buttons">
      ${button(ctx, { label: 'See Token Disclosure', to: 'token-disclosure' })}
      ${button(ctx, { label: 'Start a white paper', kind: 'outline', form: 'token-disclosure', placement: 'band' })}
    </div>
  </div>
  <div class="feature__visual">${plate(ctx, { tint: DESK, html: uiReport('token-disclosure') })}</div>
</div></section>

${insightsBlock(ctx, {
  label: 'Insights on digital assets',
  aside: 'Exploits, risk and regulation.',
  deskFilter: [DESK, 'token-disclosure'],
  featured: 3,
  rows: 4,
  band: false,
})}

<section class="wrap section" id="team">
  ${sectionHead('The desk', 'Who runs digital assets, from listing reviews to the FCA sandbox.')}
  ${peopleStrip(ctx, ['yi', 'philip', 'chrislyn', 'riley'])}
</section>

${eventsBlock(ctx, { label: 'Where we have been', aside: 'Talks, panels and delegations.', desk: DESK, today: ctx.today })}

${cta(ctx, {
  title: 'Put one token through it',
  text: 'Pick a token you are reviewing now. We will run it and show you the report and the monitoring feed side by side.',
  buttons: [
    { label: 'See a sample report', kind: 'outline-light', form: 'sample-report' },
    { label: 'Book demo', kind: 'light', form: DESK },
  ],
})}`,
} satisfies Page;
