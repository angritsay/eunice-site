// One page per post from the eunice.ai blog, at blog/<slug>/ as there. Title, date,
// standfirst and body are the live copy, word for word, imported by
// scripts/import-live.ts into content/posts/. The Insights list links here.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { z } from 'zod';
import { fmtDay, insightRow } from '../components.ts';
import { desks, insights } from '../content/index.ts';
import { html } from '../lib/html.ts';
import { richText } from '../lib/rich-text.ts';
import type { Ctx, Page } from '../lib/types.ts';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const DIR = path.join(HERE, '..', 'content', 'posts');
const ASSETS = path.join(HERE, '..', 'assets');

const Imported = z.strictObject({
  title: z.string().min(1),
  type: z.string().min(1),
  date: z.iso.datetime(),
  standfirst: z.string(),
  hero: z.string().regex(/^(img\/blog\/[a-z0-9.-]+)?$/),
  video: z.string().regex(/^([A-Za-z0-9_-]{11})?$/),
});

/** Width and height of a PNG or JPEG, so the page keeps its layout while images load. */
function imageSize(file: string): { width: number; height: number } | null {
  const b = fs.readFileSync(path.join(ASSETS, file));
  if (b.readUInt32BE(0) === 0x89504e47) return { width: b.readUInt32BE(16), height: b.readUInt32BE(20) };
  for (let i = 2; i + 9 < b.length; ) {
    if (b[i] !== 0xff) break;
    const marker = b[i + 1] ?? 0;
    const len = b.readUInt16BE(i + 2);
    if (marker >= 0xc0 && marker <= 0xcf && ![0xc4, 0xc8, 0xcc].includes(marker))
      return { height: b.readUInt16BE(i + 5), width: b.readUInt16BE(i + 7) };
    i += 2 + len;
  }
  return null;
}

const cover = (ctx: Ctx, file: string) => {
  const size = imageSize(file);
  return html`<img src="${ctx.asset(file)}" alt=""${size ? html` width="${size.width}" height="${size.height}"` : ''}>`;
};

// Each post is listed in content/index.ts `insights`; that entry says which desk it is.
export const postPages = insights
  .filter((it) => it.post)
  .map((it) => {
    const slug = it.post as string;
    const live = Imported.parse(JSON.parse(fs.readFileSync(path.join(DIR, `${slug}.json`), 'utf8')));
    const body = fs.readFileSync(path.join(DIR, `${slug}.html`), 'utf8');
    const watch = live.video ? `https://www.youtube.com/watch?v=${live.video}` : '';
    return {
      slug: `blog/${slug}`,
      nav: 'company',
      title: `${live.title} — Eunice`,
      description: live.standfirst || it.standfirst || it.title,
      render: (ctx) => html`
<section class="wrap hero hero--short post">
  <div class="hero__text">
    <nav class="crumbs" aria-label="Breadcrumb"><a href="${ctx.link('insights')}">Insights</a><span aria-hidden="true">/</span><span aria-current="page">${live.title}</span></nav>
    <p class="kicker tag--${it.desk}">${desks[it.desk].label} · ${live.type} · <time datetime="${live.date.slice(0, 10)}">${fmtDay(live.date.slice(0, 10))}</time></p>
    <h1 class="h1 post__title">${live.title}</h1>
    ${live.standfirst ? html`<p class="lead">${live.standfirst}</p>` : ''}
  </div>
</section>

<section class="wrap section section--tight post__body">
  ${
    watch
      ? html`<a class="post__cover post__video" href="${watch}" target="_blank" rel="noopener noreferrer">${live.hero ? cover(ctx, live.hero) : ''}<span class="post__play">Watch on YouTube</span></a>`
      : live.hero
        ? html`<figure class="post__cover">${cover(ctx, live.hero)}</figure>`
        : ''
  }
  <div class="prose body">${richText(ctx, body, `content/posts/${slug}.html`)}</div>
  <p class="all"><a class="more" href="${ctx.link('insights')}">All insights</a></p>
</section>`,
    } satisfies Page;
  });

// /blog/ on eunice.ai is the list of posts; here that list is Insights. This page keeps
// the old address useful after the domain moves.
export const blogIndex = {
  slug: 'blog',
  nav: 'company',
  title: 'Blog — Eunice',
  description: 'Articles, press and talks from Eunice. The blog is now part of Insights.',
  render: (ctx) => html`
<section class="wrap hero hero--short">
  <div class="hero__text">
    <p class="kicker">Blog</p>
    <h1 class="h1">The blog is now part of Insights</h1>
    <p class="lead">Every post from the blog, alongside our notes and talks.</p>
    <div class="buttons"><a class="btn btn--dark" href="${ctx.link('insights')}">Go to Insights</a></div>
  </div>
</section>
<section class="wrap section section--tight">
  <ul class="irows">${insights.filter((it) => it.post).map((it) => insightRow(ctx, it))}</ul>
</section>`,
} satisfies Page;
