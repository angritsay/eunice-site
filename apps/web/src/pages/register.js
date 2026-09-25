import { button, sectionHead, facts, bullets, cta } from '../components.js';

const DESK = 'token-disclosure';

export default {
  slug: `${DESK}/register`,
  nav: DESK,
  title: 'The register — Eunice Token Disclosure',
  description: 'Every white paper Eunice has notified, hosted on a public page, so an exchange or a counterparty can read what an issuer published without asking for it.',
  render: (ctx) => `
<section class="wrap hero hero--short">
  <div class="hero__text">
    <p class="kicker desk-text--${DESK}">Token Disclosure</p>
    <h1 class="h1">The register</h1>
    <p class="lead">Every white paper we notify is hosted here. An exchange, a counterparty or an authority can read what an issuer published, and at what address, without asking the issuer for a copy.</p>
    <div class="buttons">
      ${button(ctx, { label: 'Start a white paper', talk: DESK })}
      ${button(ctx, { label: 'Token Disclosure', kind: 'outline', to: DESK })}
    </div>
  </div>
</section>

<section class="wrap section" id="entry">
  ${sectionHead('What an entry carries', 'The same fields for every paper, so two can be compared.')}
  ${facts([
    { title: 'The paper', text: 'The notified white paper as it stands, at a fixed public address' },
    { title: 'The issuer', text: 'Who filed it, and the token it covers' },
    { title: 'The jurisdiction', text: 'Which regime it was notified under, and to which authority' },
    { title: 'The date', text: 'When it was notified' },
  ], 2)}
</section>

<section class="band section" id="listing"><div class="wrap">
  ${sectionHead('Published papers', 'Newest first.')}
  <p class="body placeholder">[The listing is not wired up yet. It will be generated from the papers Eunice has notified, and nothing appears here until it is — see the note in the README.]</p>
</div></section>

<section class="wrap section" id="how">
  ${sectionHead('Why it is public', 'A disclosure nobody can find is not a disclosure.')}
  ${bullets([
    'A listing team reads the paper at its address rather than as an attachment forwarded through a thread.',
    'The page carries the paper as it stands, so what is read is what is true today.',
    'The issuer files once and points everyone at the same place, instead of answering the same request in eleven formats.',
  ], DESK)}
</section>

${cta(ctx, {
  title: 'Put a paper on the register',
  text: 'Tell us about the token and the jurisdiction. We will show you the draft the library produces, what would still need an opinion, and where it would be hosted.',
  buttons: [{ label: 'Start a white paper', kind: 'light', talk: DESK }],
})}`,
};
