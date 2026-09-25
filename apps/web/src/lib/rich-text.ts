// Long-form copy imported from the live site (job descriptions, blog posts) is kept as
// small HTML fragments in src/content/. They are inserted as markup, so every fragment
// is checked here first: only the tags and attributes below, links to https, mailto or
// a site path, and images from our own assets. Anything else fails the build, so a
// fragment can never smuggle in a script, a style, an event handler or a third party.
import { type Html, raw } from './html.ts';
import type { Ctx } from './types.ts';

const TAGS = new Set([
  'p',
  'h2',
  'h3',
  'strong',
  'em',
  'code',
  'pre',
  'blockquote',
  'ul',
  'ol',
  'li',
  'a',
  'br',
  'img',
  'figure',
  'figcaption',
]);
const VOID = new Set(['br', 'img']);
const ATTRS: Record<string, readonly string[]> = { a: ['href'], img: ['src', 'alt', 'width', 'height'] };

/** A link in a fragment: to a site path (rewritten for this page), https or mailto. */
function linkFor(ctx: Ctx, href: string, where: string): string {
  if (/^https:\/\/[^\s"<>]+$/.test(href) || /^mailto:[^\s"<>]+$/.test(href)) return href;
  const site = href.match(/^\/([a-z0-9/-]*?)\/?(#[a-z0-9-]+)?$/);
  if (site) return ctx.link(site[1] ?? '', site[2]?.slice(1) ?? null);
  throw new Error(`${where}: link not allowed: ${href}`);
}

/** Checks a fragment against the allowlist and returns it as markup for this page. */
export function richText(ctx: Ctx, source: string, where: string): Html {
  const open: string[] = [];
  const out = source.replace(/<(\/?)([a-zA-Z0-9]+)([^>]*)>/g, (_, close: string, name: string, rest: string) => {
    const tag = name.toLowerCase();
    if (!TAGS.has(tag)) throw new Error(`${where}: tag not allowed: <${name}>`);
    if (close) {
      if (open.pop() !== tag) throw new Error(`${where}: </${tag}> closes nothing`);
      return `</${tag}>`;
    }
    const attrs: string[] = [];
    for (const m of rest.matchAll(/\s+([a-z-]+)="([^"]*)"/g)) {
      const [, key = '', value = ''] = m;
      if (!ATTRS[tag]?.includes(key)) throw new Error(`${where}: attribute not allowed: <${tag} ${key}>`);
      if (key === 'href') attrs.push(`href="${linkFor(ctx, value, where)}"`);
      else if (key === 'src') {
        if (!/^img\/[a-z0-9/._-]+$/.test(value)) throw new Error(`${where}: image not from our assets: ${value}`);
        attrs.push(`src="${ctx.asset(value)}"`);
      } else attrs.push(`${key}="${value}"`);
    }
    if (rest.replace(/\s+([a-z-]+)="([^"]*)"/g, '').trim()) throw new Error(`${where}: malformed <${tag}${rest}>`);
    if (!VOID.has(tag)) open.push(tag);
    const lazy = tag === 'img' ? ' loading="lazy" decoding="async"' : '';
    return `<${tag}${attrs.map((a) => ` ${a}`).join('')}${lazy}>`;
  });
  if (open.length) throw new Error(`${where}: unclosed <${open.join('>, <')}>`);
  if (/<|>/.test(out.replace(/<\/?[a-z0-9]+(?:\s[^<>]*)?>/g, ''))) throw new Error(`${where}: stray < or > in text`);
  return raw(out);
}
