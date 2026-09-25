import { describe, expect, it } from 'vitest';
import { fingerprint } from '../../src/domain/idempotency.ts';
import { MAX_RETENTION_DAYS, MIN_RETENTION_DAYS, purgeAfter } from '../../src/domain/retention.ts';
import { assessSpam, MIN_HUMAN_MS } from '../../src/domain/spam.ts';
import { toSubmission } from '../../src/domain/submission.ts';

describe('spam signals', () => {
  it('lets a person through', () => {
    expect(assessSpam({ honeypot: undefined, elapsedMs: 9000 })).toEqual({ spam: false });
    expect(assessSpam({ honeypot: '', elapsedMs: MIN_HUMAN_MS })).toEqual({ spam: false });
  });

  it('catches a filled honeypot, however slowly it was filled', () => {
    expect(assessSpam({ honeypot: 'https://spam.example', elapsedMs: 60_000 })).toEqual({
      spam: true,
      reason: 'honeypot',
    });
  });

  it('catches a form submitted faster than anyone can type', () => {
    expect(assessSpam({ honeypot: undefined, elapsedMs: MIN_HUMAN_MS - 1 })).toEqual({
      spam: true,
      reason: 'too-fast',
    });
  });
});

describe('idempotency fingerprint', () => {
  const base = {
    variant: 'general',
    fields: { name: 'Jane', email: 'j@x.example' },
    entry: { page: '', placement: 'hero' },
  };

  it('does not depend on key order or on the timing signals of a retry', () => {
    const retry = {
      entry: { placement: 'hero', page: '' },
      fields: { email: 'j@x.example', name: 'Jane' },
      variant: 'general',
      elapsedMs: 12_000,
    };
    expect(fingerprint(retry)).toBe(fingerprint(base));
  });

  it('changes when what was submitted changes', () => {
    expect(fingerprint({ ...base, fields: { ...base.fields, name: 'John' } })).not.toBe(fingerprint(base));
    expect(fingerprint({ ...base, entry: { page: '', placement: 'footer' } })).not.toBe(fingerprint(base));
  });
});

describe('retention', () => {
  const t = new Date('2026-01-01T00:00:00Z');

  it('dates the purge a whole number of days after receipt', () => {
    expect(purgeAfter(t, 365).toISOString()).toBe('2027-01-01T00:00:00.000Z');
  });

  it.each([MIN_RETENTION_DAYS - 1, MAX_RETENTION_DAYS + 1, 30.5])('refuses a period of %s days', (days) => {
    expect(() => purgeAfter(t, days)).toThrow(RangeError);
  });
});

describe('toSubmission', () => {
  it('separates the contact and the message from what the variant asked', () => {
    const s = toSubmission({
      variant: 'token-disclosure',
      desk: 'Token Disclosure',
      queue: 'leads',
      fields: {
        name: 'Jane',
        email: 'j@x.example',
        company: 'Acme',
        message: 'Soon',
        token: 'ACME',
        jurisdiction: undefined,
      },
      entry: { page: 'token-disclosure/', placement: 'band' },
    });
    expect(s.contact).toEqual({ name: 'Jane', email: 'j@x.example', company: 'Acme' });
    expect(s.message).toBe('Soon');
    expect(s.details).toEqual({ token: 'ACME' });
  });

  it('refuses a submission without a name or an email', () => {
    expect(() =>
      toSubmission({
        variant: 'general',
        desk: 'General',
        queue: 'leads',
        fields: { name: 'Jane' },
        entry: { page: '', placement: 'nav' },
      }),
    ).toThrow();
  });
});
