// The outbox relay against real Postgres and a real NATS JetStream: events leave the
// table only once the broker has stored them, carry their trace, and survive an outage.
import { randomUUID } from 'node:crypto';
import { createServer } from 'node:net';
import { createDb, createLogger } from '@eunice/platform';
import { connectNats, jetstreamClient, type NatsConnection } from '@eunice/platform/nats';
import { startTelemetry } from '@eunice/platform/telemetry';
import { jetstreamManager } from '@nats-io/jetstream';
import { GenericContainer, type StartedTestContainer, Wait } from 'testcontainers';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { outboxRelay, STREAM } from '../../src/adapters/outbox/relay.ts';
import type { DB } from '../../src/adapters/postgres/schema.ts';
import { postgresSubmissionStore } from '../../src/adapters/postgres/store.ts';
import { runMigrations, startDatabase, type TestDatabase } from './database.ts';

export const NATS_IMAGE = 'nats:2.15.0-alpine';
const log = createLogger({ service: 'test', version: 'test', level: process.env['TEST_LOG'] ?? 'silent' });
const TRACEPARENT = '00-4bf92f3577b34da6a3ce929d0e0e4736-00f067aa0ba902b7-01';

let db: TestDatabase;
let nats: StartedTestContainer;
let natsUrl: string;
let nc: NatsConnection;

/** A fixed host port, so the broker is at the same address after a restart. */
const freePort = () =>
  new Promise<number>((resolve) => {
    const srv = createServer().listen(0, () => {
      const { port } = srv.address() as { port: number };
      srv.close(() => resolve(port));
    });
  });

const startNats = async () =>
  new GenericContainer(NATS_IMAGE)
    .withCommand(['-js'])
    .withExposedPorts({ container: 4222, host: await freePort() })
    .withWaitStrategy(Wait.forLogMessage(/Server is ready/))
    .start();

beforeAll(async () => {
  // No exporter: trace context is propagated, nothing is recorded.
  startTelemetry({ serviceName: 'test', serviceVersion: 'test', endpoint: undefined });
  [db, nats] = await Promise.all([startDatabase(), startNats()]);
  await runMigrations(db);
  natsUrl = `nats://${nats.getHost()}:${nats.getMappedPort(4222)}`;
  nc = await connectNats(natsUrl, 'test');
});

afterAll(async () => {
  await nc?.close();
  await Promise.all([db?.stop(), nats?.stop()]);
});

const kysely = () => createDb<DB>(db.app);

async function storeOne(traceparent: string | null = TRACEPARENT) {
  const eventId = randomUUID();
  // Written as intake writes it: submission and event in one transaction.
  const store = postgresSubmissionStore(kysely());
  const result = await store.save(
    {
      submission: {
        variant: 'general',
        desk: 'General',
        queue: 'leads',
        contact: { name: 'Jane', email: 'jane@acme.example' },
        details: {},
        entry: { page: '', placement: 'nav' },
      },
      idempotencyKey: randomUUID(),
      fingerprint: 'f',
      receivedAt: new Date(),
      purgeAfter: new Date(Date.now() + 86_400_000),
    },
    (id) => ({
      id: eventId,
      type: 'ai.eunice.intake.submission.received.v1',
      topic: 'intake.submission.received.v1',
      payload: { subject: id },
    }),
  );
  if (traceparent)
    await db.owner.query('update intake.outbox set traceparent = $1 where id = $2', [traceparent, eventId]);
  return { eventId, result };
}

const outboxCount = async () => Number((await db.owner.query('select count(*) from intake.outbox')).rows[0].count);

async function waitFor<T>(fn: () => Promise<T | undefined>, ms = 15_000): Promise<T> {
  const until = Date.now() + ms;
  for (;;) {
    const v = await fn().catch(() => undefined);
    if (v !== undefined) return v;
    if (Date.now() > until) throw new Error('timed out');
    await new Promise((r) => setTimeout(r, 100));
  }
}

async function streamMessage(seq: number) {
  const jsm = await jetstreamManager(nc);
  return jsm.streams.getMessage(STREAM.name, { seq });
}

describe('outbox relay', () => {
  it('publishes each event with its id and trace, then removes it from the outbox', async () => {
    const { eventId } = await storeOne();
    const relay = outboxRelay({ db: kysely(), natsUrl, log, idleMs: 50 });
    try {
      await waitFor(async () => ((await outboxCount()) === 0 ? true : undefined));
    } finally {
      await relay.stop();
    }
    const msg = await waitFor(() => streamMessage(1).then((m) => m ?? undefined));
    expect(msg.subject).toBe('intake.submission.received.v1');
    expect(msg.header.get('Nats-Msg-Id')).toBe(eventId);
    // The trace of the request that stored it, however long ago that was.
    expect(msg.header.get('traceparent')).toMatch(/^00-4bf92f3577b34da6a3ce929d0e0e4736-[0-9a-f]{16}-01$/);
  });

  it('stores an event published twice only once', async () => {
    const js = jetstreamClient(nc);
    const id = randomUUID();
    const a = await js.publish('intake.submission.received.v1', '{}', { msgID: id });
    const b = await js.publish('intake.submission.received.v1', '{}', { msgID: id });
    expect(b.duplicate).toBe(true);
    expect(b.seq).toBe(a.seq);
  });

  it('keeps events while the broker is down, and delivers them when it is back', async () => {
    await nats.stop({ remove: false });
    const relay = outboxRelay({ db: kysely(), natsUrl, log, idleMs: 50 });
    try {
      const { eventId } = await storeOne(null);
      await new Promise((r) => setTimeout(r, 1500));
      expect(await outboxCount()).toBe(1);

      await nats.restart();
      await waitFor(async () => ((await outboxCount()) === 0 ? true : undefined), 60_000);
      const jsm = await jetstreamManager(nc);
      const last = await jsm.streams.getMessage(STREAM.name, { last_by_subj: 'intake.submission.received.v1' });
      expect(last?.header.get('Nats-Msg-Id')).toBe(eventId);
    } finally {
      await relay.stop();
    }
  }, 120_000);
});
