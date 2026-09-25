// The generator's two safety nets, tested directly: markup is escaped unless it is
// markup, and content that does not match its schema stops the build.
import { expect, test } from '@playwright/test';
import { AudiencePages, content, Insight } from '../../src/content/schema.ts';
import { html, join, raw } from '../../src/lib/html.ts';

test.describe('html``', () => {
  test('escapes interpolated text, in content and in attributes', () => {
    const name = '<script>alert("x")</script> & co';
    expect(String(html`<p title="${name}">${name}</p>`)).toBe(
      '<p title="&lt;script&gt;alert(&quot;x&quot;)&lt;/script&gt; &amp; co">&lt;script&gt;alert(&quot;x&quot;)&lt;/script&gt; &amp; co</p>',
    );
  });

  test('inserts markup built with html`` or raw() as is, and never escapes it twice', () => {
    const inner = html`<b>${'a & b'}</b>`;
    expect(String(html`<p>${inner}${raw('<i>ok</i>')}</p>`)).toBe('<p><b>a &amp; b</b><i>ok</i></p>');
  });

  test('renders lists, numbers and booleans, and nothing for null or undefined', () => {
    const items = ['x', 'y<'].map((i) => html`<li>${i}</li>`);
    expect(String(html`<ul>${items}</ul>`)).toBe('<ul><li>x</li><li>y&lt;</li></ul>');
    expect(String(html`${3} ${true} [${null}${undefined}]`)).toBe('3 true []');
    expect(String(join([html`<a>`, html`<b>`], ' '))).toBe('<a> <b>');
  });
});

test.describe('content schema', () => {
  // These values would not even compile if written in src/content; the casts stand in
  // for content that reaches the build some other way, which the schema still stops.
  test('names the file, path and problem of a mistake', () => {
    const bad = { date: '25/09/2026', desk: 'private-markets', type: 'Note', title: 'x' };
    expect(() => content('insights', Insight.array(), [bad] as never)).toThrow(/insights\.0\.date: must be YYYY-MM-DD/);
    expect(() =>
      content('insights', Insight.array(), [{ ...bad, date: '2026-09-25', desk: 'crypto' }] as never),
    ).toThrow(/insights\.0\.desk/);
  });

  test('allows the same audience id on two desks, but not twice on one', () => {
    const page = (desk: 'digital-assets' | 'token-disclosure', id: string) => ({
      id,
      desk,
      nav: 'n',
      card: { title: 't', text: 't' },
      title: 't',
      description: 'd',
      h1: 'h',
      lead: 'l',
      now: ['a', 'b', 'c'],
      work: [1, 2, 3].map(() => ({ title: 't', text: 't' })),
      cta: { title: 't', text: 't' },
    });
    expect(
      AudiencePages.safeParse([page('digital-assets', 'exchanges'), page('token-disclosure', 'exchanges')]).success,
    ).toBe(true);
    expect(() =>
      content('audiencePages', AudiencePages, [
        page('digital-assets', 'exchanges'),
        page('digital-assets', 'exchanges'),
      ]),
    ).toThrow(/duplicate page digital-assets\/exchanges/);
  });
});
