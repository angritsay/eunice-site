// What each form asks. A variant is chosen by the button the visitor pressed; the
// page and placement around that button are the entry point (see entry.ts).
import { z } from 'zod';
import { common, type FieldSpec, field, httpsUrl, message, singleLine } from './fields.ts';

export const JURISDICTIONS = [
  'EU — MiCA',
  'United Kingdom',
  'Singapore — MAS',
  'UAE — VARA',
  'Not decided yet',
] as const;

/** Who handles it. Leads go to business operations; applications to hiring. */
export type Queue = 'leads' | 'careers';

export interface Variant {
  readonly id: string;
  /** Shown to ops in the notification, and stored on the submission. */
  readonly desk: string;
  readonly queue: Queue;
  readonly title: string;
  readonly lead: string;
  readonly fields: readonly FieldSpec[];
}

const define = <const V extends Variant>(v: V) => v;

export const variants = [
  define({
    id: 'general',
    desk: 'General',
    queue: 'leads',
    title: 'Talk to us',
    lead: 'Tell us what you are reviewing. Someone from the right desk replies within one working day.',
    fields: [
      common.name,
      common.email,
      common.company,
      message('What would you like to cover?', 'The fund, token or question you have in mind'),
    ],
  }),
  define({
    id: 'private-markets',
    desk: 'Private Markets',
    queue: 'leads',
    title: 'Talk to the Private Markets desk',
    lead: 'Bring the fund you are reviewing now. A thirty-minute call; we show you what Eunice reads and returns.',
    fields: [
      common.name,
      common.email,
      common.company,
      field({
        name: 'fund',
        label: 'The fund you are reviewing',
        kind: 'text',
        required: false,
        wide: true,
        schema: singleLine(160),
      }),
      message('What would you like to cover?', 'Your committee date, the documents you have, what worries you'),
    ],
  }),
  define({
    id: 'digital-assets',
    desk: 'Digital Assets',
    queue: 'leads',
    title: 'Talk to the Digital Assets desk',
    lead: 'Pick a token you are reviewing now. We run it and show you the report and the monitoring feed.',
    fields: [
      common.name,
      common.email,
      common.company,
      field({
        name: 'token',
        label: 'The token you are reviewing',
        kind: 'text',
        required: false,
        wide: true,
        schema: singleLine(120),
      }),
      message('What would you like to cover?', 'Listing, custody, market making — and where it will trade'),
    ],
  }),
  define({
    id: 'token-disclosure',
    desk: 'Token Disclosure',
    queue: 'leads',
    title: 'Start a white paper',
    lead: 'Tell us about the token and where it will be offered. We come back with scope and timing.',
    fields: [
      common.name,
      common.email,
      common.company,
      field({ name: 'token', label: 'Token', kind: 'text', required: false, schema: singleLine(120) }),
      field({
        name: 'jurisdiction',
        label: 'Where it will be offered',
        kind: 'select',
        required: false,
        options: JURISDICTIONS,
        schema: z.enum(JURISDICTIONS),
      }),
      message('Anything else we should know?', 'Timing, counsel already involved, exchanges you are talking to'),
    ],
  }),
  define({
    id: 'sample-report',
    desk: 'Digital Assets',
    queue: 'leads',
    title: 'See a sample report',
    lead: 'We send a redacted listing report so your committee can see the format.',
    fields: [
      common.name,
      common.email,
      common.company,
      message('Anything to tailor it to?', 'The kind of asset your committee reviews most'),
    ],
  }),
  define({
    id: 'careers',
    desk: 'Careers',
    queue: 'careers',
    title: 'Write to the team',
    lead: 'Send a CV or a link to something you built, and two lines on why regulated finance. We answer everyone.',
    fields: [
      common.name,
      common.email,
      field({
        name: 'link',
        label: 'Link to your CV or work',
        kind: 'url',
        required: true,
        wide: true,
        placeholder: 'https://',
        schema: httpsUrl,
      }),
      message('Why regulated finance?', 'Two lines on why regulated finance', true),
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
