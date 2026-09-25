// What the use cases need from the outside world, stated as interfaces they own.
// Adapters implement these; the use cases never see Postgres, HTTP or NATS.
import type { NewSubmission } from '../domain/submission.ts';

/** An event to publish, written in the same transaction as the state it describes. */
export interface PendingEvent {
  readonly id: string;
  readonly type: string;
  /** The broker subject it will be published on. */
  readonly topic: string;
  readonly payload: object;
}

export type SaveResult =
  | { readonly outcome: 'created'; readonly id: string }
  | { readonly outcome: 'replayed'; readonly id: string }
  | { readonly outcome: 'conflict' };

export interface SubmissionStore {
  /**
   * Stores a submission and the event announcing it, atomically, once per idempotency
   * key. `event` is called with the new id only when a row is actually created.
   */
  save(
    input: {
      readonly submission: NewSubmission;
      readonly idempotencyKey: string;
      readonly fingerprint: string;
      readonly receivedAt: Date;
      readonly purgeAfter: Date;
    },
    event: (id: string) => PendingEvent,
  ): Promise<SaveResult>;
  /** Deletes submissions past their retention date. Returns how many. */
  deleteExpired(now: Date): Promise<number>;
  /** Deletes every submission, and any unpublished event, for an email address. */
  deleteByEmail(email: string): Promise<number>;
}

export interface Clock {
  now(): Date;
}

export interface Ids {
  uuid(): string;
}

export interface Log {
  info(obj: object, msg: string): void;
  warn(obj: object, msg: string): void;
}
