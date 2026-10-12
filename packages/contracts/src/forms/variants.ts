// What each form asks. A variant is chosen by the button the visitor pressed; the
// page and placement around that button are the entry point (see entry.ts).
// A demo request needs one thing — a work email — so it can be sent from a single line
// on the page (ADR-0013). The dialog also offers the name, optional, and Digital Assets
// an optional note. The white paper
// and sample report forms ask a name, an email and an optional note. The variant sets the wording and which desk it goes to.
// Job applications are not taken here: they go to each role's application form.
import { z } from 'zod';
import { common, type FieldSpec, message, optional } from './fields.ts';

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
    title: 'Talk to Us',
    lead: 'Tell us what you are reviewing. Someone from the right desk replies within one working day.',
    fields: [optional(common.name), common.email],
  }),
  define({
    id: 'private-markets',
    desk: 'Private Markets',
    title: 'Talk to Us',
    lead: 'Bring the fund you are reviewing now. A thirty-minute call; we show you what Eunice reads and returns.',
    fields: [optional(common.name), common.email],
  }),
  define({
    id: 'digital-assets',
    desk: 'Digital Assets',
    title: 'Talk to Us',
    lead: 'Pick a token you are reviewing now. We run it and show you the report and the monitoring feed.',
    fields: [
      optional(common.name),
      common.email,
      message('What would you like to cover?', 'The token you are reviewing, and listing, custody or market making'),
    ],
  }),
  define({
    id: 'token-disclosure',
    desk: 'Token Disclosure',
    title: 'Start a White Paper',
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
    title: 'See a Sample Report',
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
