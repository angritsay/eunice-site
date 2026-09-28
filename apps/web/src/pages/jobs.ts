// One page per open role, at careers/<slug>/ as on eunice.ai. The description is the
// live text, word for word, imported by scripts/import-live.ts into content/jobs/;
// applying happens on the role's own application form.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { z } from 'zod';
import { article, button, cta, listCards } from '../components.ts';
import { roles } from '../content/index.ts';
import { html } from '../lib/html.ts';
import { richText } from '../lib/rich-text.ts';
import type { Ctx, Page } from '../lib/types.ts';
import config from '../site.config.ts';

const DIR = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'content', 'jobs');
const Imported = z.strictObject({ title: z.string().min(1), team: z.string().min(1) });

const read = (file: string) => fs.readFileSync(path.join(DIR, file), 'utf8');

/** The team a role sits in, as the live job page names it. */
export const jobTeam = (slug: string) => Imported.parse(JSON.parse(read(`${slug}.json`))).team;

/** The open roles as list cards: read the role, or apply straight away. */
export const roleCards = (ctx: Ctx) =>
  listCards(
    roles.map((r) => ({
      href: ctx.link(`careers/${r.slug}`),
      tile: jobTeam(r.slug),
      meta: r.where,
      title: r.title,
      text: r.what,
      actions: html`${button(ctx, { label: 'Apply', small: true, href: r.applyUrl, newTab: true })}<a class="more" href="${ctx.link(`careers/${r.slug}`)}">Read the role</a>`,
    })),
  );

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
