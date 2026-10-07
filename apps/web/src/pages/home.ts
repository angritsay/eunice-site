// "Welcome to Eunice": the landing page. Its sections are the items of the
// Welcome menu in the header (team, history, values, trust centre, careers).
// The intro, the name and the values are the owner's words (Sep 2026); the story is
// the live careers page's, word for word.
import {
  badges,
  button,
  cta,
  facts,
  founder,
  insightsBlock,
  logoMarquee,
  mark,
  numbers,
  path,
  peopleStrip,
  quoteBlock,
  sectionHead,
} from '../components.ts';
import { quotes, team } from '../content/index.ts';
import { type Html, html } from '../lib/html.ts';
import type { Ctx, Page, ProductDesk } from '../lib/types.ts';
import config from '../site.config.ts';
import { uiFilm, uiMonitor, uiRead } from '../ui.ts';

const VALUES: readonly [string, string][] = [
  ['Show us the evidence', 'Opinions are fine, but we care about what the data says and where it came from.'],
  ['Sweat the details', 'In diligence the small stuff turns into big stuff, so we don’t cut corners.'],
  ['Look where others don’t', 'The biggest risks often hide in plain sight. Finding them is our job.'],
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
  <h1 class="h1 hero-center__title">We believe when trust is visible, markets move.</h1>
  <p class="lead hero-center__lead">Source-traced due diligence and monitoring for digital assets and private markets.</p>
  <div class="buttons hero-center__buttons">
    ${button(ctx, { label: 'Book demo', form: 'general', placement: 'hero' })}
    ${button(ctx, { label: 'Private Markets', kind: 'outline', to: 'private-markets' })}
    ${button(ctx, { label: 'Digital Assets', kind: 'outline', to: 'digital-assets' })}
  </div>
  <div class="hero-center__visual">
    ${uiFilm('company')}
  </div>
</section>

<!-- Proof first: who we work with and what backs us, before any description. -->
<section class="wrap section section--tight proof" id="proof">
  ${logoMarquee(ctx, 'clients')}
  ${numbers([
    { n: '$1T+', label: 'AUM managed by the allocators who trust Eunice' },
    { n: '1,000+', label: 'Pre-filled MiCA white papers' },
    { n: '4', label: 'Jurisdictions: MiCA, the UK, MAS and VARA' },
    { n: '$8m', label: 'Seed, March 2026 · Moonfire, Speedinvest, Openspace, Locus' },
  ])}
  ${logoMarquee(ctx, 'partners')}
  ${badges(['SOC 2 Type II', 'GDPR', 'FCA regulatory sandbox', 'Fintech 50, 2026', 'US · EU · UK · Singapore'])}
</section>

<section class="band--ink section" id="about"><div class="wrap intro">
  <p class="intro__lead">Eunice is an AI-powered due diligence and monitoring company built for institutional investors who cannot afford to get the details wrong.</p>
  ${path(
    [
      {
        title: 'Digital assets, first',
        text: 'We started in digital assets, where Eunice became trusted infrastructure for leading exchanges to assess tokens and monitor risk.',
      },
      {
        title: 'Private markets, next',
        text: 'Then we brought the same source-traced rigour to private markets: LPs, GPs and family offices.',
      },
      {
        title: 'Diligence beyond the close',
        text: 'One conviction runs through both: every conclusion traces back to its source, and diligence continues well beyond the close.',
      },
    ],
    { onward: true, label: 'How Eunice got here' },
  )}
</div></section>

<section class="wrap section tiles" id="products">
  ${tile(ctx, {
    desk: 'private-markets',
    title: 'Private Markets',
    visual: uiRead('private-markets'),
    text: 'Operational due diligence, portfolio monitoring, data gap analysis and bespoke reporting for LPs, GPs and family offices.',
  })}
  ${tile(ctx, {
    desk: 'digital-assets',
    title: 'Digital Assets',
    visual: uiMonitor('digital-assets'),
    text: 'Token due diligence, monitoring and MiCA disclosure for exchanges, custodians, market makers and issuers.',
  })}
</section>

<section class="wrap section" id="team">
  ${sectionHead('Our founders', team.intro)}
  <div class="founders">${founder(ctx, 'yi')}${founder(ctx, 'philip')}</div>

  <div class="team-block">
    ${sectionHead('The team', 'Point at a person, or tap, to read about them.')}
    ${peopleStrip(
      ctx,
      ['riley', 'vinay', 'petronela', 'chrislyn', 'ana'],
      {
        title: 'Client Implementation Consultant, Private Markets',
        slug: 'client-implementation-consultant-private-markets',
        line: 'Sit with LPs and fund managers while Eunice reads their first dataroom.',
      },
      'petronela',
    )}
    <div class="buttons">${button(ctx, { label: 'Life at Eunice and all roles', kind: 'outline', to: 'careers' })}</div>
  </div>
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
      <p class="body">Eunice Newton Foote discovered the greenhouse effect in 1856, and someone else got the credit for a century. Careful work, spotting what others missed, giving the truth its due: that is the company we want to be.</p>
    </div>
  </div>
</div></section>

<section class="wrap section" id="values">
  ${sectionHead('What we stand for')}
  <ol class="values">${VALUES.map(([t, d]) => html`<li><p class="h4">${t}</p><p class="small muted">${d}</p></li>`)}</ol>
</section>

<section class="band section" id="trust"><div class="wrap">
  ${sectionHead('Eunice AI Trust Centre', 'How we protect the data clients trust us with.')}
  ${facts([
    { art: 'shield', title: 'SOC 2 Type II', text: 'Audited; the report is available on request' },
    { art: 'lock', title: 'GDPR', text: 'Compliant, with a data processing agreement for every engagement' },
    {
      art: 'noTrain',
      title: 'No training on your data',
      text: 'Your documents are never used to train models. They stay yours.',
    },
    { art: 'cite', title: 'Every finding', text: 'Cited to the page it came from' },
  ])}
  <div class="buttons">
    ${button(ctx, { label: 'Our Trust Centre on Vanta', href: config.trustCenterUrl, newTab: true })}
    ${button(ctx, { label: 'How we handle security', kind: 'outline', to: 'security' })}
  </div>
</div></section>

<section class="wrap section">
  ${sectionHead('What the people who use it say')}
  <div class="grid grid--3 quotes">
    ${quoteBlock(quotes.fof)}${quoteBlock(quotes.falconx)}${quoteBlock(quotes.zodia)}
  </div>
</section>

${insightsBlock(ctx, { label: 'Insights', aside: 'Notes, analysis and company news, by desk.', featured: 3, rows: 5 })}

${cta(ctx, {
  title: 'Bring us the fund, or the token, you are reviewing now',
  text: 'A thirty-minute call with the desk that would run it. We show you what Eunice reads and what it returns; you decide.',
  buttons: [{ label: 'Book demo', kind: 'light', form: 'general' }],
})}`,
} satisfies Page;

function tile(
  ctx: Ctx,
  { desk, title, text, visual }: { desk: ProductDesk; title: string; text: string; visual: Html },
) {
  return html`
<a class="tile tile--${desk}" href="${ctx.link(desk)}">
  <span class="tile__shot" aria-hidden="true">${visual}</span>
  <span class="tile__foot">
    <span>
      <span class="tile__title">${mark(18, '#fff')}${title}</span>
      <span class="tile__text">${text}</span>
    </span>
    <span class="btn btn--light">Learn more</span>
  </span>
</a>`;
}
