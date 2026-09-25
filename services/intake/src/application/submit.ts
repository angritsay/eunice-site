// Submitting a form: spot bots, map the request into the domain, and store it with the
// event that tells the rest of the system — in one transaction, once per key.
import {
  SUBMISSION_RECEIVED,
  SUBMISSION_RECEIVED_SUBJECT,
  type SubmissionReceived,
  type SubmissionRequest,
  variant as variantOf,
} from '@eunice/contracts';
import { fingerprint } from '../domain/idempotency.ts';
import { purgeAfter } from '../domain/retention.ts';
import { assessSpam } from '../domain/spam.ts';
import { toSubmission } from '../domain/submission.ts';
import type { Clock, Ids, Log, SubmissionStore } from './ports.ts';

export type SubmitOutcome = { readonly kind: 'accepted'; readonly id: string } | { readonly kind: 'conflict' };

export interface SubmitDeps {
  store: SubmissionStore;
  clock: Clock;
  ids: Ids;
  log: Log;
  retentionDays: number;
  /** CloudEvents `source` for events this service publishes. */
  source: string;
}

export function makeSubmit(deps: SubmitDeps) {
  return async function submit(request: SubmissionRequest, idempotencyKey: string): Promise<SubmitOutcome> {
    const verdict = assessSpam({ honeypot: request.website, elapsedMs: request.elapsedMs });
    if (verdict.spam) {
      // Answer exactly as for a real submission, so a bot learns nothing to adapt to.
      deps.log.info({ reason: verdict.reason, variant: request.variant }, 'submission discarded as spam');
      return { kind: 'accepted', id: deps.ids.uuid() };
    }

    const v = variantOf(request.variant);
    const submission = toSubmission({
      variant: v.id,
      desk: v.desk,
      fields: request.fields,
      entry: request.entry,
      ...(request.attribution ? { attribution: request.attribution } : {}),
    });
    const receivedAt = deps.clock.now();

    const result = await deps.store.save(
      {
        submission,
        idempotencyKey,
        fingerprint: fingerprint(request),
        receivedAt,
        purgeAfter: purgeAfter(receivedAt, deps.retentionDays),
      },
      (id) => {
        const event: SubmissionReceived = {
          specversion: '1.0',
          id: deps.ids.uuid(),
          source: deps.source,
          type: SUBMISSION_RECEIVED,
          time: receivedAt.toISOString(),
          datacontenttype: 'application/json',
          subject: id,
          data: {
            submissionId: id,
            variant: submission.variant,
            desk: submission.desk,
            receivedAt: receivedAt.toISOString(),
            contact: submission.contact,
            details: submission.details,
            ...(submission.message ? { message: submission.message } : {}),
            entry: request.entry,
            ...(submission.attribution ? { attribution: submission.attribution } : {}),
          },
        };
        return { id: event.id, type: event.type, topic: SUBMISSION_RECEIVED_SUBJECT, payload: event };
      },
    );

    if (result.outcome === 'conflict') return { kind: 'conflict' };
    deps.log.info(
      {
        submissionId: result.id,
        variant: submission.variant,
        placement: submission.entry.placement,
        replayed: result.outcome === 'replayed',
      },
      result.outcome === 'created' ? 'submission stored' : 'submission replayed',
    );
    return { kind: 'accepted', id: result.id };
  };
}
