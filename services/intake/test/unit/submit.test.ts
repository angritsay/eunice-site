import { SUBMISSION_RECEIVED_SUBJECT, SubmissionReceived, type SubmissionRequest } from '@eunice/contracts';
import { describe, expect, it } from 'vitest';
import { makeErase, makePurgeExpired } from '../../src/application/retention.ts';
import { makeSubmit } from '../../src/application/submit.ts';
import { fixedClock, memoryStore, silentLog } from './fakes.ts';

const request: SubmissionRequest = {
  variant: 'private-markets',
  fields: { name: 'Jane Doe', email: 'Jane@Acme.example', company: 'Acme Capital', fund: 'Gridiron V' },
  entry: { page: 'private-markets/lps/', placement: 'hero', audience: 'lps' },
  attribution: { referrer: 'https://www.google.com/', utm: { source: 'newsletter' } },
  elapsedMs: 8200,
};
const KEY = '0199a0c2-7d7e-7c3e-9f5a-3c1f2b6d4e10';

function setup() {
  const mem = memoryStore();
  const submit = makeSubmit({
    store: mem.store,
    clock: fixedClock(),
    ids: { uuid: () => crypto.randomUUID() },
    log: silentLog,
    retentionDays: 365,
    source: '/services/intake',
  });
  return { ...mem, submit };
}

describe('submit', () => {
  it('stores the submission with the event that announces it', async () => {
    const { submit, rows, outbox } = setup();
    const outcome = await submit(request, KEY);

    expect(outcome.kind).toBe('accepted');
    expect(rows).toHaveLength(1);
    expect(rows[0]?.submission).toMatchObject({
      variant: 'private-markets',
      desk: 'Private Markets',
      queue: 'leads',
      details: { fund: 'Gridiron V' },
      entry: { placement: 'hero', audience: 'lps' },
    });
    expect(rows[0]?.purgeAfter.toISOString()).toBe('2027-09-25T10:00:00.000Z');

    expect(outbox).toHaveLength(1);
    expect(outbox[0]?.topic).toBe(SUBMISSION_RECEIVED_SUBJECT);
    // The event is exactly what the published contract says consumers will receive.
    const event = SubmissionReceived.parse(outbox[0]?.payload);
    expect(event.subject).toBe(outcome.kind === 'accepted' ? outcome.id : '');
    expect(event.data).toMatchObject({ submissionId: event.subject, contact: { company: 'Acme Capital' } });
  });

  it('answers a retry with the original id and stores nothing new', async () => {
    const { submit, rows, outbox } = setup();
    const first = await submit(request, KEY);
    const retry = await submit({ ...request, elapsedMs: 15_000 }, KEY);
    expect(retry).toEqual(first);
    expect(rows).toHaveLength(1);
    expect(outbox).toHaveLength(1);
  });

  it('refuses a key reused for a different submission', async () => {
    const { submit } = setup();
    await submit(request, KEY);
    const other = { ...request, fields: { ...request.fields, name: 'Someone Else' } };
    expect(await submit(other, KEY)).toEqual({ kind: 'conflict' });
  });

  it('answers a bot as it would a person, and keeps nothing', async () => {
    const { submit, rows, outbox } = setup();
    const outcome = await submit({ ...request, website: 'https://spam.example' }, KEY);
    expect(outcome.kind).toBe('accepted');
    expect(rows).toHaveLength(0);
    expect(outbox).toHaveLength(0);
  });
});

describe('retention and erasure', () => {
  it('purges what is past its date and nothing else', async () => {
    const { submit, store, rows } = setup();
    await submit(request, KEY);
    const purge = (iso: string) => makePurgeExpired({ store, clock: fixedClock(iso), log: silentLog })();
    expect(await purge('2027-09-25T09:59:59.000Z')).toBe(0);
    expect(await purge('2027-09-25T10:00:01.000Z')).toBe(1);
    expect(rows).toHaveLength(0);
  });

  it('erases by address, whatever the case it was typed in', async () => {
    const { submit, store, rows } = setup();
    await submit(request, KEY);
    expect(await makeErase({ store, log: silentLog })('  JANE@acme.EXAMPLE ')).toBe(1);
    expect(rows).toHaveLength(0);
  });
});
