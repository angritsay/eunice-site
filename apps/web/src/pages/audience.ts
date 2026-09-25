// One template behind every personalised client-type page.
// The pages themselves are data: see `audiencePages` in ../content/index.ts.
// Nothing here holds copy for a single audience — only what a whole desk shares.

import type { InsightsBlockOptions } from '../components.ts';
import { bullets, button, cta, facts, insightsBlock, plate, quoteBlock, sectionHead } from '../components.ts';
import { audiencePages, desks, quotes } from '../content/index.ts';
import type { AudiencePage, Quote } from '../content/schema.ts';
import { html } from '../lib/html.ts';
import type { Ctx, Page, ProductDesk } from '../lib/types.ts';

interface DeskShared {
  hero: { img: string; alt: string };
  facts: { title: string; text: string }[];
  quote: Quote | null;
  insights: Pick<InsightsBlockOptions, 'label' | 'aside' | 'deskFilter'>;
}

// What every audience page on a desk has in common: its imagery, the trust
// markers it closes on, its quote and which insights it lists.
const DESK: Record<ProductDesk, DeskShared> = {
  'private-markets': {
    hero: { img: 'home-hero.png', alt: 'Pipeline: five funds, one in tracking' },
    facts: [
      { title: 'SOC 2 Type II', text: 'Audited; the report is available on request' },
      { title: 'GDPR', text: 'Compliant, with a data processing agreement for every engagement' },
      { title: 'No training on your data', text: 'Your documents are never used to train models. They stay yours.' },
      { title: 'Every finding', text: 'Cited to the page it came from' },
    ],
    quote: quotes.fof,
    insights: {
      label: 'Insights for private markets',
      aside: 'Written by the people who run the desk.',
      deskFilter: ['private-markets'],
    },
  },
  'digital-assets': {
    hero: { img: 'da-hero.png', alt: 'Due diligence reports, searching for a token' },
    facts: [
      { title: 'FCA regulatory sandbox', text: 'Digital asset disclosure standards, since November 2025' },
      { title: 'SOC 2 Type II', text: 'Audited; GDPR compliant' },
      { title: 'Five sources, one view', text: 'Allium, CoinGecko, CoinMarketCap, DeFiLlama and X, cited by name' },
      { title: '4 jurisdictions', text: 'MiCA, the UK regime, MAS and VARA' },
    ],
    quote: quotes.falconx,
    insights: {
      label: 'Insights on digital assets',
      aside: 'Exploits, risk and regulation, as they happen.',
      deskFilter: ['digital-assets', 'token-disclosure'],
    },
  },
  'token-disclosure': {
    hero: { img: 'da-token-disclosure.png', alt: 'A hosted MiCAR white paper' },
    facts: [
      { title: 'FCA regulatory sandbox', text: 'Digital asset disclosure standards, since November 2025' },
      { title: 'Reviewed by CMS', text: 'Where a legal opinion is needed' },
      { title: 'gunnercooke', text: 'UK token classification, since July 2026' },
      { title: '1,000+ pre-filled papers', text: 'The library a new white paper is drafted from' },
    ],
    // No client quote on this desk yet; the section is left out until there is one.
    quote: null,
    insights: {
      label: 'Insights on token disclosure',
      aside: 'Regulation and disclosure, as they change.',
      deskFilter: ['token-disclosure'],
    },
  },
};

// Turn one entry from the content file into a page the build can write.
function page(a: AudiencePage): Page {
  const d = DESK[a.desk];
  const label = desks[a.desk].label;
  return {
    slug: `${a.desk}/${a.id}`,
    nav: a.desk,
    // Recorded with any form sent from this page: the lead arrives saying which client type it came from.
    audience: a.id,
    title: a.title,
    description: a.description,
    render: (ctx: Ctx) => html`
<section class="wrap hero">
  <div class="hero__text">
    <p class="kicker desk-text--${a.desk}">${label}</p>
    <h1 class="h1">${a.h1}</h1>
    <p class="lead">${a.lead}</p>
    <div class="buttons">
      ${button(ctx, { label: 'Talk to us', form: a.desk, placement: 'hero' })}
      ${button(ctx, { label: `All of ${label}`, kind: 'outline', to: a.desk })}
    </div>
  </div>
  <div class="hero__visual">${plate(ctx, { img: d.hero.img, alt: d.hero.alt, bleed: true })}</div>
</section>

<section class="band section"><div class="wrap">
  ${sectionHead('What this looks like now', 'The week we hear described most often.')}
  ${bullets(a.now, a.desk)}
</div></section>

<section class="wrap section">
  ${sectionHead('What Eunice does', 'Three things, in the order they happen.')}
  <ol class="steps steps--${a.desk}">
    ${a.work.map((w) => html`<li><span class="h4">${w.title}</span><span class="small muted">${w.text}</span></li>`)}
  </ol>
</section>

<section class="wrap section">
  ${facts(d.facts, 2)}
  ${d.quote ? html`<div class="grid grid--1 quotes">${quoteBlock(d.quote)}</div>` : ''}
</section>

${insightsBlock(ctx, { ...d.insights, featured: 1, rows: 2 })}

${cta(ctx, {
  title: a.cta.title,
  text: a.cta.text,
  buttons: [{ label: 'Talk to us', kind: 'light', form: a.desk }],
})}`,
  };
}

export default audiencePages.map(page);
