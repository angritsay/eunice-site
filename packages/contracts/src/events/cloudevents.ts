// Every event on the bus travels in a CloudEvents 1.0 envelope, so consumers can route,
// deduplicate and trace without reading the payload.
import { z } from 'zod';

export const cloudEvent = <T extends z.ZodType>(type: string, data: T) =>
  z.object({
    specversion: z.literal('1.0'),
    /** Unique per event; consumers deduplicate on it. */
    id: z.uuid(),
    /** The service that produced it, e.g. "/services/intake". */
    source: z.string(),
    /** Reverse-DNS, versioned: a breaking change is a new type, never an edit. */
    type: z.literal(type),
    time: z.iso.datetime({ offset: true }),
    datacontenttype: z.literal('application/json'),
    /** What the event is about, e.g. the submission id. */
    subject: z.string(),
    data,
  });
