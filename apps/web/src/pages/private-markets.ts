import {
  bullets,
  button,
  cta,
  eventsBlock,
  facts,
  feature,
  heroField,
  peopleStrip,
  plate,
  quoteBlock,
  sectionHead,
  stage,
  type WhoClient,
  whoCards,
} from '../components.ts';
import { quotes } from '../content/index.ts';
import { html } from '../lib/html.ts';
import type { Page } from '../lib/types.ts';
import { uiFilm, uiMonitor, uiRead, uiReport } from '../ui.ts';

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
    <h1 class="h1">Better Decisions, Better Outcomes</h1>
    <p class="lead">Purpose-built for private market investors, with implementation, support and training included.</p>
    <div class="buttons">
      ${button(ctx, { label: 'Book demo', kind: 'desk', form: DESK, placement: 'hero' })}
    </div>
  </div>
  ${heroField({ desk: DESK })}
</section>

<section class="wrap trustline" aria-label="Trusted by asset allocators">
  ${quoteBlock(quotes.fof)}
  <div class="trustline__figure">
    <p class="h1">$1.4T+</p>
    <p class="lead">In AUM, managed by the asset allocators who trust Eunice</p>
  </div>
</section>

${whoCards(ctx, {
  desk: DESK,
  title: 'Every Client’s Needs',
  clients: CLIENTS,
})}

<section class="wrap section">
  ${sectionHead('Engineered for Your Most Sensitive Data')}
  ${facts(
    [
      { art: 'tenant', title: 'Tenant Isolation', text: 'Every client’s data walled off' },
      { art: 'lock', title: 'Encrypted End to End', text: 'In transit and at rest' },
      { art: 'audit', title: 'Immutable Audit Trail', text: 'Every action logged' },
      { art: 'noTrain', title: 'Never Trained on Your Data', text: 'No shared model learns from your files' },
      { art: 'globe', title: 'GDPR', text: 'Aligned with UK and EU data law' },
      { art: 'shield', title: 'SOC 2 Type II', text: 'Independently audited controls' },
      { art: 'sso', title: 'SSO', text: 'Enterprise identity, your policy' },
      { art: 'roles', title: 'Role-Based Access', text: 'Permissions per user and per deal' },
    ],
    4,
  )}
</section>

${feature({
  id: 'odd',
  title: 'Operational Due Diligence',
  desk: DESK,
  body: html`<p class="body muted">Every PPM, DDQ, LPA and audited statement, read against the ODD checklist you already use. Every finding cites its page.</p>`,
  visual: plate(ctx, { tint: DESK, html: uiRead(DESK) }),
})}

${feature({
  id: 'monitoring',
  title: 'Portfolio Monitoring',
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
  title: 'Data Gap Analysis',
  desk: DESK,
  body: html`<p class="body muted">Missing documents, unanswered questions and figures that don’t reconcile, surfaced before they become problems and tracked until closed.</p>`,
  visual: plate(ctx, { tint: DESK, html: uiRead(DESK, { missing: true }) }),
})}

${feature({
  id: 'reporting',
  title: 'Bespoke Reporting',
  desk: DESK,
  flip: true,
  body: html`<p class="body muted">Reports for your Board, committee or clients, built to your template. Every figure traces back to its page.</p>`,
  visual: plate(ctx, { tint: DESK, html: uiReport(DESK) }),
})}

<section class="wrap section" id="end-to-end">
  ${sectionHead('Automated Where It Is Trustworthy. Human Where Judgement Counts.')}
  ${facts(
    [
      { art: 'journey', title: 'Delivered End to End', text: 'We onboard you and stay alongside' },
      {
        art: 'review',
        title: 'Human in the Loop',
        text: 'Uncertain values flagged for review. Your team signs off.',
      },
      {
        art: 'framework',
        title: 'Your Framework',
        text: 'Your DD templates, IC format and scoring, configured to your own set-up',
      },
      {
        art: 'alongside',
        title: 'Alongside, Not Instead',
        text: 'Wraps around your existing stack, administrators and your file system',
      },
      {
        art: 'done',
        title: 'Minimal Work for You',
        text: 'Our implementation team loads, checks and maintains data',
      },
      {
        art: 'models',
        title: 'The Right Model for the Task',
        text: 'Model-agnostic, per use case. Never trained on your data.',
      },
    ],
    3,
  )}
  <div class="section-stage">${stage({ film: uiFilm(DESK) })}</div>
</section>

<section class="wrap section" id="team">
  ${sectionHead('The Desk')}
  ${peopleStrip(ctx, ['petronela', 'yi', 'philip', 'vinay'])}
</section>

${eventsBlock(ctx, {
  label: 'News and Events',
  desk: DESK,
  today: ctx.today,
  insights: { deskFilter: [DESK, 'company'], count: 3 },
})}

${cta(ctx, { buttons: [{ label: 'Book demo', kind: 'light', form: DESK }] })}`,
} satisfies Page;

// Figma has no reporting screen yet, so this one stays a drawn stand-in.

// Who Private Markets is for: the client types we serve now, each drawn and cut to
// a line. Where a client-type page matches, the card links to it.
const CLIENTS: readonly WhoClient[] = [
  {
    who: 'High-Activity Asset Allocators',
    line: 'High levels of dealmaking, large numbers of funds and managers.',
    art: 'pace',
    to: `${DESK}/lps`,
  },
  {
    who: 'Focused Asset Allocators',
    line: 'Smaller size and lower deal activity, but higher levels of scrutiny.',
    art: 'scrutiny',
    to: `${DESK}/lps`,
  },
  {
    who: 'Family Offices',
    line: 'Lean teams with ambitious goals, branching out into new asset classes.',
    art: 'branch',
    to: `${DESK}/family-offices`,
  },
  {
    who: 'General Partners',
    line: 'Private assets funds and separately managed accounts.',
    art: 'report',
    to: `${DESK}/managers`,
  },
];
