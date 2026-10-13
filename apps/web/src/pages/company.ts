import {
  button,
  cta,
  facts,
  insightRow,
  investorsBlock,
  partnersRow,
  plate,
  sectionHead,
  teamGrid,
} from '../components.ts';
import { insights, teamPeople } from '../content/index.ts';
import { html } from '../lib/html.ts';
import type { Page } from '../lib/types.ts';
import config from '../site.config.ts';
import { uiRead } from '../ui.ts';

export default {
  slug: 'company',
  nav: 'company',
  title: 'About Eunice — We Read the Documents Nobody Has Time to Read',
  description:
    'A diligence firm for regulated finance. Founded in London in 2023; backed by Moonfire, Speedinvest, Openspace Capital and Locus Ventures.',
  render: (ctx) => html`
<section class="wrap hero">
  <div class="hero__text">
    <h1 class="h1">We Read the Documents Nobody Has Time to Read</h1>
    <p class="lead">A diligence firm for regulated finance. Founded in London in 2023; backed by Moonfire, Speedinvest, Openspace Capital and Locus Ventures.</p>
    <div class="buttons">
      ${button(ctx, { label: 'Meet the team', to: 'company', hash: 'team' })}
      ${button(ctx, { label: 'See open roles', kind: 'outline', to: 'careers', hash: 'roles' })}
    </div>
  </div>
  <div class="hero__visual">${plate(ctx, { html: uiRead('company', { label: 'Documents read in full, one finding cited to its page' }) })}</div>
</section>

<section class="wrap section">
  ${facts([
    { art: 'seed', title: '$8m Seed', text: 'March 2026 · Moonfire, Speedinvest, Openspace Capital, Locus Ventures' },
    { art: 'award', title: 'Fintech 50', text: 'May 2026 · TechRound ranked Eunice #43 of 50' },
    {
      art: 'rise',
      title: 'Sifted',
      text: '2026 · among the 100 fastest-growing startups in the UK & Ireland, by revenue',
    },
    {
      art: 'sandbox',
      title: 'FCA Regulatory Sandbox',
      text: 'Accepted November 2025 for digital asset disclosure standards',
    },
    { art: 'shield', title: 'SOC 2 Type II · GDPR', text: 'Audited; no training on client data' },
  ])}
  ${partnersRow(ctx)}
</section>

<section class="wrap section" id="team">
  ${sectionHead('Our Team')}
  ${teamGrid(ctx, teamPeople, {
    line: 'GTM for digital assets, client implementation for private markets, senior engineering.',
  })}
  ${investorsBlock(ctx)}
</section>

<section class="band section" id="press"><div class="wrap">
  ${sectionHead('News and Press')}
  <ul class="irows">${insights
    .filter((i) => i.desk === 'company' || /FCA/.test(i.title))
    .sort((a, b) => (a.date < b.date ? 1 : -1))
    .slice(0, 5)
    .map((i) => insightRow(ctx, i))}</ul>
</div></section>

<section class="wrap section feature feature--flat" id="how-we-work">
  <div class="feature__text">
    <h2 class="h2">How We Work</h2>
    <p class="body muted">Three rules that have not changed since the first customer.</p>
  </div>
  <ol class="rules">
    <li><b>Every output cites its page.</b><span>If we cannot show you where it came from, we do not say it.</span></li>
    <li><b>A second agent challenges the first.</b><span>Disagreement between them is surfaced, not resolved quietly.</span></li>
    <li><b>Your team signs off.</b><span>Eunice does not approve anything. It prepares the thing you approve.</span></li>
  </ol>
</section>

${cta(ctx, {
  demo: 'general',
  buttons: [
    { label: 'Email the team', kind: 'outline', href: `mailto:${config.careersEmail}` },
    { label: 'See open roles', kind: 'outline', to: 'careers', hash: 'roles' },
  ],
})}`,
} satisfies Page;
