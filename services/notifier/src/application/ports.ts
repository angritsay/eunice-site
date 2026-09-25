// What notifying needs from the outside world. Adapters implement these.
import type { Email } from '../domain/email.ts';

/** A failure the provider says will not go away on retry (bad key, rejected address). */
export class PermanentMailError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'PermanentMailError';
  }
}

export interface Mailer {
  /**
   * Sends one email. `idempotencyKey` is stable per event, so a provider that supports
   * it sends once even if we ask twice. Throws PermanentMailError when retrying is futile.
   */
  send(email: Email, idempotencyKey: string): Promise<{ providerId: string }>;
}

/** Which events have been turned into email. Holds ids and timestamps only — no personal data. */
export interface DeliveryLog {
  has(eventId: string): Promise<boolean>;
  record(d: { eventId: string; submissionId: string; providerId: string; deliveredAt: Date }): Promise<void>;
  deleteOlderThan(cutoff: Date): Promise<number>;
}

export interface Log {
  info(obj: object, msg: string): void;
  warn(obj: object, msg: string): void;
  error(obj: object, msg: string): void;
}
