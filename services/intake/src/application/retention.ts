// Keeping the retention promise and honouring erasure requests.
import type { Clock, Log, SubmissionStore } from './ports.ts';

export const makePurgeExpired =
  (deps: { store: SubmissionStore; clock: Clock; log: Log }) => async (): Promise<number> => {
    const deleted = await deps.store.deleteExpired(deps.clock.now());
    if (deleted > 0) deps.log.info({ deleted }, 'expired submissions deleted');
    return deleted;
  };

/** GDPR Art. 17: everything we hold for an address, gone. */
export const makeErase =
  (deps: { store: SubmissionStore; log: Log }) =>
  async (email: string): Promise<number> => {
    const deleted = await deps.store.deleteByEmail(email.trim().toLowerCase());
    deps.log.info({ deleted }, 'erasure request completed');
    return deleted;
  };
