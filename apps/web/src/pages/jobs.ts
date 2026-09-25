// One page per open role, at careers/<slug>/ as on eunice.ai. The description is the
// live text, word for word, imported by scripts/import-live.ts into content/jobs/;
// applying happens on the role's own application form.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { z } from 'zod';
import { button, cta } from '../components.ts';
import { roles } from '../content/index.ts';
import { html } from '../lib/html.ts';
import { richText } from '../lib/rich-text.ts';
import type { Page } from '../lib/types.ts';
import config from '../site.config.ts';

const DIR = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'content', 'jobs');
const Imported = z.strictObject({ title: z.string().min(1), team: z.string().min(1) });

const read = (file: string) => fs.readFileSync(path.join(DIR, file), 'utf8');

export default roles.map((role) => {
  const live = Imported.parse(JSON.parse(read(`${role.slug}.json`)));
  const body = read(`${role.slug}.html`);
  return {
    slug: `careers/${role.slug}`,
    nav: 'company',
    title: `${live.title} — Careers at Eunice`,
    description: role.what,
    render: (ctx) => html`
<section class="wrap hero hero--short">
  <div class="hero__text">
    <nav class="crumbs" aria-label="Breadcrumb"><a href="${ctx.link('careers')}">Careers</a><span aria-hidden="true">/</span><span aria-current="page">${live.title}</span></nav>
    <p class="kicker">${live.team}</p>
    <h1 class="h1">${live.title}</h1>
    <div class="buttons">
      ${button(ctx, { label: 'Apply', href: role.applyUrl, newTab: true })}
      ${button(ctx, { label: 'All roles', kind: 'outline', to: 'careers', hash: 'roles' })}
    </div>
  </div>
</section>

<section class="wrap section section--tight">
  <div class="prose body">${richText(ctx, body, `content/jobs/${role.slug}.html`)}</div>
</section>

${cta(ctx, {
  title: `Apply: ${live.title}`,
  text: `Applications go through our application form. Not the right role? Write to ${config.careersEmail}.`,
  buttons: [
    { label: 'Apply', kind: 'light', href: role.applyUrl, newTab: true },
    { label: 'Email the team', kind: 'outline-light', href: `mailto:${config.careersEmail}` },
  ],
})}`,
  } satisfies Page;
});
