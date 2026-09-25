// What happens when a part of the system is down. Runs after the other tests (see
// playwright.config.ts), because it stops shared containers.
import { expect, test } from '@playwright/test';
import { compose, mailFor, submissionsFor } from './stack.ts';

test.describe.configure({ mode: 'serial' });

const BASE = process.env['E2E_BASE_URL'] ?? 'http://localhost:8080';

async function submit(email: string) {
  return fetch(`${BASE}/api/intake/v1/submissions`, {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'idempotency-key': crypto.randomUUID() },
    body: JSON.stringify({
      variant: 'general',
      fields: { name: 'Resilient Lead', email },
      entry: { page: '', placement: 'hero' },
      elapsedMs: 10_000,
    }),
  });
}

const address = (what: string) => `e2e-${what}-${Date.now()}@example.com`;

test('a submission is accepted while the broker is down, and ops hears once it is back', async () => {
  test.setTimeout(120_000);
  compose('stop', 'nats');
  try {
    const email = address('broker-down');
    expect((await submit(email)).status).toBe(202);
    expect(submissionsFor(email)).toHaveLength(1);
    compose('start', 'nats');
    const mails = await mailFor(email, 60_000);
    expect(mails).toHaveLength(1);
  } finally {
    compose('start', 'nats');
  }
});

test('a lead waits in the broker while notifier is down, and is emailed once when it returns', async () => {
  test.setTimeout(120_000);
  compose('stop', 'notifier');
  try {
    const email = address('notifier-down');
    expect((await submit(email)).status).toBe(202);
    compose('start', 'notifier');
    const mails = await mailFor(email, 60_000);
    expect(mails).toHaveLength(1);
  } finally {
    compose('start', 'notifier');
  }
});
