// Markup with escaping on by default. Inside html`…`, every interpolated value is
// escaped unless it is itself markup (built by html`…` or marked raw()). Forgetting to
// escape is no longer possible; putting markup somewhere unintended needs raw(), which
// is easy to find in review.

/** A piece of markup that is already safe to insert. */
export class Html {
  readonly value: string;
  constructor(value: string) {
    this.value = value;
  }
  toString(): string {
    return this.value;
  }
}

export type Interpolation = Html | string | number | boolean | null | undefined | readonly Interpolation[];

const ESCAPES: Record<string, string> = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' };

/** Escapes text for use in element content or a double-quoted attribute. */
export const escapeText = (s: string): string => s.replace(/[&<>"]/g, (c) => ESCAPES[c] ?? c);

/** Text as markup, escaped. For the rare place outside a template. */
export const esc = (s: string | number = ''): Html => new Html(escapeText(String(s)));

/** Trusted markup, inserted as is: our own SVG artwork, never content. */
export const raw = (markup: string): Html => new Html(markup);

function render(value: Interpolation): string {
  if (value instanceof Html) return value.value;
  if (Array.isArray(value)) return value.map(render).join('');
  if (value === null || value === undefined) return '';
  return escapeText(String(value));
}

export function html(strings: TemplateStringsArray, ...values: Interpolation[]): Html {
  let out = strings[0] ?? '';
  for (let i = 0; i < values.length; i++) out += render(values[i]) + (strings[i + 1] ?? '');
  return new Html(out);
}

/** Joins pieces of markup with a literal separator (whitespace, usually). */
export const join = (items: readonly Html[], separator = ''): Html => new Html(items.map(render).join(separator));
