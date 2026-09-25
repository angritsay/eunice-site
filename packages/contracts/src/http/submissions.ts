// POST /v1/submissions — what the site sends when a visitor submits a form.
import { z } from 'zod';
import { EntryPoint } from '../forms/entry.ts';
import { singleLine } from '../forms/fields.ts';
import type { VariantId } from '../forms/variants.ts';
import { fieldsSchema, variants } from '../forms/variants.ts';

export const Attribution = z.strictObject({
  /** document.referrer at the time of submission; '' when there was none. */
  referrer: z.string().max(500).optional(),
  /** utm_* parameters from the URL the form was submitted on. Nothing is stored in the browser to carry them further. */
  utm: z
    .strictObject({
      source: singleLine(100).optional(),
      medium: singleLine(100).optional(),
      campaign: singleLine(100).optional(),
      term: singleLine(100).optional(),
      content: singleLine(100).optional(),
    })
    .optional(),
});
export type Attribution = z.infer<typeof Attribution>;

/** Signals the server uses to spot automated submissions. Never stored. */
const SpamSignals = {
  /** A field humans never see. Anything in it means a bot filled every input it found. */
  website: z.string().max(500).optional(),
  /** Milliseconds between the form opening and being submitted. */
  elapsedMs: z.number().int().min(0).max(86_400_000),
};

/**
 * The static shape of a submission. The schema below is stricter at runtime — `fields`
 * is validated against the chosen variant's own fields — but a union over every variant
 * does not survive as a useful static type, so the shared shape is stated here.
 */
export interface SubmissionRequest {
  variant: VariantId;
  fields: Record<string, string | undefined>;
  entry: EntryPoint;
  attribution?: Attribution | undefined;
  website?: string | undefined;
  elapsedMs: number;
}

const perVariant = variants.map((v) =>
  z.strictObject({
    variant: z.literal(v.id),
    fields: fieldsSchema(v),
    entry: EntryPoint,
    attribution: Attribution.optional(),
    ...SpamSignals,
  }),
);

export const SubmissionRequest = z
  .discriminatedUnion('variant', perVariant as [(typeof perVariant)[number], ...(typeof perVariant)[number][]])
  .meta({
    id: 'SubmissionRequest',
    description: 'A form submitted on the site. `fields` is validated against the chosen `variant`.',
  }) as unknown as z.ZodType<SubmissionRequest>;

export const SubmissionAccepted = z
  .object({
    id: z.uuid().describe('Quote this when asking about a submission.'),
    status: z.literal('received'),
  })
  .meta({ id: 'SubmissionAccepted' });
export type SubmissionAccepted = z.infer<typeof SubmissionAccepted>;

export const IDEMPOTENCY_HEADER = 'Idempotency-Key';
