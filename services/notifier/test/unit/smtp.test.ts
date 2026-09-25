import { describe, expect, it } from 'vitest';
import { isPermanent } from '../../src/adapters/email/smtp.ts';

describe('SMTP failures', () => {
  it('gives up only on a message the server refused as such', () => {
    expect(isPermanent({ command: 'DATA', responseCode: 552 })).toBe(true); // message too large
    expect(isPermanent({ command: 'DATA', responseCode: 554 })).toBe(true); // rejected as content
  });

  it('keeps retrying what an admin or time can fix', () => {
    expect(isPermanent({ command: 'STARTTLS', responseCode: 502, code: 'ETLS' })).toBe(false); // TLS not offered
    expect(isPermanent({ command: 'RCPT TO', responseCode: 550 })).toBe(false); // relay not allowed for our IP
    expect(isPermanent({ code: 'EENVELOPE' })).toBe(false); // every recipient refused
    expect(isPermanent({ command: 'DATA', responseCode: 451 })).toBe(false); // try again later
    expect(isPermanent({ code: 'ETIMEDOUT' })).toBe(false);
    expect(isPermanent(new Error('socket hang up'))).toBe(false);
  });
});
