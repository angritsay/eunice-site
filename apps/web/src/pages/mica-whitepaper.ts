// The MiCA Whitepaper page, ported from the live site (eunice.ai/mica-whitepaper).
// Its copy is kept word for word as it reads there, CTA labels included: this page is
// a deliberate exception to the "Talk to us" rule. The live page words three lines
// differently on tablet and phone, and so does this one (see byWidth). Change the copy
// on the live page first, then here. Layout and breakpoints follow the live page;
// styles are the .mica-* block in site.css.
import { button } from '../components.ts';
import { type Html, html } from '../lib/html.ts';
import type { Ctx, Page } from '../lib/types.ts';

const SLUG = 'mica-whitepaper';
const CALENDLY = 'https://calendly.com/mica-fpnq/mica-whitepaper';

/** Copy that reads differently by screen width, as it does on the live page. */
interface ByWidth {
  desktop: string;
  tablet: string;
  phone: string;
}
type Copy = string | ByWidth;

const WIDTHS = ['desktop', 'tablet', 'phone'] as const;

// One span per distinct wording, shown only at the widths that use it (.mica-v in
// site.css: desktop 1200 and up, tablet 810–1199, phone below 810).
const byWidth = (c: Copy): Html => {
  if (typeof c === 'string') return html`${c}`;
  const texts = [...new Set(WIDTHS.map((w) => c[w]))];
  return html`${texts.map((t) => {
    const cls = WIDTHS.filter((w) => c[w] === t)
      .map((w) => ` mica-v--${w[0]}`)
      .join('');
    return html`<span class="mica-v${cls}">${t}</span>`;
  })}`;
};

interface Img {
  file: string;
  width: number;
  height: number;
}

const WHY: { title: Copy; body: Copy; img: Img }[] = [
  {
    title: 'Speed & Precision',
    body: {
      desktop:
        'AI-optimised drafting cuts weeks of legal work into hours. Upload your data (we’re SOC 2 compliant) and export your whitepaper.',
      tablet: 'AI optimized preparation process from draft to submission',
      phone: 'AI optimized preparation process from draft to submission',
    },
    img: { file: 'why-speed.png', width: 1044, height: 1180 },
  },
  {
    title: 'Regulatory Ready Output',
    body: 'Native iXBRL export that validates against the ESMA taxonomy. No Excel workarounds, no XML debugging.',
    img: { file: 'why-output.png', width: 1064, height: 858 },
  },
  {
    title: 'Ongoing Compliance',
    body: 'Eunice monitors updates and includes 2 resubmissions in your first year.',
    img: { file: 'why-ongoing.png', width: 1064, height: 832 },
  },
  {
    title: { desktop: 'Legal Sign-Off Included', tablet: 'Security & Privacy', phone: 'Legal Sign-Off Included' },
    body: "Every whitepaper is reviewed by CMS - Europe's leading law firm.",
    img: { file: 'why-signoff.png', width: 1064, height: 344 },
  },
];

const STEPS: { title: string; points: [string, string]; bg: Img; shot: Img; shotClass: string }[] = [
  {
    title: 'Seamless Data Collection',
    points: ['Simple & Guided Checklist', 'Easy Documents Upload'],
    bg: { file: 'step1-bg.png', width: 1000, height: 667 },
    shot: { file: 'step1-collection.png', width: 1344, height: 832 },
    shotClass: 'mica-step__shot--80',
  },
  {
    title: 'MiCA Whitepaper Drafting',
    points: [
      "Whitepaper drafted in days to ESMA's MiCA requirements",
      'Reviewed and completed by a Eunice MiCA specialist to ensure quality',
    ],
    bg: { file: 'step2-bg.png', width: 1000, height: 667 },
    shot: { file: 'step2-drafting.png', width: 1891, height: 680 },
    shotClass: 'mica-step__shot--90',
  },
  {
    title: 'Legal Review by CMS',
    points: [
      'CMS legal review ensures MiCA compliance',
      'Integrated explanatory note on asset classification under MiCA',
    ],
    bg: { file: 'step3-bg.png', width: 1000, height: 667 },
    shot: { file: 'step3-cms.png', width: 1920, height: 975 },
    shotClass: 'mica-step__shot--logo',
  },
  {
    title: 'Export & Submit',
    points: ['Download PDF + native iXBRL format', 'We assist with the NCA submission package'],
    bg: { file: 'step4-bg.png', width: 1000, height: 667 },
    shot: { file: 'step4-submit.png', width: 1051, height: 892 },
    shotClass: 'mica-step__shot--76',
  },
];

