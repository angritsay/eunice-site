// "Welcome to Eunice": the landing page. Its sections are the items of the
// Welcome menu in the header (history, values, team, trust centre, careers).
// The intro, the name and the values are the owner's words (Sep 2026); the story is
// the live careers page's, word for word.
import {
  button,
  cta,
  facts,
  founder,
  insightsBlock,
  mark,
  partnersRow,
  peopleStrip,
  photo,
  plate,
  quoteBlock,
  sectionHead,
  sized,
} from '../components.ts';
import { quotes, team } from '../content/index.ts';
import { html } from '../lib/html.ts';
import type { Ctx, Page, ProductDesk } from '../lib/types.ts';
import config from '../site.config.ts';
import { roleCards } from './jobs.ts';

const VALUES: readonly [string, string][] = [
  ['Show us the evidence', 'Opinions are fine, but we care about what the data says and where it came from.'],
  ['Sweat the details', 'In diligence the small stuff turns into big stuff, so we don’t cut corners.'],
  ['Look where others don’t', 'The most important risks are often sitting in plain sight, and we like finding them.'],
  ['No black boxes', 'We always show our workings, so you know exactly why we reached an answer.'],
  ['Raise the bar', '“Good enough” has been the norm in private markets for too long, and we’re here to change that.'],
];

