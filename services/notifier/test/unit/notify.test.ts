import { randomUUID } from 'node:crypto';
import { SUBMISSION_RECEIVED, type SubmissionReceived } from '@eunice/contracts';
import { describe, expect, it, vi } from 'vitest';
import { makeNotify } from '../../src/application/notify.ts';
import { type DeliveryLog, type Mailer, PermanentMailError } from '../../src/application/ports.ts';

const event = (): SubmissionReceived => ({
  specversion: '1.0',
  id: randomUUID(),
  source: '/services/intake',
  type: SUBMISSION_RECEIVED,
  time: '2026-09-25T10:00:00.000Z',
  datacontenttype: 'application/json',
  subject: '0199a0c2-0000-7000-8000-000000000001',
  data: {
    submissionId: '0199a0c2-0000-7000-8000-000000000001',
    variant: 'general',
    desk: 'General',
    receivedAt: '2026-09-25T10:00:00.000Z',
    contact: { name: 'Jane Doe', email: 'jane@acme.example' },
    details: {},
    entry: { page: '', placement: 'nav' },
  },
});

const bytes = (v: unknown) => new TextEncoder().encode(JSON.stringify(v));

function setup(mailer: Mailer['send'] = async () => ({ providerId: 'p-1' })) {
  const delivered = new Set<string>();
  const deliveries: DeliveryLog = {
    has: async (id) => delivered.has(id),
    record: async (d) => {
      delivered.add(d.eventId);
    },
    deleteOlderThan: async () => 0,
  };
  const send = vi.fn(mailer);
  const log = { info: vi.fn(), warn: vi.fn(), error: vi.fn() };
  const notify = makeNotify({
    mailer: { send },
    deliveries,
    routing: { opsInbox: 'ops@eunice.ai', siteUrl: 'https://eunice.ai' },
    clock: { now: () => new Date() },
    log,
  });
  return { notify, send, delivered, log };
}

const first = { lastAttempt: false };

describe('notify', () => {
  it('emails ops once per event, however often the event arrives', async () => {
    const { notify, send } = setup();
    const e = event();
    expect(await notify(bytes(e), first)).toBe('done');
    expect(await notify(bytes(e), first)).toBe('done');
    expect(send).toHaveBeenCalledTimes(1);
    // The provider gets the event id, so even a send whose record was lost is not repeated.
    expect(send).toHaveBeenCalledWith(expect.objectContaining({ to: 'ops@eunice.ai' }), e.id);
  });

  it('retries when the provider is having a bad moment', async () => {
    const { notify, delivered } = setup(async () => {
      throw new Error('smtp-relay.gmail.com: 421 try again later');
    });
    expect(await notify(bytes(event()), first)).toBe('retry');
    expect(delivered.size).toBe(0);
  });

  it('gives up, loudly, when retrying cannot help', async () => {
    const { notify, log } = setup(async () => {
      throw new PermanentMailError('smtp-relay.gmail.com: 552 message rejected');
    });
    expect(await notify(bytes(event()), first)).toBe('reject');
    expect(log.error).toHaveBeenCalledWith(
      expect.objectContaining({ submissionId: expect.any(String) }),
      expect.stringContaining('abandoned'),
    );
  });

  it('gives up, loudly, on the last attempt', async () => {
    const { notify, log } = setup(async () => {
      throw new Error('timeout');
    });
    expect(await notify(bytes(event()), { lastAttempt: true })).toBe('reject');
    expect(log.error).toHaveBeenCalled();
  });

  it('drops an event that does not match the contract, without trying to send it', async () => {
    const { notify, send } = setup();
    expect(await notify(bytes({ ...event(), data: { hello: 'world' } }), first)).toBe('reject');
    expect(await notify(new TextEncoder().encode('not json'), first)).toBe('reject');
    expect(send).not.toHaveBeenCalled();
  });

  it('never writes the lead’s details to its logs', async () => {
    const { notify, log } = setup();
    await notify(bytes(event()), first);
    expect(JSON.stringify([log.info.mock.calls, log.warn.mock.calls, log.error.mock.calls])).not.toContain(
      'jane@acme.example',
    );
  });
});
