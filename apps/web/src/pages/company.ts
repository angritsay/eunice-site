import type { PersonId } from '../components.ts';
import { button, cta, facts, insightRow, partnersRow, peopleGrid, plate, sectionHead } from '../components.ts';
import { insights, people } from '../content/index.ts';
import { html } from '../lib/html.ts';
import type { Ctx, Page } from '../lib/types.ts';
import config from '../site.config.ts';

export default {
  slug: 'company',
  nav: 'company',
  title: 'About Eunice — We read the documents nobody has time to read',
  description:
    'A diligence firm for regulated finance. Founded in London in 2023; backed by Moonfire, Speedinvest, Openspace Capital and Locus Ventures.',
  render: (ctx) => html`
<section class="wrap hero">
  <div class="hero__text">
    <p class="kicker">About us</p>
    <h1 class="h1">We read the documents nobody has time to read</h1>
    <p class="lead">A diligence firm for regulated finance. Founded in London in 2023; backed by Moonfire, Speedinvest, Openspace Capital and Locus Ventures.</p>
    <div class="buttons">
      ${button(ctx, { label: 'Meet the team', to: 'company', hash: 'team' })}
      ${button(ctx, { label: 'See open roles', kind: 'outline', to: 'careers', hash: 'roles' })}
    </div>
  </div>
  <div class="hero__visual">${plate(ctx, { img: 'company-hero.png', alt: 'The Eunice pipeline view', bleed: true })}</div>
</section>

<section class="wrap section">
  ${facts([
    { title: '$8m seed', text: 'March 2026 · Moonfire, Speedinvest, Openspace Capital, Locus Ventures' },
    { title: 'Fintech 50', text: 'May 2026 · among the 100 fastest-growing startups in the UK and Ireland' },
    { title: 'FCA regulatory sandbox', text: 'Accepted November 2025 for digital asset disclosure standards' },
    { title: 'SOC 2 Type II · GDPR', text: 'Audited; no training on client data' },
  ])}
  ${partnersRow()}
</section>

<section class="wrap section" id="team">
  ${sectionHead('Leadership', 'Five people who run the company, in London.')}
  ${peopleGrid(ctx, ['yi', 'philip', 'petronela', 'vinay', 'chrislyn'], 'portrait')}
  <div class="grid grid--4 people people--row people--team">
    ${(['winnie', 'riley'] as const).map((id) => teamLine(ctx, id))}
    <a class="join" href="${ctx.link('careers', 'roles')}"><span class="h4">Join the team</span><span class="caption muted">Three open roles</span><span class="small">GTM for digital assets, client implementation for private markets, senior engineering.</span></a>
  </div>
</section>

<section class="band section" id="press"><div class="wrap">
  ${sectionHead('News and press', 'What has been announced.')}
  <ul class="irows">${insights
    .filter((i) => i.desk === 'company' || /FCA/.test(i.title))
    .sort((a, b) => (a.date < b.date ? 1 : -1))
    .slice(0, 5)
    .map((i) => insightRow(ctx, i))}</ul>
</div></section>

<section class="wrap section feature feature--flat" id="how-we-work">
  <div class="feature__text">
    <h2 class="h2">How we work</h2>
    <p class="body muted">Three rules that have not changed since the first customer.</p>
  </div>
  <ol class="rules">
    <li><b>Every output cites its page.</b><span>If we cannot show you where it came from, we do not say it.</span></li>
    <li><b>A second agent challenges the first.</b><span>Disagreement between them is surfaced, not resolved quietly.</span></li>
    <li><b>Your team signs off.</b><span>Eunice does not approve anything. It prepares the thing you approve.</span></li>
  </ol>
</section>

${cta(ctx, {
  title: 'Come and build it',
  text: 'Three open roles in London, remote-friendly. Your work ships into regulated financial workflows, where every output has to be defensible.',
  buttons: [
    { label: 'Email the team', kind: 'outline-light', href: `mailto:${config.careersEmail}` },
    { label: 'See open roles', kind: 'light', to: 'careers', hash: 'roles' },
  ],
})}`,
} satisfies Page;

const teamLine = (_ctx: Ctx, id: PersonId) => {
  const p = people[id];
  return html`<div class="teamline"><span class="h4">${p.name}</span><span class="caption muted">${p.role}</span><span class="small">${p.owns}</span></div>`;
};
