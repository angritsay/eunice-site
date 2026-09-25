import { describe, expect, it } from 'vitest';
import { SUBMISSION_RECEIVED, SubmissionReceived } from '../src/events/submissions.ts';

describe('SubmissionReceived', () => {
  const event = {
    specversion: '1.0',
    id: '0199a3f6-9f1e-7c2d-8a44-5b1e2f3a4b5c',
    source: '/services/intake',
    type: SUBMISSION_RECEIVED,
    time: '2026-09-25T09:30:00.000Z',
    datacontenttype: 'application/json',
    subject: '0199a3f6-9f1e-7c2d-8a44-000000000001',
    data: {
      submissionId: '0199a3f6-9f1e-7c2d-8a44-000000000001',
      variant: 'private-markets',
      desk: 'Private Markets',
      queue: 'leads',
      receivedAt: '2026-09-25T09:30:00.000Z',
      contact: { name: 'Jane Doe', email: 'jane@acme.example', company: 'Acme Capital' },
      details: { fund: 'Gridiron V' },
      entry: { page: 'private-markets/lps/', placement: 'hero', audience: 'lps' },
    },
  };
  it('parses a well-formed envelope', () => expect(SubmissionReceived.safeParse(event).success).toBe(true));
  it('refuses another event type in the same envelope', () => {
    expect(SubmissionReceived.safeParse({ ...event, type: 'ai.eunice.intake.submission.received.v2' }).success).toBe(
      false,
    );
  });
});
