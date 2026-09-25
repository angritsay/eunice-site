// The transactional outbox: an event is written to a table in the same transaction as
// the state change it describes, and published later by a relay. The state change and
// the event therefore commit or roll back together — no event for data that was never
// stored, and no stored data whose event was lost because the broker was down.
//
// The trace context is saved with the row, so the relay can continue the same trace
// when it publishes, however long afterwards that is.
import { context, propagation } from '@opentelemetry/api';

export interface OutboxRow {
  id: string;
  subject: string;
  event_type: string;
  payload: string;
  traceparent: string | null;
}

/** The W3C traceparent of the active span, or null outside a trace. */
export function currentTraceparent(): string | null {
  const carrier: Record<string, string> = {};
  propagation.inject(context.active(), carrier);
  return carrier['traceparent'] ?? null;
}

/** A row for the outbox table, carrying the trace of whatever is writing it. */
export function outboxRow(event: { id: string; type: string }, subject: string, payload: object): OutboxRow {
  return {
    id: event.id,
    subject,
    event_type: event.type,
    payload: JSON.stringify(payload),
    traceparent: currentTraceparent(),
  };
}
