import {
  audienceCards,
  audiences,
  button,
  cta,
  eventsBlock,
  facts,
  feature,
  insightsBlock,
  mark,
  partnersRow,
  plate,
  quoteBlock,
  sectionHead,
} from '../components.ts';
import { quotes } from '../content/index.ts';
import { html } from '../lib/html.ts';
import type { Page } from '../lib/types.ts';

const DESK = 'digital-assets';

export default {
  slug: DESK,
  nav: DESK,
  title: 'Eunice Digital Assets — End to end listing',
  description:
    'Token due diligence in the format your risk committee already uses, and monitoring that reaches you before the trade press does.',
  render: (ctx) => html`
<section class="wrap hero">
  <div class="hero__text">
    <p class="kicker desk-text--${DESK}">For exchanges, custodians and market makers</p>
    <h1 class="h1">End to end listing</h1>
    <p class="lead">Token due diligence in the format your risk committee already uses, and monitoring that reaches you before the trade press does.</p>
    <div class="buttons">
      ${button(ctx, { label: 'Talk to us', form: DESK, placement: 'hero' })}
      ${button(ctx, { label: 'See a sample report', kind: 'outline', form: 'sample-report', placement: 'hero' })}
    </div>
  </div>
  <div class="hero__visual">${plate(ctx, { img: 'da-hero.png', alt: 'Due diligence reports, searching for a token', bleed: true })}</div>
</section>

<section class="band section" id="who"><div class="wrap">
  ${sectionHead('Who we build for', 'Pick the one that sounds like your week.')}
  ${audiences(ctx, [
    ...audienceCards(DESK),
    {
      desk: 'token-disclosure',
      title: 'Issuers and counsel',
      text: 'A white paper that has to be accepted once, and stay true after that.',
      to: 'token-disclosure',
    },
  ])}
</div></section>

<section class="wrap section">
  ${partnersRow()}
  <div class="grid grid--2 quotes">${quoteBlock(quotes.falconx)}${quoteBlock(quotes.zodia)}</div>
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
  visual: plate(ctx, { img: 'da-listing.png', alt: 'Due diligence reports for a queue of tokens' }),
})}

${feature({
  id: 'monitoring',
  num: '02',
  title: 'Monitoring that does not sleep',
  desk: DESK,
  flip: true,
  body: html`<p class="body muted">Exploits, protocol changes, enforcement actions and reserve movements — surfaced the hour they land, with the source attached.</p>`,
  visual: plate(ctx, { img: 'da-monitoring.png', alt: 'High impact events across monitored tokens' }),
})}

${feature({
  id: 'jurisdictions',
  num: '03',
  title: 'Jurisdiction by jurisdiction',
  desk: DESK,
  body: html`<p class="body muted">MiCA, the UK regime, MAS and VARA in one view, so an asset cleared in one place is not re-cleared from scratch in another.</p>`,
  visual: plate(ctx, { img: 'da-jurisdiction.png', alt: 'Audit history on a detailed due diligence report' }),
})}

<section class="band band--td section" id="token-disclosure"><div class="wrap feature feature--flat">
  <div class="feature__text">
    <h2 class="h2 td-title">${mark(21, '#b27a14')}Token Disclosure</h2>
    <p class="body">The other side of the same desk. A MiCA white paper drafted from the library of 1,000+ pre-filled papers, reviewed by CMS where a legal opinion is needed, notified to the authority and hosted on a public page any exchange can check. UK token classification with gunnercooke since July 2026.</p>
    <div class="buttons">
      ${button(ctx, { label: 'See Token Disclosure', to: 'token-disclosure' })}
      ${button(ctx, { label: 'Start a white paper', kind: 'outline', form: 'token-disclosure', placement: 'band' })}
    </div>
  </div>
  <div class="feature__visual">${plate(ctx, { img: 'da-token-disclosure.png', alt: 'A hosted MiCAR white paper' })}</div>
</div></section>

${insightsBlock(ctx, {
  label: 'Insights on digital assets',
  aside: 'Exploits, risk and regulation, as they happen.',
  deskFilter: [DESK, 'token-disclosure'],
  featured: 3,
  rows: 4,
  band: false,
})}

${eventsBlock(ctx, { label: 'Where we have been', aside: 'Talks, panels and delegations.', desk: DESK, today: ctx.today })}

${cta(ctx, {
  title: 'Put one asset through it',
  text: 'Pick a token you are reviewing now. We will run it and show you the report and the monitoring feed side by side.',
  buttons: [
    { label: 'See a sample report', kind: 'outline-light', form: 'sample-report' },
    { label: 'Talk to us', kind: 'light', form: DESK },
  ],
})}`,
} satisfies Page;
