// Test doubles for the ports. The in-memory store keeps the same promises as the
// Postgres one (once per key, submission and event together), which the integration
// tests check against the real database.
import { randomUUID } from 'node:crypto';
import type { PendingEvent, SubmissionStore } from '../../src/application/ports.ts';
import type { NewSubmission } from '../../src/domain/submission.ts';

export interface StoredSubmission {
  id: string;
  submission: NewSubmission;
  idempotencyKey: string;
  fingerprint: string;
  receivedAt: Date;
  purgeAfter: Date;
}

export function memoryStore() {
  const rows: StoredSubmission[] = [];
  const outbox: PendingEvent[] = [];
  const store: SubmissionStore = {
    async save(input, event) {
      const existing = rows.find((r) => r.idempotencyKey === input.idempotencyKey);
      if (existing) {
        return existing.fingerprint === input.fingerprint
          ? { outcome: 'replayed', id: existing.id }
          : { outcome: 'conflict' };
      }
      const id = randomUUID();
      rows.push({ id, ...input });
      outbox.push(event(id));
      return { outcome: 'created', id };
    },
    async deleteExpired(now) {
      const before = rows.length;
      for (let i = rows.length - 1; i >= 0; i--) if ((rows[i] as StoredSubmission).purgeAfter < now) rows.splice(i, 1);
      return before - rows.length;
    },
    async deleteByEmail(email) {
      const before = rows.length;
      for (let i = rows.length - 1; i >= 0; i--) {
        if ((rows[i] as StoredSubmission).submission.contact.email.toLowerCase() === email) rows.splice(i, 1);
      }
      return before - rows.length;
    },
  };
  return { store, rows, outbox };
}

export const fixedClock = (iso = '2026-09-25T10:00:00.000Z') => ({ now: () => new Date(iso) });

export const silentLog = { info() {}, warn() {} };
