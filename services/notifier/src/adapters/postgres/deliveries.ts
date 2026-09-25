import type { Kysely } from 'kysely';
import type { DeliveryLog } from '../../application/ports.ts';
import type { DB } from './schema.ts';

export function postgresDeliveryLog(db: Kysely<DB>): DeliveryLog {
  return {
    async has(eventId) {
      const row = await db
        .selectFrom('notifier.deliveries')
        .select('event_id')
        .where('event_id', '=', eventId)
        .executeTakeFirst();
      return row !== undefined;
    },
    async record(d) {
      await db
        .insertInto('notifier.deliveries')
        .values({
          event_id: d.eventId,
          submission_id: d.submissionId,
          provider_id: d.providerId,
          delivered_at: d.deliveredAt,
        })
        .onConflict((oc) => oc.column('event_id').doNothing())
        .execute();
    },
    async deleteOlderThan(cutoff) {
      const r = await db.deleteFrom('notifier.deliveries').where('delivered_at', '<', cutoff).executeTakeFirst();
      return Number(r.numDeletedRows);
    },
  };
}
