// A retried request carries the same Idempotency-Key. Replaying it must return the
// original result; reusing the key for a different submission is a client bug and is
// refused. The fingerprint is what decides "the same submission".
import { createHash } from 'node:crypto';

/** JSON with object keys sorted, so equal values always serialise the same way. */
function canonical(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(canonical).join(',')}]`;
  if (value && typeof value === 'object') {
    const entries = Object.entries(value as Record<string, unknown>)
      .filter(([, v]) => v !== undefined)
      .sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0));
    return `{${entries.map(([k, v]) => `${JSON.stringify(k)}:${canonical(v)}`).join(',')}}`;
  }
  return JSON.stringify(value);
}

/**
 * Covers what the visitor submitted and where from — not the timing signals, which a
 * browser recomputes on every retry of the very same submission.
 */
export function fingerprint(submission: { variant: string; fields: unknown; entry: unknown }): string {
  return createHash('sha256')
    .update(canonical({ variant: submission.variant, fields: submission.fields, entry: submission.entry }))
    .digest('hex');
}
