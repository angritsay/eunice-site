// Errors as RFC 9457 problem details, the same shape from every service.
import { z } from 'zod';

export const FieldError = z.object({ path: z.string(), message: z.string() });

export const Problem = z
  .object({
    type: z.string().describe('A URI identifying the kind of problem, or "about:blank".'),
    title: z.string(),
    status: z.number().int().min(400).max(599),
    detail: z.string().optional(),
    instance: z.string().optional(),
    errors: z.array(FieldError).optional().describe('Which inputs were rejected, for 400s.'),
  })
  .meta({ id: 'Problem', description: 'RFC 9457 problem details' });
export type Problem = z.infer<typeof Problem>;
