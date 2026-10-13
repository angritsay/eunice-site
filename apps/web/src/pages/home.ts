// "Welcome to Eunice": the landing page. Its sections are the items of the
// Welcome menu in the header (security, team, why Eunice, careers).
// The intro and the name are the owner's words (Sep 2026); the story is
// the live careers page's, word for word.
import {
  button,
  cta,
  facts,
  insightsBlock,
  investorsBlock,
  logoMarquee,
  mark,
  numbers,
  quoteBlock,
  sectionHead,
  teamGrid,
} from '../components.ts';
import { quotes, teamPeople } from '../content/index.ts';
import { type Html, html } from '../lib/html.ts';
import type { Ctx, Page, ProductDesk } from '../lib/types.ts';
import config from '../site.config.ts';
import { uiFilm, uiMonitor, uiRead } from '../ui.ts';

export default {
  slug: '',
  nav: 'company',
  title: 'Welcome to Eunice — AI-Powered Due Diligence and Monitoring',
  description:
    'Eunice is an AI-powered due diligence and monitoring company built for institutional investors who cannot afford to get the details wrong.',
  render: (ctx) => html`
<section class="wrap hero-center">
  <h1 class="h1 hero-center__title">We Believe When Trust Is Visible, Markets Move.</h1>
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
  ${numbers(ctx, {
    lead: {
      logo: 'sifted.svg',
      name: 'Sifted',
      text: '100 fastest-growing startups in the UK & Ireland by revenue, 2026',
    },
    rows: [
      { n: '$8m', label: 'Seed and pre-seed raised' },
      { n: '$1.4T+', label: 'In AUM, managed by the asset allocators who trust Eunice' },
      { n: 'Fintech 50', label: 'TechRound, 2026' },
    ],
  })}
  ${logoMarquee(ctx, 'partners')}
  ${investorsBlock(ctx)}
</section>

<section class="band--ink section" id="about"><div class="wrap intro">
  <p class="intro__lead">Due diligence and ongoing monitoring for private markets and digital assets. Trusted by 50+ institutions in the US, Europe and Asia.</p>
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

<section class="band section" id="trust"><div class="wrap">
  ${sectionHead('Security and Transparency, by Design')}
  ${facts([
    { art: 'shield', title: 'SOC 2 Type II', text: 'Audited; the report is available on request' },
    { art: 'lock', title: 'GDPR', text: 'Compliant, with a data processing agreement for every engagement' },
    {
      art: 'noTrain',
      title: 'No Training on Your Data',
      text: 'Your documents are never used to train models. They stay yours.',
    },
    { art: 'cite', title: 'Every Finding', text: 'Cited to the page it came from' },
  ])}
  <div class="buttons">
    ${button(ctx, { label: 'Our Trust Centre on Vanta', href: config.trustCenterUrl, newTab: true })}
    ${button(ctx, { label: 'How we handle security', kind: 'outline', to: 'security' })}
  </div>
</div></section>

<section class="wrap section">
  ${sectionHead('What the People Who Use It Say')}
  <div class="grid grid--3 quotes">
    ${quoteBlock(quotes.fof)}${quoteBlock(quotes.falconx)}${quoteBlock(quotes.zodia)}
  </div>
</section>

<section class="wrap section" id="team">
  ${sectionHead('Our Team')}
  ${teamGrid(ctx, teamPeople, {
    line: 'GTM for digital assets, client implementation for private markets, senior engineering.',
  })}
  <div class="buttons">${button(ctx, { label: 'Life at Eunice and all roles', kind: 'outline', to: 'careers' })}</div>
</section>

<section class="band section" id="why"><div class="wrap">
  ${sectionHead('So, Why “Eunice”?')}
  <div class="why">
    <p class="body muted">We get asked this a lot :)</p>
    <p class="body">In 1856, Eunice Newton Foote found the science behind the greenhouse effect. Then someone else got the credit for over a century. She did all this while raising two children, which makes it even more impressive.</p>
    <p class="body">We named the company after her because we want to do pioneering work in our industry and make sure good evidence gets the credit it deserves. We also liked that Eunice sounds less like software and more like a sharp, reliable colleague who’s always happy to help.</p>
  </div>
</div></section>

${insightsBlock(ctx, { label: 'Insights', featured: 3, rows: 5 })}

${cta(ctx, { demo: 'general' })}`,
} satisfies Page;

function tile(
  ctx: Ctx,
  { desk, title, text, visual }: { desk: ProductDesk; title: string; text: string; visual: Html },
) {
  return html`
<a class="tile tile--${desk}" href="${ctx.link(desk)}">
  <span class="tile__head">
    <span>
      <span class="tile__title">${mark(18, '#fff')}${title}</span>
      <span class="tile__text">${text}</span>
    </span>
    <span class="btn btn--light">Learn more</span>
  </span>
  <span class="tile__shot" aria-hidden="true">${visual}</span>
</a>`;
}
