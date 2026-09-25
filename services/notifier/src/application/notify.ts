// One event in, at most one email out. The broker may deliver an event more than once;
// the delivery log makes the second time a no-op, and the provider's idempotency key
// covers the gap between sending and recording.
import { SubmissionReceived } from '@eunice/contracts';
import { composeEmail, type Routing } from '../domain/email.ts';
import type { Lead } from '../domain/lead.ts';
import { type DeliveryLog, type Log, type Mailer, PermanentMailError } from './ports.ts';

export type NotifyOutcome = 'done' | 'retry' | 'reject';

export interface NotifyDeps {
  mailer: Mailer;
  deliveries: DeliveryLog;
  routing: Routing;
  clock: { now(): Date };
  log: Log;
}

const toLead = (e: SubmissionReceived): Lead => ({
  submissionId: e.data.submissionId,
  desk: e.data.desk,
  queue: e.data.queue,
  receivedAt: new Date(e.data.receivedAt),
  contact: e.data.contact,
  details: e.data.details,
  message: e.data.message,
  entry: e.data.entry,
  attribution: e.data.attribution,
});

export function makeNotify(deps: NotifyDeps) {
  return async function notify(raw: Uint8Array, attempt: { lastAttempt: boolean }): Promise<NotifyOutcome> {
    let json: unknown;
    try {
      json = JSON.parse(new TextDecoder().decode(raw));
    } catch {
      deps.log.error({}, 'event is not JSON; dropped');
      return 'reject';
    }
    const parsed = SubmissionReceived.safeParse(json);
    if (!parsed.success) {
      // Retrying cannot fix a malformed event. The submission is still in intake.
      deps.log.error(
        { issues: parsed.error.issues.map((i) => i.path.join('.')) },
        'event does not match the contract; dropped',
      );
      return 'reject';
    }
    const event = parsed.data;
    const ref = { eventId: event.id, submissionId: event.data.submissionId };

    if (await deps.deliveries.has(event.id)) {
      deps.log.info(ref, 'already notified');
      return 'done';
    }

    const email = composeEmail(toLead(event), deps.routing);
    try {
      const { providerId } = await deps.mailer.send(email, event.id);
      await deps.deliveries.record({ ...ref, providerId, deliveredAt: deps.clock.now() });
      deps.log.info({ ...ref, queue: event.data.queue }, 'ops notified');
      return 'done';
    } catch (err) {
      const reason = err instanceof Error ? err.message : String(err);
      if (err instanceof PermanentMailError || attempt.lastAttempt) {
        // The alert: a lead that ops has not been told about. Find it in intake by id.
        deps.log.error({ ...ref, reason }, 'notification abandoned; lead is stored in intake');
        return 'reject';
      }
      deps.log.warn({ ...ref, reason }, 'notification failed; will retry');
      return 'retry';
    }
  };
}
