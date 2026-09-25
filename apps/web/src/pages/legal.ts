// The legal pages the footer links to, at the same paths as on eunice.ai. The text is
// the live copy, word for word, imported by scripts/import-live.ts into content/legal/.
// Changes to it come from counsel: update the live page, then re-import.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { z } from 'zod';
import { html } from '../lib/html.ts';
import { richText } from '../lib/rich-text.ts';
import type { Page } from '../lib/types.ts';

const DIR = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'content', 'legal');
const Imported = z.strictObject({ title: z.string().min(1) });

const legalPage = (slug: string, description: string): Page => {
  const live = Imported.parse(JSON.parse(fs.readFileSync(path.join(DIR, `${slug}.json`), 'utf8')));
  const body = fs.readFileSync(path.join(DIR, `${slug}.html`), 'utf8');
  return {
    slug,
    nav: 'company',
    title: `${live.title} — Eunice`,
    description,
    render: (ctx) => html`
<section class="wrap hero hero--short">
  <div class="hero__text">
    <p class="kicker">Reasoon Limited, trading as Eunice</p>
    <h1 class="h1">${live.title}</h1>
  </div>
</section>
<section class="wrap section section--tight">
  <div class="prose body">${richText(ctx, body, `content/legal/${slug}.html`)}</div>
</section>`,
  };
};

export default [
  legalPage('terms-and-conditions', 'The terms on which this website may be accessed and used.'),
  legalPage('privacy-policy', 'How Reasoon Limited, trading as Eunice, collects, uses and protects personal data.'),
];
