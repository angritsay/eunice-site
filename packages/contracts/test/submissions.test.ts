import { describe, expect, it } from 'vitest';
import { variants } from '../src/forms/variants.ts';
import { SubmissionRequest } from '../src/http/submissions.ts';

const valid = {
  variant: 'private-markets',
  fields: { name: 'Jane Doe', email: 'jane@acme.example', message: 'Gridiron V, committee in March' },
  entry: { page: 'private-markets/lps/', placement: 'hero', audience: 'lps' },
  attribution: { referrer: 'https://www.google.com/', utm: { source: 'newsletter' } },
  elapsedMs: 8200,
};
const errorsOf = (input: unknown) => {
  const r = SubmissionRequest.safeParse(input);
  return r.success ? [] : r.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`);
};

describe('the form registry', () => {
  it.each(variants.map((v) => [v.id, v] as const))(
    '%s asks for a name, an email and an optional note, nothing more',
    (_, v) => {
      expect(v.fields.map((f) => [f.name, f.required])).toEqual([
        ['name', true],
        ['email', true],
        ['message', false],
      ]);
    },
  );
});

describe('SubmissionRequest', () => {
  it('accepts a complete private-markets submission', () => {
    expect(errorsOf(valid)).toEqual([]);
  });

  it('refuses a field the form does not ask for', () => {
    expect(errorsOf({ ...valid, fields: { ...valid.fields, fund: 'Gridiron V' } })).toEqual([
      expect.stringContaining('fields'),
    ]);
  });

  it('needs only a name and an email', () => {
    expect(errorsOf({ ...valid, fields: { name: 'Jane Doe', email: 'jane@acme.example' } })).toEqual([]);
  });

  it('refuses an unknown variant', () => {
    expect(errorsOf({ ...valid, variant: 'admin' })).not.toEqual([]);
  });

  it('refuses unexpected top-level keys rather than ignoring them', () => {
    expect(errorsOf({ ...valid, recipient: 'attacker@evil.example' })).not.toEqual([]);
  });

  it('refuses line breaks in single-line fields, which would reach email headers', () => {
    const injected = { ...valid, fields: { ...valid.fields, name: 'Jane\r\nBcc: victim@example.com' } };
    expect(errorsOf(injected)).toEqual([expect.stringMatching(/^fields\.name: must be a single line/)]);
  });

  it('refuses a malformed email', () => {
    expect(errorsOf({ ...valid, fields: { ...valid.fields, email: 'not-an-email' } })).not.toEqual([]);
  });

  it.each(['../../etc/', '/private-markets/', 'Private-Markets/', 'lps'])('refuses the page path %s', (page) => {
    expect(errorsOf({ ...valid, entry: { ...valid.entry, page } })).not.toEqual([]);
  });

  it('accepts the home page as an empty path', () => {
    expect(errorsOf({ ...valid, entry: { page: '', placement: 'nav' } })).toEqual([]);
  });
});
