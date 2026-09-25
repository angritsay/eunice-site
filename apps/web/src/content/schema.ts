// The shape of the site's content, checked when the site is built. A typo in a desk
// name, a date in the wrong format or a missing field stops the build with the path to
// the mistake, instead of shipping a page with a hole in it.
import { z } from 'zod';

export const DESK_IDS = ['private-markets', 'digital-assets', 'token-disclosure', 'company'] as const;
export const Desk = z.enum(DESK_IDS);
export type Desk = z.infer<typeof Desk>;
/** The desks that are products, with their own pages and forms. */
export const ProductDesk = z.enum(['private-markets', 'digital-assets', 'token-disclosure']);
export type ProductDesk = z.infer<typeof ProductDesk>;

const text = z.string().min(1);
const isoDay = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'must be YYYY-MM-DD');
const isoMonth = z.string().regex(/^\d{4}-\d{2}$/, 'must be YYYY-MM');
const slugId = z.string().regex(/^[a-z][a-z0-9-]*$/, 'must be lowercase words joined by hyphens');

export const Desks = z.record(Desk, z.strictObject({ label: text }));

const TitleText = z.strictObject({ title: text, text });

export const AudiencePage = z.strictObject({
  id: slugId,
  desk: ProductDesk,
  nav: text,
  card: TitleText,
  title: text,
  description: text,
  h1: text,
  lead: text,
  now: z.array(text).length(3),
  work: z.array(TitleText).length(3),
  cta: TitleText,
});
export type AudiencePage = z.infer<typeof AudiencePage>;

/** An audience id is unique within its desk: `exchanges` exists on two desks. */
export const AudiencePages = z.array(AudiencePage).superRefine((pages, ctx) => {
  const seen = new Set<string>();
  pages.forEach((p, i) => {
    const key = `${p.desk}/${p.id}`;
    if (seen.has(key)) ctx.addIssue({ code: 'custom', path: [i, 'id'], message: `duplicate page ${key}` });
    seen.add(key);
  });
});

export const Person = z.strictObject({
  name: text,
  role: text,
  owns: text,
  /** Shown on hover or tap. Empty: nothing is shown. */
  bio: z.string(),
  /** A file under assets/img/people/. Empty: no portrait yet. */
  photo: z.string(),
});
export type Person = z.infer<typeof Person>;

export const Insight = z.strictObject({
  date: isoDay,
  desk: Desk,
  type: z.enum(['Article', 'Note', 'Video', 'Press']),
  title: text,
  standfirst: text.optional(),
  featured: z.boolean().optional(),
  /** Where the piece lives today. Absent: not linked yet. */
  url: z.url().optional(),
  placeholder: z.boolean().optional(),
});
export type Insight = z.infer<typeof Insight>;

export const Event = z.strictObject({
  month: isoMonth,
  desks: z.array(ProductDesk).min(1),
  name: text,
  note: text,
});
export type Event = z.infer<typeof Event>;

export const Quote = z.strictObject({ desk: Desk, text, who: text });
export type Quote = z.infer<typeof Quote>;

export const Role = z.strictObject({ id: slugId, title: text, where: text, what: text });
export type Role = z.infer<typeof Role>;

/** Parses content, naming the file and path of the first mistake. */
export function content<S extends z.ZodType>(name: string, schema: S, value: z.input<S>): z.output<S> {
  const r = schema.safeParse(value);
  if (r.success) return r.data;
  const issues = r.error.issues.map((i) => `  ${name}.${i.path.join('.')}: ${i.message}`).join('\n');
  throw new Error(`Content does not match its schema (src/content/index.ts):\n${issues}`);
}

/** As content(), for a map keyed by id: the ids stay part of the type. */
export function contentRecord<K extends string, S extends z.ZodType>(
  name: string,
  item: S,
  value: Record<K, z.input<S>>,
): Record<K, z.output<S>> {
  return content(name, z.record(z.string(), item), value) as Record<K, z.output<S>>;
}
