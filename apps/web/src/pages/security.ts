// The Security page, ported from the live site (eunice.ai/security). Its copy is kept
// word for word as it reads there. Layout follows the live page; styles are the .sec-*
// block in site.css.
import { html } from '../lib/html.ts';
import type { Page } from '../lib/types.ts';

const CARDS: { icon: string; title: string; body: string }[] = [
  {
    icon: 'chart.svg',
    title: 'Security and Privacy by Design',
    body: 'Eunice is built from the ground up with enterprise-grade security, following industry best practices to protect your sensitive data.',
  },
  {
    icon: 'database.svg',
    title: 'Your Data Belongs to You',
    body: 'We never train AI models on your proprietary information, ensuring your data remains exclusively yours.',
  },
  {
    icon: 'bug.svg',
    title: 'Compliance You Can Trust',
    body: 'Committed to meeting and exceeding rigorous standards like SOC2, Eunice proactively safeguards your data privacy and security.',
  },
  {
    icon: 'copy.svg',
    title: 'Transparency First',
    body: 'Our platform fosters clarity and compliance, providing full transparency into how your data is handled and protected.',
  },
];

export default {
  slug: 'security',
  nav: 'company',
  title: 'AI For Due Diligence that cannot afford to be wrong',
  description:
    'Eunice is the accountability layer between AI and your decision. Purpose-built guardrails, validated outputs, and a continuously maintained standard of best practice, so your team moves faster without compromising governance.',
  render: (ctx) => {
    const icon = (file: string, cls: string, w: number, h: number) =>
      html`<img class="${cls}" src="${ctx.asset(`img/security/${file}`)}" alt="" width="${w}" height="${h}">`;
    return html`
<section class="wrap sec-hero">
  <h1 class="sec-hero__title">Privacy and Security<br> is our core <mark class="mica-mark">at Eunice</mark></h1>
  <p class="sec-hero__lead">Eunice safeguards your data with <strong>enterprise-grade privacy</strong>, <strong>ironclad compliance</strong>, and <strong>zero-tolerance security protocols</strong> — engineered for trust at every layer.</p>
</section>

<section class="wrap sec-cards" aria-label="How Eunice protects your data">
  ${CARDS.map(
    (c) => html`
  <article class="sec-card">
    <span class="sec-card__icon">${icon(c.icon, 'sec-card__icon-img', 18, 20)}</span>
    <h2 class="sec-card__title">${c.title}</h2>
    <p class="sec-card__body">${c.body}</p>
  </article>`,
  )}
</section>

<section class="sec-compliance" aria-labelledby="sec-compliance"><div class="wrap">
  <h2 class="sec-compliance__title" id="sec-compliance">Compliant with Industry</h2>
  <p class="sec-compliance__sub">From SOC2 to GDPR, we proactively uphold global compliance frameworks.</p>
  <ul class="sec-badges">
    <li class="sec-badge">
      <span class="sec-badge__art sec-soc2"><span class="sec-soc2__org">AICPA</span><span class="sec-soc2__name">SOC2</span></span>
      <span class="sec-badge__name">SOC2 II</span>
    </li>
    <li class="sec-badge">
      <span class="sec-badge__art sec-gdpr">${icon('gdpr-stars.svg', 'sec-gdpr__stars', 120, 120)}<span class="sec-gdpr__name">GDPR</span></span>
      <span class="sec-badge__name">GDPR</span>
    </li>
    <li class="sec-badge">
      <span class="sec-badge__art">${icon('lock.svg', 'sec-badge__lock', 42, 54)}</span>
      <span class="sec-badge__name">Encrypted data</span>
    </li>
    <li class="sec-badge">
      <span class="sec-badge__art">${icon('no-training.svg', 'sec-badge__svg', 120, 120)}</span>
      <span class="sec-badge__name">No training<br> on user data</span>
    </li>
  </ul>
</div></section>`;
  },
} satisfies Page;
