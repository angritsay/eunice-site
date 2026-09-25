import { button, cta, peopleGrid, plate, quoteBlock, sectionHead } from '../components.ts';
import { quotes, roles } from '../content/index.ts';
import { html } from '../lib/html.ts';
import type { Page } from '../lib/types.ts';
import config from '../site.config.ts';

export default {
  slug: 'careers',
  nav: 'company',
  title: 'Careers at Eunice — We build the accountability layer',
  description:
    'Your code, your calls and your memos ship into regulated financial workflows — where every output has to be defensible. London, remote-friendly.',
  render: (ctx) => html`
<section class="wrap hero">
  <div class="hero__text">
    <p class="kicker">Careers</p>
    <h1 class="h1">We build the accountability layer</h1>
    <p class="lead">Your code, your calls and your memos ship into regulated financial workflows — where every output has to be defensible. London, remote-friendly.</p>
    <div class="buttons">
      ${button(ctx, { label: 'See the roles', to: 'careers', hash: 'roles' })}
      ${button(ctx, { label: 'Meet the team', kind: 'outline', to: 'careers', hash: 'team' })}
    </div>
  </div>
  <div class="hero__visual">${plate(ctx, { img: 'careers-hero.png', alt: 'Asking Eunice about a fund', bleed: true })}</div>
</section>

<section class="wrap section" id="roles">
  ${sectionHead('Open roles', 'Three seats, all in London with remote days.')}
  <ul class="roles">${roles.map(
    (r) => html`
    <li class="role">
      <h3 class="h4"><a href="${ctx.link(`careers/${r.slug}`)}">${r.title}</a></h3>
      <span class="caption muted">${r.where}</span>
      <p class="small">${r.what}</p>
      ${button(ctx, { label: 'Apply', small: true, href: r.applyUrl, newTab: true })}
    </li>`,
  )}
  </ul>
</section>

<section class="band section"><div class="wrap">
  ${sectionHead('How we work')}
  <div class="grid grid--3 perks">
    ${[
      [
        'London-based, remote-friendly',
        'A desk in London and regular gatherings for the people who are not there every day.',
      ],
      ['Material equity', 'Competitive compensation and a real stake in a company that raised its seed in March 2026.'],
      [
        'Time off that is actually taken',
        'Generous leave and flexibility; the work is intense enough without pretending otherwise.',
      ],
      ['A health plan', 'For you, from day one.'],
      ['A learning budget and your equipment', 'Books, courses, conferences; the laptop you want.'],
      ['Founders who have done it before', 'You will sit next to the people who wrote the first version.'],
    ].map(([t, d]) => html`<div class="fact"><p class="h4">${t}</p><p class="small muted">${d}</p></div>`)}
  </div>
</div></section>

<section class="wrap section" id="team">
  ${sectionHead('Who you will work with', 'People who run the company.')}
  ${peopleGrid(ctx, ['yi', 'philip', 'petronela', 'vinay', 'chrislyn'], 'portrait')}
</section>

<section class="band section"><div class="wrap">
  ${sectionHead('What clients say')}
  <div class="grid grid--2 quotes">${quoteBlock(quotes.falconx)}${quoteBlock(quotes.zodia)}</div>
</div></section>

${cta(ctx, {
  title: 'Your role is not listed?',
  text: `Write to ${config.careersEmail} with a CV or a link to something you built, and two lines on why regulated finance. We answer everyone.`,
  buttons: [
    { label: 'Email the team', kind: 'outline-light', href: `mailto:${config.careersEmail}` },
    { label: 'See the roles', kind: 'light', to: 'careers', hash: 'roles' },
  ],
})}

<section class="wrap section feature feature--flat foote">
  <div class="feature__text"><h2 class="h2">Named after Eunice Foote</h2></div>
  <div class="foote__text body">
    <p>Eunice Newton Foote, 1819–1888. Scientist, inventor, campaigner for women’s rights, mother of two daughters. In 1856 she filled glass cylinders with different gases, set them in the sun and read the thermometers. The cylinder of carbon dioxide ran hottest, and she wrote that an atmosphere with more of it would give the Earth a higher temperature — the first person to make that connection. Her paper was read at the meeting by a colleague; a man who published three years later took the credit; her result was overlooked until 2011.</p>
    <p>We took her name because the finding sat in plain sight for a hundred and fifty years and nobody read it carefully. That is the failure this company exists to prevent.</p>
  </div>
</section>`,
} satisfies Page;