export default {
  slug: '',
  nav: 'company',
  title: 'Welcome to Eunice — AI-powered due diligence and monitoring',
  description:
    'Eunice is an AI-powered due diligence and monitoring company built for institutional investors who cannot afford to get the details wrong.',
  render: (ctx) => html`
<section class="wrap hero-center">
  <h1 class="h1 hero-center__title">Welcome to Eunice</h1>
  <p class="lead hero-center__lead">Source-traced due diligence and monitoring for digital assets and private markets.</p>
  <div class="buttons hero-center__buttons">
    ${button(ctx, { label: 'Book demo', form: 'general', placement: 'hero' })}
    ${button(ctx, { label: 'Private market tools', kind: 'outline', to: 'private-markets' })}
    ${button(ctx, { label: 'Crypto & RWA', kind: 'outline', to: 'digital-assets' })}
  </div>
  <div class="hero-center__visual">
    ${photo(ctx, { img: 'city-of-london.jpg', variant: 'stage', alt: 'The City of London at dusk, looking along the Thames to St Paul’s' })}
    <div class="hero-center__plate">${plate(ctx, { img: 'home-hero.png', alt: 'The Eunice pipeline: funds and managers under review' })}</div>
  </div>
</section>

<section class="band--ink section" id="about"><div class="wrap intro">
  <p class="kicker">About Eunice</p>
  <p class="intro__lead">Eunice is an AI-powered due diligence and monitoring company built for institutional investors who cannot afford to get the details wrong.</p>
  <div class="intro__cols">
    <p>We began with our first product in digital assets where our platform became trusted infrastructure for leading exchanges and institutions to assess tokens, screen for regulatory risk and monitor live risk events at scale.</p>
    <p>Building on that foundation, we then launched our second product, a toolset for private markets investing, which brings the same source-traced rigour to LPs, GPs, family offices, fund-of-funds and secondaries investors.</p>
    <p>Today, our two products share a single conviction: every conclusion should trace back to its source, every gap should be surfaced before it becomes a problem, and diligence should continue well beyond the close. From first screen to ongoing portfolio monitoring, Eunice helps investors move faster, decide with confidence and raise the standard of diligence across the markets they serve.</p>
  </div>
  <ol class="intro__steps">
    <li><span>01</span>Digital assets, first</li>
    <li><span>02</span>Private markets, next</li>
    <li><span>03</span>Diligence beyond the close</li>
  </ol>
</div></section>

<section class="wrap section tiles" id="products">
  ${tile(ctx, {
    desk: 'private-markets',
    title: 'Private market tools',
    img: 'home-tile-pm.png',
    text: 'Operational due diligence, portfolio monitoring, data gap analysis and bespoke reporting for LPs, GPs, family offices and consultants.',
  })}
  ${tile(ctx, {
    desk: 'digital-assets',
    title: 'Crypto & RWA',
    img: 'home-tile-da.png',
    text: 'Token due diligence, monitoring and MiCA disclosure for exchanges, custodians, market makers and issuers.',
  })}
</section>

<section class="band section" id="history"><div class="wrap">
  ${sectionHead('Firm history', team.founded)}
  <div class="story">
    <div>
      <h2 class="h2">${team.storyTitle}</h2>
      ${team.story.map((p) => html`<p class="body">${p}</p>`)}
    </div>
    <div class="story__name">
      <h2 class="h2">Why Eunice</h2>
      <p class="body">We named Eunice after Eunice Newton Foote, an American scientist who worked out back in 1856 that carbon dioxide traps heat, which means she discovered the greenhouse effect. She wasn’t allowed to present her own paper and for more than a hundred years someone else got the credit. We loved her story because it’s about doing the careful work, spotting what everyone else missed and making sure the truth gets its due. That’s the kind of company we want to be, and the name keeps us honest.</p>
    </div>
  </div>
  ${facts([
    { title: '$8m seed', text: 'March 2026 · Moonfire, Speedinvest, Openspace Capital, Locus Ventures' },
    { title: 'Fintech 50', text: 'Named in May 2026; among the 100 fastest-growing startups in the UK and Ireland' },
    { title: 'FCA regulatory sandbox', text: 'Digital asset disclosure standards, since November 2025' },
    { title: 'US · EU · UK · Singapore', text: 'Institutions, funds, issuers and regulators served today' },
  ])}
</div></section>

<section class="wrap section" id="values">
  ${sectionHead('What we stand for')}
  <ol class="values">${VALUES.map(([t, d]) => html`<li><p class="h4">${t}</p><p class="small muted">${d}</p></li>`)}</ol>
</section>

<section class="wrap section" id="team">
  ${sectionHead('Our founders', team.intro)}
  <div class="founders">${founder(ctx, 'yi')}${founder(ctx, 'philip')}</div>

  <div class="team-block">
    ${sectionHead('The team', 'Point at a person, or tap, to read about them.')}
    ${peopleStrip(ctx, ['petronela', 'chrislyn', 'vinay', 'ana', 'riley'], {
      title: 'Client Implementation Consultant, Private Markets',
      slug: 'client-implementation-consultant-private-markets',
      line: 'Sit with LPs and fund managers while Eunice reads their first dataroom.',
    })}
  </div>
</section>

<section class="band section" id="trust"><div class="wrap">
  ${sectionHead('Eunice AI Trust Centre', 'How we protect the data clients trust us with.')}
  ${facts([
    { title: 'SOC 2 Type II', text: 'Audited; the report is available on request' },
    { title: 'GDPR', text: 'Compliant, with a data processing agreement for every engagement' },
    { title: 'No training on your data', text: 'Your documents are never used to train models. They stay yours.' },
    { title: 'Every finding', text: 'Cited to the page it came from' },
  ])}
  <div class="buttons">
    ${button(ctx, { label: 'Visit the Trust Center', href: config.trustCenterUrl, newTab: true })}
    ${button(ctx, { label: 'How we handle security', kind: 'outline', to: 'security' })}
  </div>
</div></section>

<section class="wrap section">
  ${sectionHead('What the people who use it say')}
  <div class="grid grid--3 quotes quotes--tinted">
    ${quoteBlock(quotes.fof)}${quoteBlock(quotes.falconx)}${quoteBlock(quotes.zodia)}
  </div>
  ${partnersRow()}
</section>

<section class="wrap section" id="careers">
  ${sectionHead('Careers', 'London-based, remote-friendly.')}
  ${roleCards(ctx)}
  <p class="all"><a class="more" href="${ctx.link('careers')}">Life at Eunice and all roles</a></p>
</section>

${insightsBlock(ctx, { label: 'Insights', aside: 'Notes, analysis and company news, by desk.', featured: 3, rows: 5 })}

${cta(ctx, {
  title: 'Bring us the fund, or the token, you are reviewing now',
  text: 'A thirty-minute call with the desk that would run it. We show you what Eunice reads and what it returns; you decide.',
  buttons: [{ label: 'Book demo', kind: 'light', form: 'general' }],
})}`,
} satisfies Page;

function tile(ctx: Ctx, { desk, title, text, img }: { desk: ProductDesk; title: string; text: string; img: string }) {
  return html`
<a class="tile tile--${desk}" href="${ctx.link(desk)}">
  <span class="tile__shot"><img src="${ctx.asset(`img/${img}`)}" alt=""${sized(img)} loading="lazy"></span>
  <span class="tile__foot">
    <span>
      <span class="tile__title">${mark(18, '#fff')}${title}</span>
      <span class="tile__text">${text}</span>
    </span>
    <span class="btn btn--light">Learn more</span>
  </span>
</a>`;
}