const TRUST: { icon: string; title: string; body: string }[] = [
  {
    icon: 'globe.svg',
    title: 'Trust package, hosted',
    body: 'Publish at a verified Eunice address with your own logo, colours and wording.',
  },
  {
    icon: 'shield.svg',
    title: 'Verified once, reused everywhere',
    body: 'Institutions request access through Eunice - no more organising and re-sending the same data room.',
  },
  {
    icon: 'bolt.svg',
    title: 'Faster institutional review',
    body: 'Structured risk data and a full audit trail compress diligence from weeks to days.',
  },
];

const APPLY: { title: string; body: string }[] = [
  { title: 'Apply', body: 'Tell us about your project and token.' },
  { title: 'Verify', body: 'Eunice reviews your disclosures and structures the data.' },
  { title: 'Go live', body: 'Your Trust Center opens for institutional access.' },
];

// Every image here is decorative: the text next to it says what it shows.
const img = (ctx: Ctx, { file, width, height }: Img, cls: string): Html =>
  html`<img class="${cls}" src="${ctx.asset(`img/mica/${file}`)}" alt="" width="${width}" height="${height}" loading="lazy" decoding="async">`;

export default {
  slug: SLUG,
  nav: 'token-disclosure',
  title: 'MiCA Whitepaper Solution | Eunice AI',
  description:
    "Draft, format, and export regulator-ready MiCA whitepapers, including native iXBRL. Powered by AI and legal expertise from CMS, Europe's leading regulatory law firm.",
  render: (ctx) => html`
<section class="wrap mica-hero">
  <h1 class="mica-hero__title"><mark class="mica-mark">MiCA</mark> Whitepaper ${byWidth({ desktop: 'Solution', tablet: 'Solution', phone: 'Tool' })}</h1>
  <p class="mica-hero__sub">Draft, format, and export regulator-ready whitepapers, including native iXBRL. Powered by AI and legal expertise from CMS, Europe’s leading regulatory law firm.</p>
  <a class="btn btn--dark mica-btn" href="${CALENDLY}" target="_blank" rel="noopener noreferrer">Schedule a Call</a>
</section>

<section class="wrap mica-why" aria-labelledby="mica-why">
  <h2 class="mica-h2" id="mica-why">Why Issuers Love Us?</h2>
  <div class="mica-why__grid">
    ${WHY.map(
      (w) => html`
    <article class="mica-tile">
      <div class="mica-tile__art">${img(ctx, w.img, 'mica-tile__img')}</div>
      <h3 class="mica-tile__title">${byWidth(w.title)}</h3>
      <p class="mica-tile__body">${byWidth(w.body)}</p>
    </article>`,
    )}
  </div>
</section>

<section class="wrap mica-steps" aria-labelledby="mica-how">
  <h2 class="mica-h2" id="mica-how">How MiCA Whitepaper Solution Works</h2>
  <ol class="mica-steps__list">
    ${STEPS.map(
      (s, i) => html`
    <li class="mica-step${i % 2 ? ' mica-step--flip' : ''}">
      <div class="mica-step__text">
        <p class="mica-step__num">Step ${i + 1}</p>
        <h3 class="mica-step__title">${s.title}</h3>
        <ul class="mica-step__points">${s.points.map((p) => html`<li>${p}</li>`)}</ul>
      </div>
      <div class="mica-step__art">
        ${img(ctx, s.bg, 'mica-step__bg')}
        ${
          s.shotClass === 'mica-step__shot--logo'
            ? html`<div class="mica-step__logo">${img(ctx, s.shot, 'mica-step__logo-img')}</div>`
            : img(ctx, s.shot, `mica-step__shot ${s.shotClass}`)
        }
      </div>
    </li>`,
    )}
  </ol>
</section>

<section class="mica-trust" aria-labelledby="mica-trust"><div class="wrap">
  <h2 class="mica-trust__title" id="mica-trust">Turn your MiCA white paper into a <span class="mica-accent">Trust Center</span> institutions actually use</h2>
  ${button(ctx, { label: 'Get Your Trust Center', kind: 'light', small: true, form: 'token-disclosure', placement: 'band' })}
  <ul class="mica-trust__cards">
    ${TRUST.map(
      (t) => html`
    <li class="mica-trust__card">
      <img class="mica-trust__icon" src="${ctx.asset(`img/mica/${t.icon}`)}" alt="" width="28" height="28">
      <h3 class="mica-trust__card-title">${t.title}</h3>
      <p class="mica-trust__card-body">${t.body}</p>
    </li>`,
    )}
  </ul>
  <div class="mica-apply">
    <ol class="mica-apply__steps">
      ${APPLY.map((a) => html`<li><p class="mica-apply__title">${a.title}</p><p class="mica-apply__body">${a.body}</p></li>`)}
    </ol>
    <div class="mica-apply__cta">
      ${button(ctx, { label: 'Get Your Trust Center', small: true, form: 'token-disclosure', placement: 'closing' })}
      <p class="mica-apply__note">We usually reply within a day.</p>
    </div>
  </div>
</div></section>`,
} satisfies Page;
