// One page per open role, at careers/<slug>/ as on eunice.ai. The description is the
// live text, word for word, imported by scripts/import-live.ts into content/jobs/;
// applying happens on the role's own application form.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { z } from 'zod';
import { article, button, cta } from '../components.ts';
import { roles } from '../content/index.ts';
import { html } from '../lib/html.ts';
import { richText } from '../lib/rich-text.ts';
import type { Ctx, Page } from '../lib/types.ts';
import config from '../site.config.ts';

const DIR = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'content', 'jobs');
const Imported = z.strictObject({ title: z.string().min(1), team: z.string().min(1) });

const read = (file: string) => fs.readFileSync(path.join(DIR, file), 'utf8');

// The open roles as a plain list with room around each: the title, and where it is.
// Each opens the role's page, which has the full description and the Apply button.
export const roleList = (ctx: Ctx) =>
  html`<ul class="jobs">${roles.map(
    (r) =>
      html`<li><a class="jobs__role" href="${ctx.link(`careers/${r.slug}`)}"><span class="jobs__title">${r.title}</span><span class="jobs__where">${r.where}</span></a></li>`,
  )}</ul>`;

export default roles.map((role) => {
  const live = Imported.parse(JSON.parse(read(`${role.slug}.json`)));
  const body = read(`${role.slug}.html`);
  return {
    slug: `careers/${role.slug}`,
    nav: 'company',
    title: `${live.title} — Careers at Eunice`,
    description: role.what,
    render: (ctx) => html`
${article(ctx, {
  crumbs: [
    { label: 'Home', to: '' },
    { label: 'Careers', to: 'careers' },
  ],
  tag: { label: live.team, tone: 'plain' },
  title: live.title,
  date: role.where,
  media: html`<div class="apanel">
    <p class="apanel__label">Open role</p>
    <p class="apanel__what">${role.what}</p>
    <dl class="apanel__facts"><div><dt>Team</dt><dd>${live.team}</dd></div><div><dt>Location</dt><dd>${role.where}</dd></div></dl>
    <div class="buttons">
      ${button(ctx, { label: 'Apply', href: role.applyUrl, newTab: true })}
      ${button(ctx, { label: 'Email the team', kind: 'outline', href: `mailto:${config.careersEmail}` })}
    </div>
  </div>`,
  body: richText(ctx, body, `content/jobs/${role.slug}.html`),
})}

${cta(ctx, {
  title: `Apply: ${live.title}`,
  text: `Applications go through our application form. Not the right role? Write to ${config.careersEmail}.`,
  buttons: [
    { label: 'Apply', kind: 'light', href: role.applyUrl, newTab: true },
    { label: 'All roles', kind: 'outline-light', to: 'careers', hash: 'roles' },
  ],
})}`,
  } satisfies Page;
});
