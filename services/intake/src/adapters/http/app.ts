// The HTTP face of intake. Each route is declared once, with its schemas from
// @eunice/contracts: that one declaration validates requests, types the handler, and
// produces the published OpenAPI document, so the three cannot disagree.
import { IDEMPOTENCY_HEADER, Problem, SubmissionAccepted, SubmissionRequest } from '@eunice/contracts';
import {
  accessLog,
  type Check,
  HttpProblem,
  healthRoutes,
  type Logger,
  notFound,
  problemHandler,
  tracing,
} from '@eunice/platform';
import { createRoute, OpenAPIHono, z } from '@hono/zod-openapi';
import { Scalar } from '@scalar/hono-api-reference';
import type { Context } from 'hono';
import { cors } from 'hono/cors';
import type { SubmitOutcome } from '../../application/submit.ts';
import { rateLimit } from './guards.ts';

export interface AppDeps {
  submit(request: SubmissionRequest, idempotencyKey: string): Promise<SubmitOutcome>;
  erase(email: string): Promise<number>;
  log: Logger;
  readiness: Record<string, Check>;
  allowedOrigins: readonly string[];
  rateLimit: { max: number; windowMs: number };
  clientIp(c: Context): string;
  isAdmin(authorization: string | undefined): boolean;
  version: string;
}

const problemResponse = (description: string) => ({
  description,
  content: { 'application/problem+json': { schema: Problem } },
});

const submitRoute = createRoute({
  method: 'post',
  path: '/v1/submissions',
  tags: ['Submissions'],
  summary: 'Submit a form',
  description:
    'Stores a form submission and announces it to the rest of the system. Retrying with the same `Idempotency-Key` returns the original result instead of creating a second submission.',
  request: {
    headers: z.object({
      [IDEMPOTENCY_HEADER.toLowerCase()]: z
        .uuid()
        .describe('A UUID generated when the form was opened. Reused on retry.'),
    }),
    body: { required: true, content: { 'application/json': { schema: SubmissionRequest } } },
  },
  responses: {
    202: {
      description: 'Stored, or recognised as a retry of a stored submission.',
      content: { 'application/json': { schema: SubmissionAccepted } },
    },
    400: problemResponse('The submission did not validate. `errors` says which fields.'),
    409: problemResponse('The Idempotency-Key was already used for a different submission.'),
    429: problemResponse('Too many submissions from this address. See Retry-After.'),
  },
});

const eraseRoute = createRoute({
  method: 'post',
  path: '/v1/admin/erasures',
  tags: ['Admin'],
  summary: 'Erase everything held for an email address',
  description: 'GDPR Art. 17. Deletes every submission, and any unpublished event, for the address.',
  security: [{ bearer: [] }],
  request: {
    body: { required: true, content: { 'application/json': { schema: z.object({ email: z.email() }) } } },
  },
  responses: {
    200: { description: 'Done.', content: { 'application/json': { schema: z.object({ deleted: z.number().int() }) } } },
    401: problemResponse('Missing or wrong admin token.'),
  },
});

export function createApp(deps: AppDeps) {
  const app = new OpenAPIHono({
    // Validation failures become 400 problem details listing each rejected field.
    defaultHook: (result) => {
      if (!result.success) {
        throw new HttpProblem(400, 'Invalid request', {
          detail: 'Some fields were missing or not valid.',
          errors: result.error.issues.map((i) => ({ path: i.path.join('.'), message: i.message })),
        });
      }
    },
  });

  app.onError(problemHandler(deps.log));
  app.notFound(notFound);
  app.use('*', tracing('intake'));
  app.use('*', accessLog(deps.log));
  app.use(
    '/v1/submissions',
    cors({
      origin: (origin) => (deps.allowedOrigins.includes(origin) ? origin : null),
      allowMethods: ['POST'],
      allowHeaders: ['Content-Type', IDEMPOTENCY_HEADER, 'traceparent'],
      maxAge: 600,
    }),
  );
  app.use('/v1/submissions', rateLimit({ ...deps.rateLimit, key: deps.clientIp }));
  app.use('/v1/admin/*', async (c, next) => {
    if (!deps.isAdmin(c.req.header('authorization'))) throw new HttpProblem(401, 'Unauthorized');
    await next();
  });

  app.openapi(submitRoute, async (c) => {
    const key = c.req.valid('header')[IDEMPOTENCY_HEADER.toLowerCase()] as string;
    const outcome = await deps.submit(c.req.valid('json'), key);
    if (outcome.kind === 'conflict') {
      throw new HttpProblem(409, 'Conflict', {
        detail: `This ${IDEMPOTENCY_HEADER} was already used for a different submission.`,
      });
    }
    return c.json({ id: outcome.id, status: 'received' as const }, 202);
  });

  app.openapi(eraseRoute, async (c) => c.json({ deleted: await deps.erase(c.req.valid('json').email) }, 200));

  app.openAPIRegistry.registerComponent('securitySchemes', 'bearer', { type: 'http', scheme: 'bearer' });
  app.doc31('/openapi.json', {
    openapi: '3.1.0',
    info: {
      title: 'Eunice intake',
      version: deps.version,
      description: 'Receives form submissions from eunice.ai. Errors are RFC 9457 problem details.',
    },
  });
  app.get('/docs', Scalar({ url: 'openapi.json', pageTitle: 'Eunice intake API' }));
  app.route('/', healthRoutes(deps.readiness));
  return app;
}
