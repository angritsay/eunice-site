import { Writable } from 'node:stream';
import { pino } from 'pino';
import { describe, expect, it } from 'vitest';
import { REDACTED_PATHS } from '../src/logger.ts';

function capture() {
  const lines: string[] = [];
  const stream = new Writable({
    write(chunk, _enc, done) {
      lines.push(String(chunk));
      done();
    },
  });
  const log = pino({ redact: { paths: REDACTED_PATHS, censor: '[redacted]' } }, stream);
  return { log, text: () => lines.join('') };
}

describe('log redaction', () => {
  it('never writes a lead’s personal data, however it is nested', () => {
    const { log, text } = capture();
    log.info(
      { email: 'jane@acme.example', submission: { contact: { email: 'jane@acme.example' }, name: 'Jane Doe' } },
      'stored',
    );
    log.info({ fields: { name: 'Jane Doe', fund: 'Gridiron V' } }, 'rejected');
    expect(text()).not.toMatch(/jane@acme|Jane Doe|Gridiron/);
    expect(text()).toContain('[redacted]');
  });

  it('keeps what an operator needs', () => {
    const { log, text } = capture();
    log.info({ submissionId: 'abc', variant: 'private-markets', status: 202 }, 'accepted');
    expect(text()).toContain('"submissionId":"abc"');
    expect(text()).toContain('"variant":"private-markets"');
  });
});
