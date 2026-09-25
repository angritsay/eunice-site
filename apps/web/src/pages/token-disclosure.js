import {
  button, sectionHead, audiences, audienceCards, facts, plate, feature,
  insightsBlock, cta, mark,
} from '../components.js';

const DESK = 'token-disclosure';

export default {
  slug: DESK,
  nav: DESK,
  title: 'Eunice Token Disclosure — MiCA white papers, notified and hosted',
  description: 'A MiCA white paper drafted from a library of 1,000+ pre-filled papers, reviewed by CMS where a legal opinion is needed, notified to the authority and hosted on a public page.',
  render: (ctx) => `
<section class="wrap hero">
  <div class="hero__text">
    <p class="kicker desk-text--${DESK}">For issuers, their counsel, and the exchanges that list them</p>
    <h1 class="h1">A white paper accepted once, and true after that</h1>
    <p class="lead">A MiCA white paper drafted from a library of 1,000+ pre-filled papers, reviewed by CMS where a legal opinion is needed, notified to the authority, and hosted on a public page any exchange can check.</p>
    <p class="lead">UK token classification with gunnercooke since July 2026.</p>
    <div class="buttons">
      ${button(ctx, { label: 'Start a white paper', talk: DESK })}
      ${button(ctx, { label: 'The register', kind: 'outline', to: `${DESK}/register` })}
    </div>
  </div>
  <div class="hero__visual">${plate(ctx, { img: 'da-token-disclosure.png', alt: 'A hosted MiCAR white paper', tint: DESK, bleed: true })}</div>
</section>

<section class="band section" id="who"><div class="wrap">
  ${sectionHead('Who we build for', 'Pick the one that sounds like your week.')}
  ${audiences(ctx, audienceCards(DESK))}
</div></section>

<section class="wrap section">
  ${facts([
    { title: 'FCA regulatory sandbox', text: 'Digital asset disclosure standards, since November 2025' },
    { title: 'Reviewed by CMS', text: 'Where a legal opinion is needed' },
    { title: 'gunnercooke', text: 'UK token classification, since July 2026' },
    { title: '1,000+ pre-filled papers', text: 'The library a new white paper is drafted from' },
  ])}
</section>

${feature({
  id: 'draft', num: '01', title: 'Drafted from the library', desk: DESK,
  body: '<p class="body muted">A MiCA white paper drafted from 1,000+ pre-filled papers, so the starting point is a document that has already been through the regime rather than a blank page.</p>',
  visual: plate(ctx, { img: 'da-token-disclosure.png', alt: 'A MiCAR white paper drafted from the library', tint: DESK }),
})}

${feature({
  id: 'review', num: '02', title: 'Reviewed where it counts', desk: DESK, flip: true,
  body: '<p class="body muted">CMS reviews the points that need a legal opinion, rather than a legal bill for the whole document. UK token classification runs with gunnercooke.</p>',
  visual: plate(ctx, { img: 'da-jurisdiction.png', alt: 'Audit history on a disclosure document', tint: DESK }),
})}

${feature({
  id: 'notify', num: '03', title: 'Notified, then hosted', desk: DESK,
  body: '<p class="body muted">Notified to the authority and published to the register, so there is one address for the version that stands and nobody has to email an attachment to prove it.</p>',
  visual: `<ol class="steps steps--${DESK}">
    <li><span class="h4">Draft</span><span class="small muted">From the library, in the shape the regime asks for.</span></li>
    <li><span class="h4">Review</span><span class="small muted">CMS on the points that need an opinion.</span></li>
    <li><span class="h4">Notify</span><span class="small muted">Filed with the authority for the jurisdiction.</span></li>
    <li><span class="h4">Host</span><span class="small muted">Published to the register, open to anyone.</span></li>
  </ol>`,
})}

<section class="band band--td section" id="register"><div class="wrap feature feature--flat">
  <div class="feature__text">
    <h2 class="h2 td-title">${mark(21, '#b27a14')}The register</h2>
    <p class="body">Every paper we notify is hosted on a public page. An exchange, a counterparty or an authority can read what an issuer published without asking the issuer for it.</p>
    <div class="buttons">${button(ctx, { label: 'See the register', to: `${DESK}/register` })}</div>
  </div>
  <div class="feature__visual">${plate(ctx, { img: 'da-listing.png', alt: 'Hosted disclosure documents', tint: DESK })}</div>
</div></section>

${insightsBlock(ctx, {
  label: 'Insights on token disclosure', aside: 'Regulation and disclosure, as they change.',
  deskFilter: [DESK], featured: 1, rows: 4, band: false,
})}

${cta(ctx, {
  title: 'Start a white paper',
  text: 'Tell us about the token and the jurisdiction. We will show you the draft the library produces, and what would still need an opinion.',
  buttons: [
    { label: 'The register', kind: 'outline-light', to: `${DESK}/register` },
    { label: 'Start a white paper', kind: 'light', talk: DESK },
  ],
})}`,
};
