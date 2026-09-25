// Writes the AsyncAPI 3.0 document for the events that cross service boundaries, from
// the same zod schemas the services validate with. CI regenerates it and fails on any
// difference, as for OpenAPI.
import { writeFile } from 'node:fs/promises';
import { z } from 'zod';
import { SUBMISSION_RECEIVED, SUBMISSION_RECEIVED_SUBJECT, SubmissionReceived } from '../src/events/submissions.ts';

const doc = {
  asyncapi: '3.0.0',
  info: {
    title: 'Eunice events',
    version: '1.0.0',
    description:
      'Events published on NATS JetStream. Each is a CloudEvents 1.0 envelope; `Nats-Msg-Id` is the event id (the broker de-duplicates on it) and `traceparent` continues the trace of the request that caused it. Messages carrying personal data live on a work-queue stream and are deleted once acknowledged.',
  },
  defaultContentType: 'application/json',
  servers: {
    local: { host: 'localhost:4222', protocol: 'nats', description: 'docker compose' },
  },
  channels: {
    submissionReceived: {
      address: SUBMISSION_RECEIVED_SUBJECT,
      description: 'A form submission was stored by intake. Stream INTAKE (work queue, 7-day maximum age).',
      messages: { SubmissionReceived: { $ref: '#/components/messages/SubmissionReceived' } },
    },
  },
  operations: {
    publishSubmissionReceived: {
      action: 'send',
      channel: { $ref: '#/channels/submissionReceived' },
      summary: 'intake publishes it from its transactional outbox, at least once.',
      messages: [{ $ref: '#/channels/submissionReceived/messages/SubmissionReceived' }],
    },
    notifyOps: {
      action: 'receive',
      channel: { $ref: '#/channels/submissionReceived' },
      summary: 'notifier (durable consumer "notifier") emails the ops or careers inbox, once per event id.',
      messages: [{ $ref: '#/channels/submissionReceived/messages/SubmissionReceived' }],
    },
  },
  components: {
    messages: {
      SubmissionReceived: {
        name: SUBMISSION_RECEIVED,
        title: 'Submission received',
        headers: {
          type: 'object',
          properties: {
            'Nats-Msg-Id': { type: 'string', format: 'uuid', description: 'The CloudEvents id.' },
            traceparent: { type: 'string', description: 'W3C Trace Context.' },
          },
          required: ['Nats-Msg-Id'],
        },
        payload: {
          schemaFormat: 'application/schema+json;version=draft-07',
          schema: z.toJSONSchema(SubmissionReceived, { target: 'draft-07' }),
        },
      },
    },
  },
};

const out = new URL('../generated/asyncapi.json', import.meta.url);
await writeFile(out, `${JSON.stringify(doc, null, 2)}\n`);
console.log(`wrote ${out.pathname}`);
