// What each form asks. A variant is chosen by the button the visitor pressed; the
// page and placement around that button are the entry point (see entry.ts).
// Every form asks the same three things — name, work email, an optional note — so
// sending one takes seconds; the variant sets the wording and which desk it goes to.
// Job applications are not taken here: they go to each role's application form.
import { z } from 'zod';
import { common, type FieldSpec, message } from './fields.ts';

export interface Variant {
  readonly id: string;
  /** Shown to ops in the notification, and stored on the submission. */
  readonly desk: string;
  readonly title: string;
  readonly lead: string;
  readonly fields: readonly FieldSpec[];
}

const define = <const V extends Variant>(v: V) => v;

export const variants = [
  define({
    id: 'general',
    desk: 'General',
    title: 'Talk to us',
    lead: 'Tell us what you are reviewing. Someone from the right desk replies within one working day.',
    fields: [
      common.name,
      common.email,
      message('What would you like to cover?', 'The fund, token or question you have in mind'),
    ],
  }),
  define({
    id: 'private-markets',
    desk: 'Private Markets',
    title: 'Talk to the Private Markets desk',
    lead: 'Bring the fund you are reviewing now. A thirty-minute call; we show you what Eunice reads and returns.',
    fields: [
      common.name,
      common.email,
      message('What would you like to cover?', 'The fund you are reviewing, your committee date, what worries you'),
    ],
  }),
  define({
    id: 'digital-assets',
    desk: 'Digital Assets',
    title: 'Talk to the Digital Assets desk',
    lead: 'Pick a token you are reviewing now. We run it and show you the report and the monitoring feed.',
    fields: [
      common.name,
      common.email,
      message('What would you like to cover?', 'The token you are reviewing, and listing, custody or market making'),
    ],
  }),
  define({
    id: 'token-disclosure',
    desk: 'Token Disclosure',
    title: 'Start a white paper',
    lead: 'Tell us about the token and where it will be offered. We come back with scope and timing.',
    fields: [
      common.name,
      common.email,
      message('About the token', 'The token, where it will be offered, and your timing'),
    ],
  }),
  define({
    id: 'sample-report',
    desk: 'Digital Assets',
    title: 'See a sample report',
    lead: 'We send a redacted listing report so your committee can see the format.',
    fields: [
      common.name,
      common.email,
      message('Anything to tailor it to?', 'The kind of asset your committee reviews most'),
    ],
  }),
] as const satisfies readonly Variant[];

export type VariantId = (typeof variants)[number]['id'];
export const VARIANT_IDS = variants.map((v) => v.id) as [VariantId, ...VariantId[]];

export function variant(id: VariantId): Variant {
  const found = variants.find((v) => v.id === id);
  if (!found) throw new Error(`Unknown form variant: ${id}`);
  return found;
}

/** The validation schema for a variant's fields, derived from its field specs. */
export function fieldsSchema(v: Variant) {
  return z.strictObject(Object.fromEntries(v.fields.map((f) => [f.name, f.required ? f.schema : f.schema.optional()])));
}
