import { loadConfig } from '@eunice/platform/config';
import { describe, expect, it } from 'vitest';
import { notifierConfig } from '../../src/config.ts';

const env = {
  SERVICE_NAME: 'notifier',
  DATABASE_URL: 'postgres://notifier_app:x@db/eunice',
  NATS_URL: 'nats://nats:4222',
  OPS_INBOX: 'ops@eunice.ai',
  CAREERS_INBOX: 'careers@eunice.ai',
  MAIL_FROM: 'Eunice site <notify@notify.eunice.ai>',
  SITE_URL: 'https://eunice.ai',
  EMAIL_TRANSPORT: 'mailpit',
  MAILPIT_URL: 'http://mailpit:8025',
};

describe('notifier configuration', () => {
  it('reads a sender with a display name', () => {
    expect(loadConfig(notifierConfig, env).MAIL_FROM).toEqual({
      name: 'Eunice site',
      email: 'notify@notify.eunice.ai',
    });
  });

  it('refuses to run in production without a real email provider', () => {
    expect(() => loadConfig(notifierConfig, { ...env, SITE_ENV: 'production' })).toThrow(/EMAIL_TRANSPORT/);
    expect(() => loadConfig(notifierConfig, { ...env, EMAIL_TRANSPORT: 'resend' })).toThrow(/RESEND_API_KEY/);
  });

  it('refuses a sender that could inject a header', () => {
    expect(() => loadConfig(notifierConfig, { ...env, MAIL_FROM: 'Eve\r\nBcc: x <a@b.example>' })).toThrow(/MAIL_FROM/);
  });
});
