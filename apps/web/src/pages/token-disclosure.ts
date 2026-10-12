import {
  audienceLine,
  button,
  cta,
  facts,
  feature,
  heroField,
  insightsBlock,
  mark,
  plate,
  whoCards,
} from '../components.ts';
import { html } from '../lib/html.ts';
import type { Page } from '../lib/types.ts';
import { uiRead, uiReport } from '../ui.ts';

const DESK = 'token-disclosure';

export default {
  slug: DESK,
  nav: DESK,
  title: 'Eunice Token Disclosure — MiCA White Papers, Notified and Hosted',
  description:
    'A MiCA white paper drafted for you, reviewed by CMS where a legal opinion is needed, notified to the authority and hosted on a public page. 30+ filed through 4 NCAs.',
  render: (ctx) => html`
<section class="wrap hero">
  <div class="hero__text">
    <h1 class="h1">A White Paper Accepted Once, and True After That</h1>
    <p class="lead">A MiCA white paper drafted for you, reviewed by CMS, notified and published where any exchange can check it. 30+ filed through 4 NCAs.</p>
    <div class="buttons">
      ${button(ctx, { label: 'Start a white paper', form: DESK, placement: 'hero' })}
      ${button(ctx, { label: 'The register', kind: 'outline', to: `${DESK}/register` })}
    </div>
  </div>
  ${heroField({ desk: DESK })}
</section>

${whoCards(ctx, {
  desk: DESK,
  title: 'One Paper, Three Readers',
  clients: [
    { who: 'Issuers', line: audienceLine(DESK, 'issuers'), art: 'issuer', to: `${DESK}/issuers` },
    { who: 'Counsel', line: audienceLine(DESK, 'counsel'), art: 'legal', to: `${DESK}/counsel` },
    { who: 'Exchanges', line: audienceLine(DESK, 'exchanges'), art: 'exchange', to: `${DESK}/exchanges` },
  ],
})}

<section class="wrap section">
  ${facts([
    {
      art: 'sandbox',
      title: 'FCA Regulatory Sandbox',
      text: 'Participant since November 2025, testing disclosure standards',
    },
    { art: 'legal', title: 'Reviewed by CMS', text: 'Where a legal opinion is needed' },
    { art: 'tag', title: 'gunnercooke', text: 'UK token classification, since July 2026' },
    { art: 'library', title: '30+ MiCA White Papers', text: 'Filed through 4 NCAs' },
  ])}
</section>

${feature({
  id: 'draft',
  title: 'Drafted by a Team That Files Them',
  desk: DESK,
  body: html`<p class="body muted">A MiCA white paper drafted by the team behind 30+ papers filed through 4 NCAs, so the starting point has already been through the regime rather than a blank page.</p>`,
  visual: plate(ctx, { tint: DESK, html: uiRead(DESK) }),
})}

${feature({
  id: 'review',
  title: 'Reviewed Where It Counts',
  desk: DESK,
  flip: true,
  body: html`<p class="body muted">CMS reviews the points that need a legal opinion, rather than a legal bill for the whole document. UK token classification runs with gunnercooke.</p>`,
  visual: plate(ctx, { tint: DESK, html: uiReport(DESK) }),
})}

${feature({
  id: 'notify',
  title: 'Notified, Then Hosted',
  desk: DESK,
  body: html`<p class="body muted">Notified to the authority and published to the register, so there is one address for the version that stands and nobody has to email an attachment to prove it.</p>`,
  visual: html`<ol class="steps steps--${DESK}">
    <li><span class="h4">Draft</span><span class="small muted">In the shape the regime asks for.</span></li>
    <li><span class="h4">Review</span><span class="small muted">CMS on the points that need an opinion.</span></li>
    <li><span class="h4">Notify</span><span class="small muted">Filed with the authority for the jurisdiction.</span></li>
    <li><span class="h4">Host</span><span class="small muted">Published to the register, open to anyone.</span></li>
  </ol>`,
})}

<section class="band band--td section" id="register"><div class="wrap feature feature--flat">
  <div class="feature__text">
    <h2 class="h2 td-title">${mark(21, '#b27a14')}The Register</h2>
    <p class="body">Every paper we notify is hosted on a public page. An exchange, a counterparty or an authority can read what an issuer published without asking the issuer for it.</p>
    <div class="buttons">${button(ctx, { label: 'See the register', to: `${DESK}/register` })}</div>
  </div>
  <div class="feature__visual">${plate(ctx, { tint: DESK, html: uiRead(DESK, { label: 'The published white paper, open for any exchange to check' }) })}</div>
</div></section>

${insightsBlock(ctx, {
  label: 'Insights on Token Disclosure',
  deskFilter: [DESK],
  featured: 1,
  rows: 4,
  band: false,
})}

${cta(ctx, {
  demo: DESK,
  buttons: [
    { label: 'The register', kind: 'outline', to: `${DESK}/register` },
    { label: 'Start a white paper', kind: 'outline', form: DESK },
  ],
})}`,
} satisfies Page;
