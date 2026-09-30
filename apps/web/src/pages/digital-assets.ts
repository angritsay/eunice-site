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
  title: 'Crypto & RWA — Eunice',
  description:
    'Token due diligence in the format your risk committee already uses, and monitoring that reaches you before the trade press does.',
  render: (ctx) => html`
<section class="wrap hero">
  <div class="hero__text">
    <p class="kicker desk-text--${DESK}">For exchanges, custodians, market makers and issuers</p>
    <h1 class="h1">Crypto &amp; RWA</h1>
    <p class="lead">Token due diligence in the format your risk committee already uses, and monitoring that reaches you before the trade press does.</p>
    <div class="buttons">
      ${button(ctx, { label: 'Book demo', form: DESK, placement: 'hero' })}
      ${button(ctx, { label: 'Who we work with', kind: 'outline', to: DESK, hash: 'clients' })}
    </div>
  </div>
  ${heroField({ desk: DESK })}
</section>

${whoCards(ctx, {
  desk: DESK,
  kicker: 'Who we work with',
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

<section class="wrap section">
  ${partnersRow(ctx)}
  <div class="grid grid--3 quotes">${quoteBlock(quotes.falconx)}${quoteBlock(quotes.zodia)}${quoteBlock(quotes.libeara)}</div>
</section>

<section class="wrap section section--tight">
  ${facts([
    { title: 'FCA regulatory sandbox', text: 'Digital asset disclosure standards, since November 2025' },
    { title: 'SOC 2 Type II', text: 'Audited; GDPR compliant' },
    { title: 'Five sources, one view', text: 'Allium, CoinGecko, CoinMarketCap, DeFiLlama and X, cited by name' },
    { title: '4 jurisdictions', text: 'MiCA, the UK regime, MAS and VARA' },
  ])}
</section>

${feature({
  id: 'listing',
  num: '01',
  title: 'Listing diligence',
  desk: DESK,
  body: html`<p class="body muted">One report per asset covering the team, the code, the reserve and the jurisdiction, in the shape a listing committee signs off.</p>`,
  visual: plate(ctx, { tint: DESK, html: uiRead(DESK) }),
})}

${feature({
  id: 'monitoring',
  num: '02',
  title: 'Monitoring that does not sleep',
  desk: DESK,
  flip: true,
  body: html`<p class="body muted">Exploits, protocol changes, enforcement actions and reserve movements — surfaced the hour they land, with the source attached.</p>`,
  visual: plate(ctx, { tint: DESK, html: uiMonitor(DESK) }),
})}

${feature({
  id: 'jurisdictions',
  num: '03',
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
  aside: 'Exploits, risk and regulation, as they happen.',
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
  title: 'Put one asset through it',
  text: 'Pick a token you are reviewing now. We will run it and show you the report and the monitoring feed side by side.',
  buttons: [
    { label: 'See a sample report', kind: 'outline-light', form: 'sample-report' },
    { label: 'Book demo', kind: 'light', form: DESK },
  ],
})}`,
} satisfies Page;
