// One page per post from the eunice.ai blog, at blog/<slug>/ as there. Title, date,
// standfirst and body are the live copy, word for word, imported by
// scripts/import-live.ts into content/posts/. The blog and Insights lists link here.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { z } from 'zod';
import { article, fmtDay, listCards } from '../components.ts';
import { insights } from '../content/index.ts';
import { html } from '../lib/html.ts';
import { imageSize } from '../lib/image-size.ts';
import { richText } from '../lib/rich-text.ts';
import type { Ctx, Page } from '../lib/types.ts';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const DIR = path.join(HERE, '..', 'content', 'posts');

const Imported = z.strictObject({
  title: z.string().min(1),
  type: z.string().min(1),
  date: z.iso.datetime(),
  standfirst: z.string(),
  hero: z.string().regex(/^(img\/blog\/[a-z0-9.-]+)?$/),
  video: z.string().regex(/^([A-Za-z0-9_-]{11})?$/),
});

const cover = (ctx: Ctx, file: string) => {
  const size = imageSize(file);
  return html`<img src="${ctx.asset(file)}" alt=""${size ? html` width="${size.width}" height="${size.height}"` : ''}>`;
};

// Each post is listed in content/index.ts `insights`; that entry says which desk it is.
const posts = insights
  .filter((it) => it.post)
  .map((it) => {
    const slug = it.post as string;
    const live = Imported.parse(JSON.parse(fs.readFileSync(path.join(DIR, `${slug}.json`), 'utf8')));
    return { it, slug, live };
  })
  .sort((a, b) => (a.live.date < b.live.date ? 1 : -1));

export const postPages = posts.map(({ it, slug, live }) => {
  const body = fs.readFileSync(path.join(DIR, `${slug}.html`), 'utf8');
  const watch = live.video ? `https://www.youtube.com/watch?v=${live.video}` : '';
  return {
    slug: `blog/${slug}`,
    nav: 'company',
    title: `${live.title} — Eunice`,
    description: live.standfirst || it.standfirst || it.title,
    render: (ctx) =>
      html`${article(ctx, {
        crumbs: [
          { label: 'Home', to: '' },
          { label: 'Blog', to: 'blog' },
        ],
        tag: { label: live.type, tone: live.video ? 'video' : live.type === 'Press Release' ? 'press' : 'article' },
        title: live.title,
        date: html`<time datetime="${live.date.slice(0, 10)}">${fmtDay(live.date.slice(0, 10))}</time>`,
        media: watch
          ? html`<a class="acard__cover acard__video" href="${watch}" target="_blank" rel="noopener noreferrer">${live.hero ? cover(ctx, live.hero) : ''}<span class="acard__play">Watch on YouTube</span></a>`
          : live.hero
            ? html`<figure class="acard__cover">${cover(ctx, live.hero)}</figure>`
            : '',
        standfirst: live.standfirst,
        body: richText(ctx, body, `content/posts/${slug}.html`),
        after: html`<p class="aread__after"><a class="more" href="${ctx.link('blog')}">All posts</a></p>`,
      })}`,
  } satisfies Page;
});

// /blog/ is the list of posts, newest first, as on eunice.ai: a cover, the type and
// date, and the title. Insights lists the same posts by desk, with our notes.
export const blogIndex = {
  slug: 'blog',
  nav: 'company',
  title: 'Blog — Eunice',
  description: 'Articles, press releases and talks from Eunice.',
  render: (ctx) => html`
<section class="wrap hero hero--short">
  <div class="hero__text">
    <h1 class="h1">News and articles</h1>
    <p class="lead">Articles, press releases and talks from the Eunice team.</p>
  </div>
</section>
<section class="wrap section section--tight">
  ${listCards(
    posts.map(({ it, slug, live }) => ({
      href: ctx.link(`blog/${slug}`),
      cover: live.hero ? cover(ctx, live.hero) : '',
      meta: html`<span class="tag--${it.desk}">${live.type}</span> · <time datetime="${live.date.slice(0, 10)}">${fmtDay(live.date.slice(0, 10))}</time>`,
      title: live.title,
    })),
  )}
</section>`,
} satisfies Page;
