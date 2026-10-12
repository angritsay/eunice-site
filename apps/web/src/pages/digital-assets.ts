import {
  audienceLine,
  button,
  cta,
  eventsBlock,
  facts,
  feature,
  heroField,
  insightsBlock,
  logoMarquee,
  mark,
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
    'Token due diligence in the format your risk committee already uses, and real-time monitoring across 50+ risk types. Built for lean teams covering every asset and every regulator.',
  render: (ctx) => html`
<section class="wrap hero">
  <div class="hero__text">
    <h1 class="h1">Defensible Decisions for Every Asset, in Every Jurisdiction.</h1>
    <p class="lead">Token due diligence in the format your risk committee already uses, and real-time monitoring across 50+ risk types. Built for lean teams covering every asset and every regulator.</p>
    <div class="buttons">
      ${button(ctx, { label: 'Book demo', form: DESK, placement: 'hero' })}
      ${button(ctx, { label: 'Trusted by the leading firms', kind: 'outline', to: DESK, hash: 'working-with' })}
    </div>
  </div>
  ${heroField({ desk: DESK })}
</section>

${whoCards(ctx, {
  desk: DESK,
  title: 'One Solution for Institutions and Issuers',
  clients: [
    { who: 'Exchanges', line: audienceLine(DESK, 'exchanges'), art: 'exchange' },
    { who: 'Custodians', line: audienceLine(DESK, 'custodians'), art: 'vault' },
    {
      who: 'Market Makers',
      line: audienceLine(DESK, 'market-makers'),
      art: 'orderBook',
    },
    {
      who: 'Banks',
      line: 'Custody and trading in digital assets, held to the same scrutiny as the rest of the bank.',
      art: 'bank',
    },
    {
      who: 'Tokenisation Platforms',
      line: 'Real-world assets brought on-chain, each with its diligence and disclosure kept current.',
      art: 'tokenise',
    },
    {
      who: 'Issuers',
      line: audienceLine('token-disclosure', 'issuers'),
      art: 'issuer',
      to: 'token-disclosure',
      more: 'See Token Disclosure',
    },
  ],
})}

<section class="wrap section" id="working-with">
  ${logoMarquee(ctx, 'clients')}
  <div class="grid grid--3 quotes">${quoteBlock(quotes.falconx)}${quoteBlock(quotes.zodia)}${quoteBlock(quotes.libeara)}</div>
  ${logoMarquee(ctx, 'partners')}
</section>

<section class="wrap section section--tight">
  ${facts([
    {
      art: 'sandbox',
      title: 'FCA Regulatory Sandbox',
      text: 'Participant since November 2025, testing disclosure standards',
    },
    { art: 'shield', title: 'SOC 2 Type II', text: 'Audited; GDPR compliant' },
    { art: 'cite', title: 'Every Claim', text: 'Cited to the source it came from' },
    { art: 'globe', title: '8 Jurisdictions', text: 'Live and expanding: the EU, the UK, the US, MAS, VARA and more' },
  ])}
</section>

${feature({
  id: 'listing',
  title: 'Listing Diligence',
  desk: DESK,
  body: html`<p class="body muted">One report per token covering the team, the code, the reserve where there is one, and the jurisdiction, in the shape a listing committee signs off on.</p>`,
  visual: plate(ctx, { tint: DESK, html: uiRead(DESK) }),
})}

${feature({
  id: 'monitoring',
  title: 'Continuous Monitoring',
  desk: DESK,
  flip: true,
  body: html`<p class="body muted">Exploits, protocol changes, enforcement actions and reserve movements, surfaced the same day, with the source attached. Drawn from Allium, CoinGecko, CoinMarketCap, DeFiLlama and X, each cited by name.</p>`,
  visual: plate(ctx, { tint: DESK, html: uiMonitor(DESK) }),
})}

${feature({
  id: 'jurisdictions',
  title: 'Jurisdiction by Jurisdiction',
  desk: DESK,
  body: html`<p class="body muted">Eight jurisdictions live, among them the EU, the UK, the US, MAS and VARA, in one view, so an asset cleared in one place is not re-cleared from scratch in another.</p>`,
  visual: plate(ctx, { tint: DESK, html: uiReport(DESK) }),
})}

<section class="band band--td section" id="token-disclosure"><div class="wrap feature feature--flat">
  <div class="feature__text">
    <h2 class="h2 td-title">${mark(21, '#b27a14')}Token Disclosure</h2>
    <p class="body">The other side of the desk: a MiCA white paper drafted for you, reviewed by CMS and published where any exchange can check it. 30+ filed through 4 NCAs.</p>
    <div class="buttons">
      ${button(ctx, { label: 'See Token Disclosure', to: 'token-disclosure' })}
      ${button(ctx, { label: 'Start a white paper', kind: 'outline', form: 'token-disclosure', placement: 'band' })}
    </div>
  </div>
  <div class="feature__visual">${plate(ctx, { tint: DESK, html: uiReport('token-disclosure') })}</div>
</div></section>

${insightsBlock(ctx, {
  label: 'Insights on Digital Assets',
  aside: 'Exploits, risk and regulation.',
  deskFilter: [DESK, 'token-disclosure'],
  featured: 3,
  rows: 4,
  band: false,
})}

<section class="wrap section" id="team">
  ${sectionHead('The Desk', 'Who runs digital assets, from listing reviews to the FCA sandbox.')}
  ${peopleStrip(ctx, ['yi', 'philip', 'chrislyn', 'riley'])}
</section>

${eventsBlock(ctx, { label: 'Where We Have Been', aside: 'Talks, panels and delegations.', desk: DESK, today: ctx.today })}

${cta(ctx, {
  title: 'Put One Token Through It',
  text: 'Pick a token you are reviewing now. We will run it and show you the report and the monitoring feed side by side.',
  buttons: [
    { label: 'See a sample report', kind: 'outline-light', form: 'sample-report' },
    { label: 'Book demo', kind: 'light', form: DESK },
  ],
})}`,
} satisfies Page;
