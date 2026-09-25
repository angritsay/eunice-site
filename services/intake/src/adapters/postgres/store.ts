// SubmissionStore on Postgres. The submission row and its outbox row are written in one
// transaction: either both exist or neither does, so an event can never describe a
// submission that was not stored, and a stored submission cannot lose its event.
import { outboxRow } from '@eunice/platform';
import { type Kysely, sql } from 'kysely';
import type { SubmissionStore } from '../../application/ports.ts';
import type { DB } from './schema.ts';

export function postgresSubmissionStore(db: Kysely<DB>): SubmissionStore {
  return {
    save: ({ submission: s, idempotencyKey, fingerprint, receivedAt, purgeAfter }, event) =>
      db.transaction().execute(async (trx) => {
        const inserted = await trx
          .insertInto('intake.submissions')
          .values({
            idempotency_key: idempotencyKey,
            fingerprint,
            variant: s.variant,
            desk: s.desk,
            queue: s.queue,
            name: s.contact.name,
            email: s.contact.email,
            company: s.contact.company ?? null,
            message: s.message ?? null,
            details: JSON.stringify(s.details),
            entry_page: s.entry.page,
            entry_placement: s.entry.placement,
            entry_audience: s.entry.audience ?? null,
            entry_role: s.entry.role ?? null,
            referrer: s.attribution?.referrer || null,
            utm: s.attribution?.utm ? JSON.stringify(s.attribution.utm) : null,
            received_at: receivedAt,
            purge_after: purgeAfter,
          })
          // A second request with the same key waits here for the first to commit,
          // then finds its row below — so concurrent retries cannot both insert.
          .onConflict((oc) => oc.column('idempotency_key').doNothing())
          .returning('id')
          .executeTakeFirst();

        if (!inserted) {
          const existing = await trx
            .selectFrom('intake.submissions')
            .select(['id', 'fingerprint'])
            .where('idempotency_key', '=', idempotencyKey)
            .executeTakeFirstOrThrow();
          return existing.fingerprint === fingerprint
            ? { outcome: 'replayed' as const, id: existing.id }
            : { outcome: 'conflict' as const };
        }

        const e = event(inserted.id);
        await trx
          .insertInto('intake.outbox')
          .values(outboxRow({ id: e.id, type: e.type }, e.topic, e.payload))
          .execute();
        return { outcome: 'created' as const, id: inserted.id };
      }),

    async deleteExpired(now) {
      const r = await db.deleteFrom('intake.submissions').where('purge_after', '<', now).executeTakeFirst();
      return Number(r.numDeletedRows);
    },

    deleteByEmail: (email) =>
      db.transaction().execute(async (trx) => {
        const r = await trx
          .deleteFrom('intake.submissions')
          .where(sql<string>`lower(email)`, '=', email)
          .executeTakeFirst();
        // An event not yet published still carries the address in its payload.
        await trx
          .deleteFrom('intake.outbox')
          .where(sql<string>`lower(payload->'data'->'contact'->>'email')`, '=', email)
          .execute();
        return Number(r.numDeletedRows);
      }),
  };
}
