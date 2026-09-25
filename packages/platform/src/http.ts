// What every service's HTTP layer shares: a server span per request named by route,
// errors as RFC 9457 problem details, and access logs without personal data.
import { context, propagation, SpanKind, SpanStatusCode, trace } from '@opentelemetry/api';
import type { Context, ErrorHandler, MiddlewareHandler, NotFoundHandler } from 'hono';
import { routePath } from 'hono/route';
import type { Logger } from './logger.ts';

export interface FieldError {
  path: string;
  message: string;
}

/** An error that is meant for the client. Anything else becomes an opaque 500. */
export class HttpProblem extends Error {
  readonly status: number;
  readonly title: string;
  readonly detail: string | undefined;
  readonly errors: readonly FieldError[] | undefined;
  readonly headers: Record<string, string>;
  constructor(
    status: number,
    title: string,
    opts: { detail?: string; errors?: readonly FieldError[]; headers?: Record<string, string> } = {},
  ) {
    super(opts.detail ?? title);
    this.name = 'HttpProblem';
    this.status = status;
    this.title = title;
    this.detail = opts.detail;
    this.errors = opts.errors;
    this.headers = opts.headers ?? {};
  }
}

export function problem(c: Context, p: HttpProblem) {
  const body = {
    type: 'about:blank',
    title: p.title,
    status: p.status,
    ...(p.detail ? { detail: p.detail } : {}),
    ...(p.errors ? { errors: p.errors } : {}),
    instance: c.req.path,
  };
  return c.newResponse(JSON.stringify(body), p.status as 400, {
    ...p.headers,
    'content-type': 'application/problem+json',
  });
}

export const problemHandler =
  (log: Logger): ErrorHandler =>
  (err, c) => {
    if (err instanceof HttpProblem) return problem(c, err);
    log.error({ err }, 'unhandled error');
    return problem(c, new HttpProblem(500, 'Internal Server Error', { detail: 'Something went wrong on our side.' }));
  };

export const notFound: NotFoundHandler = (c) => problem(c, new HttpProblem(404, 'Not Found'));

/**
 * One server span per request, continuing the caller's trace from its traceparent
 * header. Named by route template, so every submission groups under one operation.
 */
export function tracing(tracerName: string): MiddlewareHandler {
  const tracer = trace.getTracer(tracerName);
  return async (c, next) => {
    const parent = propagation.extract(context.active(), c.req.header());
    const span = tracer.startSpan(`${c.req.method} ${c.req.path}`, { kind: SpanKind.SERVER }, parent);
    await context.with(trace.setSpan(parent, span), async () => {
      try {
        await next();
      } finally {
        const route = routePath(c);
        span.updateName(`${c.req.method} ${route}`);
        span.setAttributes({
          'http.request.method': c.req.method,
          'http.route': route,
          'http.response.status_code': c.res.status,
        });
        if (c.res.status >= 500) span.setStatus({ code: SpanStatusCode.ERROR });
        span.end();
      }
    });
  };
}

/** One line per request: method, route, status, duration. No bodies, no query strings. */
export function accessLog(log: Logger): MiddlewareHandler {
  return async (c, next) => {
    const start = performance.now();
    await next();
    if (c.req.path === '/healthz' || c.req.path === '/readyz') return;
    log.info(
      { method: c.req.method, route: routePath(c), status: c.res.status, ms: Math.round(performance.now() - start) },
      'request',
    );
  };
}
