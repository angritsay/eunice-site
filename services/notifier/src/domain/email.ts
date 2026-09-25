// The email ops receives for a lead. Written so that a person can act on it from the
// inbox alone: who, which desk, from where on the site, and one click to reply.
//
// Plain text only. Everything in it was typed by a stranger, and text cannot carry
// markup, tracking pixels or links dressed up as something else.
import type { Lead } from './lead.ts';

export interface Email {
  readonly to: string;
  readonly replyTo: { readonly email: string; readonly name: string };
  readonly subject: string;
  readonly text: string;
}

export interface Routing {
  /** Business operations: every lead. */
  readonly opsInbox: string;
  /** The site's origin, to turn a page path into a link, e.g. https://eunice.ai */
  readonly siteUrl: string;
}

/** Header values cannot contain line breaks: that is how headers are injected. */
const oneLine = (s: string, max = 120) => {
  const flat = s.replace(/[\r\n\t]+/g, ' ').trim();
  return flat.length > max ? `${flat.slice(0, max - 1)}…` : flat;
};

const labelOf = (key: string) => key.charAt(0).toUpperCase() + key.slice(1).replace(/[-_]/g, ' ');

const table = (rows: readonly (readonly [string, string | undefined])[]) => {
  const present = rows.filter((r): r is readonly [string, string] => Boolean(r[1]));
  const width = Math.max(...present.map(([k]) => k.length)) + 2;
  return present.map(([k, v]) => `${`${k}:`.padEnd(width)}${v}`).join('\n');
};

export function subjectFor(lead: Lead): string {
  const where = [lead.desk, lead.entry.audience, lead.entry.placement].filter(Boolean).join(' · ');
  const who = lead.contact.company ? `${lead.contact.name} — ${lead.contact.company}` : lead.contact.name;
  return oneLine(`[${where}] ${who}`, 200);
}

export function composeEmail(lead: Lead, routing: Routing): Email {
  const first = lead.contact.name.split(/\s+/)[0] ?? lead.contact.name;
  const pageUrl = new URL(lead.entry.page, `${routing.siteUrl.replace(/\/$/, '')}/`).toString();
  const utm = Object.entries(lead.attribution?.utm ?? {})
    .filter(([, v]) => v)
    .map(([k, v]) => `utm_${k}=${v}`)
    .join(', ');

  const sections = [
    `New lead for the ${lead.desk} desk.`,
    table([
      ['Name', lead.contact.name],
      ['Email', lead.contact.email],
      ['Company', lead.contact.company],
      ...Object.entries(lead.details).map(([k, v]) => [labelOf(k), v] as const),
    ]),
    lead.message ? `Message\n-------\n${lead.message}` : undefined,
    `Where they came from\n${table([
      ['Page', pageUrl],
      ['Button', lead.entry.placement],
      ['Audience', lead.entry.audience],
      ['Referrer', lead.attribution?.referrer],
      ['Campaign', utm || undefined],
    ])}`,
    `Reply to this email to answer ${first} directly.\nSubmission ${lead.submissionId} · received ${lead.receivedAt.toISOString().replace('T', ' ').slice(0, 16)} UTC`,
  ];

  return {
    to: routing.opsInbox,
    replyTo: { email: lead.contact.email, name: oneLine(lead.contact.name) },
    subject: subjectFor(lead),
    text: `${sections.filter(Boolean).join('\n\n')}\n`,
  };
}
