// The SMTP adapter against a real SMTP server (Mailpit), as in local runs and CI.
// Production swaps the host for Google Workspace's relay; the code path is the same.
import { randomUUID } from 'node:crypto';
import { GenericContainer, type StartedTestContainer, Wait } from 'testcontainers';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { smtpMailer } from '../../src/adapters/email/smtp.ts';

const MAILPIT_IMAGE = 'axllent/mailpit:v1.31.2';
let mailpit: StartedTestContainer;
let api: string;

beforeAll(async () => {
  mailpit = await new GenericContainer(MAILPIT_IMAGE)
    .withExposedPorts(1025, 8025)
    .withWaitStrategy(Wait.forHttp('/readyz', 8025))
    .start();
  api = `http://${mailpit.getHost()}:${mailpit.getMappedPort(8025)}/api/v1`;
});

afterAll(async () => {
  await mailpit?.stop();
});

const from = { name: 'Eunice site', email: 'notify@eunice.ai' };
const email = {
  to: 'ops@eunice.ai',
  replyTo: { email: 'jane@acme.example', name: 'Jane Doe' },
  subject: '[Private Markets · lps · hero] Jane Doe — Acme Capital',
  text: 'New lead for the Private Markets desk.\n',
};

describe('SMTP mailer', () => {
  it('sends plain text with Reply-To the lead and a Message-ID derived from the event', async () => {
    const mailer = smtpMailer({ host: mailpit.getHost(), port: mailpit.getMappedPort(1025), requireTls: false, from });
    const eventId = randomUUID();
    const { providerId } = await mailer.send(email, eventId);
    expect(providerId).toBe(`<${eventId}@eunice.ai>`);

    const list = (await (await fetch(`${api}/messages`)).json()) as { messages: { ID: string; MessageID: string }[] };
    const summary = list.messages.find((m) => m.MessageID === `${eventId}@eunice.ai`);
    expect(summary).toBeDefined();
    const msg = (await (await fetch(`${api}/message/${summary?.ID}`)).json()) as {
      From: { Address: string; Name: string };
      To: { Address: string }[];
      ReplyTo: { Address: string; Name: string }[];
      Subject: string;
      Text: string;
      HTML: string;
    };
    expect(msg.From).toEqual({ Address: 'notify@eunice.ai', Name: 'Eunice site' });
    expect(msg.To.map((t) => t.Address)).toEqual(['ops@eunice.ai']);
    expect(msg.ReplyTo).toEqual([{ Address: 'jane@acme.example', Name: 'Jane Doe' }]);
    expect(msg.Subject).toBe(email.subject);
    expect(msg.Text).toContain('New lead for the Private Markets desk.');
    expect(msg.HTML).toBe('');
  });

  it('refuses to send over a connection it cannot encrypt, and says it may retry', async () => {
    // Mailpit here offers no STARTTLS: with TLS required, nothing may be sent in clear.
    const mailer = smtpMailer({ host: mailpit.getHost(), port: mailpit.getMappedPort(1025), requireTls: true, from });
    const eventId = randomUUID();
    const failure = mailer.send(email, eventId);
    await expect(failure).rejects.toThrow(/refused/);
    await expect(failure).rejects.not.toHaveProperty('name', 'PermanentMailError');
    const list = (await (await fetch(`${api}/messages`)).json()) as { messages: { MessageID: string }[] };
    expect(list.messages.some((m) => m.MessageID === `${eventId}@eunice.ai`)).toBe(false);
  });
});
