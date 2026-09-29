import { button, cta, peopleStrip, plate, quoteBlock, sectionHead } from '../components.ts';
import { quotes, team } from '../content/index.ts';
import { html } from '../lib/html.ts';
import type { Page } from '../lib/types.ts';
import config from '../site.config.ts';
import { roleList } from './jobs.ts';

export default {
  slug: 'careers',
  nav: 'company',
  title: 'Careers at Eunice — We build the accountability layer',
  description: team.standfirst,
  render: (ctx) => html`
<section class="wrap hero">
  <div class="hero__text">
    <p class="kicker">Careers</p>
    <h1 class="h1">${team.headline}</h1>
    <p class="lead">${team.standfirst}</p>
    <div class="buttons">
      ${button(ctx, { label: 'See the roles', to: 'careers', hash: 'roles' })}
      ${button(ctx, { label: 'Meet the team', kind: 'outline', to: 'careers', hash: 'team' })}
    </div>
  </div>
  <div class="hero__visual">${plate(ctx, { img: 'careers-hero.png', alt: 'Asking Eunice about a fund' })}</div>
</section>

<section class="wrap section" id="roles">
  ${sectionHead('Open roles', team.hiring)}
  ${roleList(ctx)}
</section>

<section class="wrap section" id="story"><div class="story">
  <div>
    <p class="kicker">Our story</p>
    <h2 class="h2">${team.storyTitle}</h2>
    <p class="small muted">${team.founded}</p>
  </div>
  <div>${team.story.map((p) => html`<p class="body">${p}</p>`)}</div>
</div></section>

<section class="band section"><div class="wrap">
  ${sectionHead(team.perksTitle)}
  <div class="grid grid--3 perks">
    ${team.perks.map((p) => html`<div class="fact"><p class="h4">${p.title}</p><p class="small muted">${p.text}</p></div>`)}
  </div>
</div></section>

<section class="wrap section" id="team">
  ${sectionHead('Who you will work with', team.intro)}
  ${peopleStrip(ctx, ['yi', 'philip', 'petronela', 'vinay', 'chrislyn', 'ana', 'riley'])}
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
    <p>Eunice Newton Foote, 1819–1888, scientist and campaigner for women’s rights. In 1856 she showed that carbon dioxide traps heat, the first person to connect it to the Earth’s temperature. Someone else took the credit; her result was overlooked until 2011.</p>
    <p>We took her name because the finding sat in plain sight for a hundred and fifty years and nobody read it carefully. That is the failure this company exists to prevent.</p>
  </div>
</section>`,
} satisfies Page;
