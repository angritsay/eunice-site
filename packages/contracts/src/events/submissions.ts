// Published by intake once a submission is safely stored. It carries the lead's details
// (event-carried state) so the notifier never needs to call intake back; in exchange the
// stream deletes each message once it is acknowledged — see ADR on personal data.
import { z } from 'zod';
import { EntryPoint } from '../forms/entry.ts';
import { Attribution } from '../http/submissions.ts';
import { cloudEvent } from './cloudevents.ts';

export const SUBMISSION_RECEIVED = 'ai.eunice.intake.submission.received.v1';
/** The NATS subject it is published on. */
export const SUBMISSION_RECEIVED_SUBJECT = 'intake.submission.received.v1';

export const SubmissionReceivedData = z.object({
  submissionId: z.uuid(),
  variant: z.string(),
  desk: z.string(),
  receivedAt: z.iso.datetime({ offset: true }),
  contact: z.object({
    name: z.string(),
    email: z.email(),
    company: z.string().optional(),
  }),
  /** The variant's other fields, if it asks any beyond name, email and message. */
  details: z.record(z.string(), z.string()),
  message: z.string().optional(),
  entry: EntryPoint,
  attribution: Attribution.optional(),
});
export type SubmissionReceivedData = z.infer<typeof SubmissionReceivedData>;

export const SubmissionReceived = cloudEvent(SUBMISSION_RECEIVED, SubmissionReceivedData).meta({
  id: 'SubmissionReceived',
  description: 'A form submission was stored. Carries the contact details the notifier needs.',
});
export type SubmissionReceived = z.infer<typeof SubmissionReceived>;
