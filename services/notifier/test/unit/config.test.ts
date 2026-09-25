import { loadConfig } from '@eunice/platform/config';
import { describe, expect, it } from 'vitest';
import { notifierConfig } from '../../src/config.ts';

const env = {
  SERVICE_NAME: 'notifier',
  DATABASE_URL: 'postgres://notifier_app:x@db/eunice',
  NATS_URL: 'nats://nats:4222',
  OPS_INBOX: 'ops@eunice.ai',
  MAIL_FROM: 'Eunice site <notify@notify.eunice.ai>',
  SITE_URL: 'https://eunice.ai',
  SMTP_HOST: 'smtp-relay.gmail.com',
};

describe('notifier configuration', () => {
  it('reads a sender with a display name', () => {
    expect(loadConfig(notifierConfig, env).MAIL_FROM).toEqual({
      name: 'Eunice site',
      email: 'notify@notify.eunice.ai',
    });
  });

  it('sends over TLS on port 587 unless told otherwise', () => {
    expect(loadConfig(notifierConfig, env)).toMatchObject({ SMTP_PORT: 587, SMTP_REQUIRE_TLS: true });
    expect(loadConfig(notifierConfig, { ...env, SMTP_REQUIRE_TLS: 'false' }).SMTP_REQUIRE_TLS).toBe(false);
  });

  it('refuses to send lead details unencrypted in production', () => {
    expect(() => loadConfig(notifierConfig, { ...env, SITE_ENV: 'production', SMTP_REQUIRE_TLS: 'false' })).toThrow(
      /SMTP_REQUIRE_TLS/,
    );
    expect(loadConfig(notifierConfig, { ...env, SITE_ENV: 'production' }).SMTP_REQUIRE_TLS).toBe(true);
  });

  it('refuses a sender that could inject a header', () => {
    expect(() => loadConfig(notifierConfig, { ...env, MAIL_FROM: 'Eve\r\nBcc: x <a@b.example>' })).toThrow(/MAIL_FROM/);
  });
});
