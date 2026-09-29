// The cover image of a blog post imported from eunice.ai (content/posts/<slug>.json),
// as a path under src/assets. Undefined when the post has none.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const DIR = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'content', 'posts');

export function postHero(slug: string): string | undefined {
  const file = path.join(DIR, `${slug}.json`);
  if (!fs.existsSync(file)) return undefined;
  const hero: unknown = JSON.parse(fs.readFileSync(file, 'utf8')).hero;
  return typeof hero === 'string' && hero ? hero : undefined;
}
