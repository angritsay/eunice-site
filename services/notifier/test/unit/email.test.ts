import { describe, expect, it } from 'vitest';
import { composeEmail, subjectFor } from '../../src/domain/email.ts';
import type { Lead } from '../../src/domain/lead.ts';

const routing = { opsInbox: 'ops@eunice.ai', siteUrl: 'https://eunice.ai' };

const lead: Lead = {
  submissionId: '0199a0c2-0000-7000-8000-000000000001',
  desk: 'Private Markets',
  receivedAt: new Date('2026-09-25T10:00:00Z'),
  contact: { name: 'Jane Doe', email: 'jane@acme.example', company: 'Acme Capital' },
  details: { fund: 'Gridiron Fund V' },
  message: 'IC on 12 October.',
  entry: { page: 'private-markets/lps/', placement: 'hero', audience: 'lps' },
  attribution: { referrer: 'https://www.google.com/', utm: { source: 'newsletter', campaign: 'q4' } },
};

describe('the ops email', () => {
  it('says which desk, from where, and who — in the subject', () => {
    expect(subjectFor(lead)).toBe('[Private Markets · lps · hero] Jane Doe — Acme Capital');
  });

  it('goes to the ops inbox, and a reply goes to the lead', () => {
    const email = composeEmail(lead, routing);
    expect(email.to).toBe('ops@eunice.ai');
    expect(email.replyTo).toEqual({ email: 'jane@acme.example', name: 'Jane Doe' });
  });

  it('carries every field and the attribution ops needs to open the conversation', () => {
    const { text } = composeEmail(lead, routing);
    expect(text).toContain('New lead for the Private Markets desk.');
    expect(text).toMatch(/Fund:\s+Gridiron Fund V/);
    expect(text).toContain('IC on 12 October.');
    expect(text).toMatch(/Page:\s+https:\/\/eunice\.ai\/private-markets\/lps\//);
    expect(text).toContain('utm_source=newsletter, utm_campaign=q4');
    expect(text).toContain('Reply to this email to answer Jane directly.');
    expect(text).toContain(lead.submissionId);
  });

  it('names only the person when no firm was given', () => {
    const { company: _, ...contact } = lead.contact;
    expect(subjectFor({ ...lead, contact })).toBe('[Private Markets · lps · hero] Jane Doe');
  });

  it('cannot be made to inject a header through a name', () => {
    const hostile: Lead = { ...lead, contact: { ...lead.contact, name: 'Eve\r\nBcc: everyone@example.com' } };
    const email = composeEmail(hostile, routing);
    expect(email.subject).not.toMatch(/[\r\n]/);
    expect(email.replyTo.name).not.toMatch(/[\r\n]/);
  });

  it('leaves out what was not given', () => {
    const bare: Lead = {
      ...lead,
      contact: { name: 'Jo', email: 'jo@x.example' },
      details: {},
      message: undefined,
      attribution: undefined,
    };
    const { text, subject } = composeEmail(bare, routing);
    expect(subject).toBe('[Private Markets · lps · hero] Jo');
    expect(text).not.toContain('Company');
    expect(text).not.toContain('Message');
    expect(text).not.toContain('Campaign');
  });
});
