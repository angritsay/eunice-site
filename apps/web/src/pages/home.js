import { quotes } from '../content/index.js';
import {
  esc, mark, button, sectionHead, audiences, facts, quoteBlock, partnersRow, plate,
  insightsBlock, eventsBlock, peopleGrid, cta,
} from '../components.js';

export default {
  slug: '',
  nav: 'company',
  title: 'Eunice — Due diligence for regulated finance',
  description: 'Every output sourced, checked, and monitored, across disclosure and risk assessment.',
  render: (ctx) => `
<section class="wrap hero">
  <div class="hero__text">
    <h1 class="h1">Due diligence<br>for regulated finance.</h1>
    <p class="lead">Every output sourced, checked, and monitored, across disclosure and risk assessment.</p>
    <div class="buttons">
      ${button(ctx, { label: 'Talk to us', form: 'general', placement: 'hero' })}
      ${button(ctx, { label: 'See how it works', kind: 'outline', to: '', hash: 'products' })}
    </div>
  </div>
  <div class="hero__visual">${plate(ctx, { img: 'home-hero.png', alt: 'The Eunice pipeline view', bleed: true })}</div>
</section>

<section class="wrap section tiles" id="products">
  ${tile(ctx, {
    desk: 'private-markets', title: 'Private Markets', img: 'home-tile-pm.png',
    text: 'Operational due diligence and portfolio monitoring for LPs, asset owners, fund managers and family offices.',
  })}
  ${tile(ctx, {
    desk: 'digital-assets', title: 'Digital Assets', img: 'home-tile-da.png',
    text: 'Token due diligence, monitoring and MiCA disclosure for exchanges, custodians, market makers and issuers.',
  })}
</section>

<section class="band section" id="who"><div class="wrap">
  ${sectionHead('Who we build for')}
  ${audiences(ctx, [
    { desk: 'private-markets', title: 'LPs and asset owners', text: 'An agent does the messy work, chasing the data down and checking it’s right. IDD, ODD, and monitoring.', to: 'private-markets/lps' },
    { desk: 'private-markets', title: 'Fund managers', text: 'The same ODD questionnaire, asked eleven ways, by eleven different LPs.', to: 'private-markets/managers' },
    { desk: 'private-markets', title: 'Family offices', text: 'Run the diligence of a full team, whatever the size of yours. Fewer people, same rigor, better decisions.', to: 'private-markets/family-offices' },
    { desk: 'digital-assets', title: 'Exchanges', text: 'A listing queue that grows faster than the team reviewing it.', to: 'digital-assets/exchanges' },
    { desk: 'digital-assets', title: 'Custodians and market makers', text: 'You hold the asset. You are the last to hear when something moves.', to: 'digital-assets/custodians' },
    { desk: 'token-disclosure', title: 'Issuers and their counsel', text: 'A white paper that has to be accepted once, and stay true after that.', to: 'token-disclosure' },
  ])}
</div></section>

<section class="wrap section">
  ${sectionHead('What the people who use it say')}
  <div class="grid grid--3 quotes quotes--tinted">
    ${quoteBlock(quotes.fof)}${quoteBlock(quotes.falconx)}${quoteBlock(quotes.zodia)}
  </div>
  ${facts([
    { title: 'SOC 2 Type II', text: 'Audited; GDPR compliant; no training on client data' },
    { title: 'Fintech 50', text: 'Named in May 2026; among the 100 fastest-growing startups in the UK and Ireland' },
    { title: '$8m seed', text: 'March 2026 · Moonfire, Speedinvest, Openspace Capital, Locus Ventures' },
    { title: 'FCA regulatory sandbox', text: 'Digital asset disclosure standards, since November 2025' },
  ])}
  ${partnersRow()}
</section>

${insightsBlock(ctx, { label: 'Insights', aside: 'Notes, analysis and company news, by desk.', featured: 3, rows: 5, band: false })}

${eventsBlock(ctx, { label: 'Where we have been', aside: 'Talks, panels and delegations.', pastOnly: true, today: ctx.today })}

<section class="wrap section" id="team">
  ${sectionHead('Leadership', 'The people who run the desk, and the company.')}
  ${peopleGrid(ctx, ['petronela', 'yi', 'philip', 'chrislyn'])}
</section>

${cta(ctx, {
  title: 'Bring us the fund, or the token, you are reviewing now',
  text: 'A thirty-minute call with the desk that would run it. We show you what Eunice reads and what it returns; you decide.',
  buttons: [{ label: 'Talk to us', kind: 'light', form: 'general' }],
})}`,
};

function tile(ctx, { desk, title, text, img }) {
  return `
<a class="tile tile--${desk}" href="${ctx.link(desk)}">
  <span class="tile__shot"><img src="${ctx.asset('img/' + img)}" alt="" loading="lazy"></span>
  <span class="tile__foot">
    <span>
      <span class="tile__title">${mark(18, '#fff')}${esc(title)}</span>
      <span class="tile__text">${esc(text)}</span>
    </span>
    <span class="btn btn--light">Learn more</span>
  </span>
</a>`;
}
