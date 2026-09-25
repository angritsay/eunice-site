// intake against a real Postgres: the migrations, the privilege boundary between the
// schema owner and the running service, and every promise SubmissionStore makes.
import { randomUUID } from 'node:crypto';
import { createDb } from '@eunice/platform';
import type { Kysely } from 'kysely';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import type { DB } from '../../src/adapters/postgres/schema.ts';
import { postgresSubmissionStore } from '../../src/adapters/postgres/store.ts';
import type { PendingEvent, SubmissionStore } from '../../src/application/ports.ts';
import type { NewSubmission } from '../../src/domain/submission.ts';
import { runMigrations, startDatabase, type TestDatabase } from './database.ts';

let db: TestDatabase;
let kysely: Kysely<DB>;
let store: SubmissionStore;

beforeAll(async () => {
  db = await startDatabase();
  kysely = createDb<DB>(db.app);
  store = postgresSubmissionStore(kysely);
}, 120_000);

afterAll(async () => {
  await db?.stop();
});

const submission = (email = 'jane@acme.example'): NewSubmission => ({
  variant: 'token-disclosure',
  desk: 'Token Disclosure',
  queue: 'leads',
  contact: { name: 'Jane Doe', email, company: 'Acme' },
  details: { token: 'ACME', jurisdiction: 'EU — MiCA' },
  message: 'Launching in Q1',
  entry: { page: 'token-disclosure/issuers/', placement: 'hero', audience: 'issuers' },
  attribution: { referrer: 'https://www.google.com/', utm: { source: 'linkedin' } },
});

const eventFor =
  (email = 'jane@acme.example') =>
  (id: string): PendingEvent => ({
    id: randomUUID(),
    type: 'ai.eunice.intake.submission.received.v1',
    topic: 'intake.submission.received.v1',
    payload: { subject: id, data: { contact: { email } } },
  });

const save = (
  opts: { key?: string; fingerprint?: string; email?: string; receivedAt?: Date; purgeAfter?: Date } = {},
) =>
  store.save(
    {
      submission: submission(opts.email),
      idempotencyKey: opts.key ?? randomUUID(),
      fingerprint: opts.fingerprint ?? 'f1',
      receivedAt: opts.receivedAt ?? new Date('2026-09-25T10:00:00Z'),
      purgeAfter: opts.purgeAfter ?? new Date('2027-09-25T10:00:00Z'),
    },
    eventFor(opts.email),
  );

const count = async (table: 'intake.submissions' | 'intake.outbox') =>
  Number((await db.owner.query(`select count(*) from ${table}`)).rows[0].count);

describe('migrations', () => {
  it('apply in order as the schema owner, and a second run changes nothing', async () => {
    expect(await runMigrations(db)).toEqual(['0001_submissions.sql', '0002_outbox.sql']);
    expect(await runMigrations(db)).toEqual([]);
  });
});

describe('the running service’s role', () => {
  const asApp = (sql: string) => db.app.query(sql);

  it('cannot change the schema', async () => {
    await expect(asApp('create table intake.sneaky (id int)')).rejects.toThrow(/permission denied/);
    await expect(asApp('drop table intake.submissions')).rejects.toThrow(/must be owner/);
    await expect(asApp('alter table intake.submissions add column x int')).rejects.toThrow(/must be owner/);
  });

  it('cannot rewrite a stored submission', async () => {
    await expect(asApp(`update intake.submissions set email = 'x@y.example'`)).rejects.toThrow(/permission denied/);
  });

  it('cannot touch the migration history', async () => {
    await expect(asApp('delete from intake.schema_migrations')).rejects.toThrow(/permission denied/);
  });

  it('cannot create anything in public either', async () => {
    await expect(asApp('create table public.sneaky (id int)')).rejects.toThrow(/permission denied/);
  });
});

describe('SubmissionStore on Postgres', () => {
  beforeEach(async () => {
    await db.owner.query('truncate intake.submissions, intake.outbox');
  });

  it('writes the submission and its event together, with a time-ordered id', async () => {
    const result = await save();
    expect(result.outcome).toBe('created');
    const row = (await db.owner.query('select * from intake.submissions')).rows[0];
    expect(row).toMatchObject({
      variant: 'token-disclosure',
      email: 'jane@acme.example',
      details: { token: 'ACME', jurisdiction: 'EU — MiCA' },
      entry_page: 'token-disclosure/issuers/',
      entry_placement: 'hero',
      entry_audience: 'issuers',
      utm: { source: 'linkedin' },
    });
    // uuidv7: version nibble 7.
    expect(row.id).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-7/);
    const event = (await db.owner.query('select * from intake.outbox')).rows[0];
    expect(event).toMatchObject({ subject: 'intake.submission.received.v1', payload: { subject: row.id } });
  });

  it('stores neither when writing the event fails', async () => {
    const failing = store.save(
      {
        submission: submission(),
        idempotencyKey: randomUUID(),
        fingerprint: 'f1',
        receivedAt: new Date('2026-09-25T10:00:00Z'),
        purgeAfter: new Date('2027-09-25T10:00:00Z'),
      },
      () => {
        throw new Error('event could not be built');
      },
    );
    await expect(failing).rejects.toThrow('event could not be built');
    expect(await count('intake.submissions')).toBe(0);
    expect(await count('intake.outbox')).toBe(0);
  });

  it('turns a retry into a replay, and a reused key into a conflict', async () => {
    const key = randomUUID();
    const first = await save({ key });
    expect(await save({ key })).toEqual({ outcome: 'replayed', id: first.outcome === 'created' ? first.id : '' });
    expect(await save({ key, fingerprint: 'f2' })).toEqual({ outcome: 'conflict' });
    expect(await count('intake.submissions')).toBe(1);
    expect(await count('intake.outbox')).toBe(1);
  });

  it('creates one submission when the same request arrives many times at once', async () => {
    const key = randomUUID();
    const results = await Promise.all(Array.from({ length: 8 }, () => save({ key })));
    expect(results.filter((r) => r.outcome === 'created')).toHaveLength(1);
    expect(new Set(results.map((r) => (r.outcome === 'conflict' ? 'x' : r.id))).size).toBe(1);
    expect(await count('intake.submissions')).toBe(1);
    expect(await count('intake.outbox')).toBe(1);
  });

  it('deletes only what is past its retention date', async () => {
    await save({ purgeAfter: new Date('2026-10-01T00:00:00Z') });
    await save({ purgeAfter: new Date('2027-10-01T00:00:00Z') });
    expect(await store.deleteExpired(new Date('2026-12-01T00:00:00Z'))).toBe(1);
    expect(await count('intake.submissions')).toBe(1);
  });

  it('erases an address everywhere, including events not yet published', async () => {
    await save({ email: 'Jane@Acme.example' });
    await save({ email: 'someone@else.example' });
    expect(await store.deleteByEmail('jane@acme.example')).toBe(1);
    expect(await count('intake.submissions')).toBe(1);
    const left = (await db.owner.query(`select payload->'data'->'contact'->>'email' as email from intake.outbox`)).rows;
    expect(left).toEqual([{ email: 'someone@else.example' }]);
  });
});
