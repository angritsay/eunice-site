import { describe, expect, it } from 'vitest';
import { variants } from '../src/forms/variants.ts';
import { SubmissionRequest } from '../src/http/submissions.ts';

const valid = {
  variant: 'private-markets',
  fields: { name: 'Jane Doe', email: 'jane@acme.example', company: 'Acme Capital', fund: 'Gridiron V' },
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
    '%s asks for a name and an email, and names each field once',
    (_, v) => {
      const names = v.fields.map((f) => f.name);
      expect(new Set(names).size).toBe(names.length);
      expect(v.fields.find((f) => f.name === 'name')?.required).toBe(true);
      expect(v.fields.find((f) => f.name === 'email')?.required).toBe(true);
    },
  );
});

describe('SubmissionRequest', () => {
  it('accepts a complete private-markets submission', () => {
    expect(errorsOf(valid)).toEqual([]);
  });

  it("validates fields against the variant's own schema", () => {
    // `fund` belongs to private-markets; on digital-assets it is an unknown key.
    expect(errorsOf({ ...valid, variant: 'digital-assets' })).toEqual([expect.stringContaining('fields')]);
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

  describe('careers', () => {
    const apply = (link: string) => ({
      variant: 'careers',
      fields: { name: 'Sam', email: 'sam@example.com', link, message: 'I have run diligence myself.' },
      entry: { page: 'careers/', placement: 'roles', role: 'Senior Software / AI Engineer' },
      elapsedMs: 30000,
    });
    it('accepts an https link', () => expect(errorsOf(apply('https://github.com/sam'))).toEqual([]));
    it.each(['http://github.com/sam', 'javascript:alert(1)', 'data:text/html,hi', 'https://localhost/x'])(
      'refuses %s',
      (link) => expect(errorsOf(apply(link))).not.toEqual([]),
    );
    it('requires the link and the message', () => {
      const { link: _, message: __, ...rest } = apply('https://x.example').fields;
      expect(errorsOf({ ...apply('https://x.example'), fields: rest })).toHaveLength(2);
    });
  });

  it('only accepts listed jurisdictions', () => {
    const td = (jurisdiction: string) => ({
      ...valid,
      variant: 'token-disclosure',
      fields: { name: 'A', email: 'a@b.example', jurisdiction },
    });
    expect(errorsOf(td('EU — MiCA'))).toEqual([]);
    expect(errorsOf(td('Mars'))).not.toEqual([]);
  });

  it.each(['../../etc/', '/private-markets/', 'Private-Markets/', 'lps'])('refuses the page path %s', (page) => {
    expect(errorsOf({ ...valid, entry: { ...valid.entry, page } })).not.toEqual([]);
  });

  it('accepts the home page as an empty path', () => {
    expect(errorsOf({ ...valid, entry: { page: '', placement: 'nav' } })).toEqual([]);
  });
});
