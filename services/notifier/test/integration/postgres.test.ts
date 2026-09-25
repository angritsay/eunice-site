// notifier against real Postgres: its migrations, its privileges, and the delivery log.
import { randomUUID } from 'node:crypto';
import { createDb } from '@eunice/platform';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { postgresDeliveryLog } from '../../src/adapters/postgres/deliveries.ts';
import type { DB } from '../../src/adapters/postgres/schema.ts';
import { runMigrations, startDatabase, type TestDatabase } from './database.ts';

let db: TestDatabase;

beforeAll(async () => {
  db = await startDatabase();
  await runMigrations(db);
});

afterAll(async () => {
  await db?.stop();
});

describe('the notifier’s role', () => {
  it('cannot read another service’s data', async () => {
    // intake's schema exists in the same database; notifier must not see into it.
    await expect(db.app.query('select * from intake.schema_migrations')).rejects.toThrow(/permission denied/);
  });

  it('cannot change its own schema', async () => {
    await expect(db.app.query('drop table notifier.deliveries')).rejects.toThrow(/must be owner/);
  });

  it('migrations are idempotent', async () => {
    expect(await runMigrations(db)).toEqual([]);
  });
});

describe('delivery log', () => {
  it('remembers what was sent, once, and forgets it after the retention period', async () => {
    const log = postgresDeliveryLog(createDb<DB>(db.app));
    const eventId = randomUUID();
    const d = { eventId, submissionId: randomUUID(), providerId: 'p-1', deliveredAt: new Date('2026-01-01T00:00:00Z') };
    expect(await log.has(eventId)).toBe(false);
    await log.record(d);
    await log.record(d); // a second record of the same event is not an error
    expect(await log.has(eventId)).toBe(true);
    expect(await log.deleteOlderThan(new Date('2026-02-01T00:00:00Z'))).toBe(1);
    expect(await log.has(eventId)).toBe(false);
  });
});
