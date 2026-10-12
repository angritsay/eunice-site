import { bullets, button, cta, facts, sectionHead } from '../components.ts';
import { html } from '../lib/html.ts';
import type { Page } from '../lib/types.ts';

const DESK = 'token-disclosure';

export default {
  slug: `${DESK}/register`,
  nav: DESK,
  title: 'The Register — Eunice Token Disclosure',
  description:
    'Every white paper Eunice has notified, hosted on a public page, so an exchange or a counterparty can read what an issuer published without asking for it.',
  render: (ctx) => html`
<section class="wrap hero hero--short">
  <div class="hero__text">
    <h1 class="h1">The Register</h1>
    <p class="lead">Every white paper we notify is hosted here. An exchange, a counterparty or an authority can read what an issuer published, and at what address, without asking the issuer for a copy.</p>
    <div class="buttons">
      ${button(ctx, { label: 'Start a white paper', form: DESK, placement: 'hero' })}
      ${button(ctx, { label: 'Token Disclosure', kind: 'outline', to: DESK })}
    </div>
  </div>
</section>

<section class="wrap section" id="entry">
  ${sectionHead('What an Entry Carries')}
  ${facts(
    [
      { art: 'library', title: 'The Paper', text: 'The notified white paper as it stands, at a fixed public address' },
      { art: 'tag', title: 'The Issuer', text: 'Who filed it, and the token it covers' },
      { art: 'globe', title: 'The Jurisdiction', text: 'Which regime it was notified under, and to which authority' },
      { art: 'date', title: 'The Date', text: 'When it was notified' },
    ],
    2,
  )}
</section>

<section class="band section" id="listing"><div class="wrap">
  ${sectionHead('Published Papers')}
  <p class="body placeholder">[The listing is not wired up yet. It will be generated from the papers Eunice has notified, and nothing appears here until it is — see the note in the README.]</p>
</div></section>

<section class="wrap section" id="how">
  ${sectionHead('Why It Is Public')}
  ${bullets(
    [
      'A listing team reads the paper at its address rather than as an attachment forwarded through a thread.',
      'The page carries the paper as it stands, so what is read is what is true today.',
      'The issuer files once and points everyone at the same place, instead of answering the same request again for every exchange that asks.',
    ],
    DESK,
  )}
</section>

${cta(ctx, {
  demo: DESK,
  buttons: [{ label: 'Start a white paper', kind: 'outline', form: DESK }],
})}`,
} satisfies Page;
