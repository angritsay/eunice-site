// Moves events from the outbox table to the broker. It runs inside intake, which owns
// the table, and is the only reader of it.
//
// Each batch is claimed with FOR UPDATE SKIP LOCKED, published, and deleted in the same
// transaction: if the process dies after publishing but before committing, the rows are
// published again on the next pass, and the broker drops the copies by event id. So
// delivery is at least once into the broker and exactly once out of its de-dup window.
//
// When the broker is down, submissions keep being accepted and stored; events wait here.
import type { Logger } from '@eunice/platform';
import {
  connectNats,
  ensureStream,
  type JetStreamClient,
  jetstreamClient,
  type NatsConnection,
  publishEvent,
} from '@eunice/platform/nats';
import type { Kysely } from 'kysely';
import type { DB } from '../postgres/schema.ts';

export const STREAM = {
  name: 'INTAKE',
  subjects: ['intake.>'],
  duplicateWindowMs: 10 * 60_000,
  // A lead no service has picked up in a week is found in intake, not in the broker.
  maxAgeMs: 7 * 24 * 60 * 60_000,
};

export interface RelayOptions {
  db: Kysely<DB>;
  natsUrl: string;
  log: Logger;
  batchSize?: number;
  idleMs?: number;
}

export function outboxRelay(opts: RelayOptions) {
  const batchSize = opts.batchSize ?? 50;
  const idleMs = opts.idleMs ?? 250;
  let running = true;
  let nc: NatsConnection | undefined;
  let wake: (() => void) | undefined;
  const sleep = (ms: number) =>
    new Promise<void>((resolve) => {
      const t = setTimeout(resolve, ms);
      wake = () => {
        clearTimeout(t);
        resolve();
      };
    });

  /** Publishes one batch. Returns how many events left the outbox. */
  async function drain(js: JetStreamClient): Promise<number> {
    return opts.db.transaction().execute(async (trx) => {
      const rows = await trx
        .selectFrom('intake.outbox')
        .select(['id', 'subject', 'payload', 'traceparent'])
        .orderBy('created_at')
        .limit(batchSize)
        .forUpdate()
        .skipLocked()
        .execute();
      for (const r of rows) {
        await publishEvent(js, {
          id: r.id,
          subject: r.subject,
          payload: JSON.stringify(r.payload),
          traceparent: r.traceparent,
        });
      }
      if (rows.length > 0) {
        await trx
          .deleteFrom('intake.outbox')
          .where(
            'id',
            'in',
            rows.map((r) => r.id),
          )
          .execute();
      }
      return rows.length;
    });
  }

  async function run() {
    let backoffMs = 500;
    while (running) {
      try {
        if (!nc) {
          nc = await connectNats(opts.natsUrl, 'intake-relay');
          await ensureStream(nc, STREAM);
          opts.log.info('outbox relay connected');
          backoffMs = 500;
        }
        const published = await drain(jetstreamClient(nc));
        if (published > 0) opts.log.info({ published }, 'events published');
        else await sleep(idleMs);
      } catch (err) {
        opts.log.warn(
          { err: err instanceof Error ? err.message : String(err), retryInMs: backoffMs },
          'outbox relay failed; retrying',
        );
        await sleep(backoffMs);
        backoffMs = Math.min(backoffMs * 2, 30_000);
      }
    }
  }

  const loop = run();
  return {
    async stop() {
      running = false;
      wake?.();
      await loop;
      await nc?.drain().catch(() => {});
    },
  };
}
