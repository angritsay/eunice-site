import { insights, desks } from '../content/index.js';
import { insightRow } from '../components.js';

export default {
  slug: 'insights',
  nav: 'company',
  title: 'Insights — Eunice',
  description: 'Notes, analysis and company news from the Eunice desks.',
  render: (ctx) => {
    const list = [...insights].sort((a, b) => (a.date < b.date ? 1 : -1));
    const count = (d) => list.filter((i) => i.desk === d).length;
    const chip = (key, label, n) =>
      `<button type="button" class="chip${key === 'all' ? ' is-on' : ''}${key !== 'all' ? ` chip--${key}` : ''}" data-filter="${key}" aria-pressed="${key === 'all'}">${label} <span>${n}</span></button>`;
    return `
<section class="wrap hero hero--short">
  <div class="hero__text">
    <h1 class="h1">Insights</h1>
    <p class="lead">Notes, analysis and company news, written by the people who run each desk.</p>
  </div>
</section>
<section class="wrap section section--tight" data-insights>
  <div class="chips" role="toolbar" aria-label="Filter by desk">
    ${chip('all', 'All', list.length)}
    ${Object.keys(desks).map((d) => chip(d, desks[d].label, count(d))).join('')}
  </div>
  <ul class="irows irows--index">${list.map((i) => insightRow(ctx, i)).join('')}</ul>
  <p class="empty muted" hidden>Nothing published on this desk yet.</p>
</section>`;
  },
};
