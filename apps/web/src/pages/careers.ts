import type { Art } from '../art.ts';
import { button, cta, facts, plate, quoteBlock, sectionHead, teamGrid } from '../components.ts';
import { quotes, team, teamPeople } from '../content/index.ts';
import { html } from '../lib/html.ts';
import type { Page } from '../lib/types.ts';
import config from '../site.config.ts';
import { uiAsk } from '../ui.ts';
import { roleList } from './jobs.ts';

// The perks' drawings, in the order team.perks lists them: AI that matters, London and
// remote, time off, pay and equity, the people, health and learning.
const PERK_ART: readonly Art[] = ['cite', 'globe', 'date', 'seed', 'roles', 'library'];

export default {
  slug: 'careers',
  nav: 'company',
  title: 'Careers at Eunice — We Build the Accountability Layer',
  description: team.standfirst,
  render: (ctx) => html`
<section class="wrap hero">
  <div class="hero__text">
    <h1 class="h1">${team.headline}</h1>
    <p class="lead">${team.standfirst}</p>
    <div class="buttons">
      ${button(ctx, { label: 'See the roles', to: 'careers', hash: 'roles' })}
      ${button(ctx, { label: 'Meet the team', kind: 'outline', to: 'careers', hash: 'team' })}
    </div>
  </div>
  <div class="hero__visual">${plate(ctx, { html: uiAsk('company') })}</div>
</section>

<section class="wrap section" id="roles">
  ${sectionHead('Open Roles')}
  ${roleList(ctx)}
</section>

<section class="wrap section" id="story"><div class="story">
  <div>
    <h2 class="h2">${team.storyTitle}</h2>
    <p class="small muted">${team.founded}</p>
  </div>
  <div>${team.story.map((p) => html`<p class="body">${p}</p>`)}</div>
</div></section>

<section class="band section"><div class="wrap">
  ${sectionHead(team.perksTitle)}
  ${facts(
    team.perks.map((p, i) => ({ ...p, art: PERK_ART[i] ?? 'cite' })),
    3,
  )}
</div></section>

<section class="wrap section" id="team">
  ${sectionHead('Who You Will Work With')}
  ${teamGrid(ctx, teamPeople)}
</section>

<section class="band section"><div class="wrap">
  ${sectionHead('What Clients Say')}
  <div class="grid grid--2 quotes">${quoteBlock(quotes.falconx)}${quoteBlock(quotes.zodia)}</div>
</div></section>

${cta(ctx, {
  buttons: [
    { label: 'Email the team', kind: 'outline', href: `mailto:${config.careersEmail}` },
    { label: 'See the roles', kind: 'dark', to: 'careers', hash: 'roles' },
  ],
})}

<section class="wrap section feature feature--flat foote">
  <div class="feature__text"><h2 class="h2">Named After Eunice Foote</h2></div>
  <div class="foote__text body">
    <p>Eunice Newton Foote, 1819–1888, scientist and campaigner for women’s rights. In 1856 she showed that carbon dioxide traps heat, the first person to connect it to the Earth’s temperature. Someone else took the credit; her result was overlooked until 2011.</p>
    <p>We took her name because the finding sat in plain sight for a hundred and fifty years and nobody read it carefully. That is the failure this company exists to prevent.</p>
  </div>
</section>`,
} satisfies Page;
