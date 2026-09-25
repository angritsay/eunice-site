// Structured JSON logs to stdout. Personal data is redacted by path before a line is
// written, and every line inside a traced operation carries its trace and span ids,
// so a log line and its trace in Jaeger can be found from each other.
import { trace } from '@opentelemetry/api';
import { type Logger, pino, stdTimeFunctions } from 'pino';

/** Anything under these keys is replaced before it reaches a log line. */
export const REDACTED_PATHS = [
  'email',
  'name',
  'company',
  'message',
  'fields',
  'details',
  'contact',
  '*.email',
  '*.name',
  '*.company',
  '*.message',
  '*.fields',
  '*.details',
  '*.contact',
  'req.headers.authorization',
  'req.headers.cookie',
  'headers.authorization',
];

export function createLogger(opts: { service: string; version: string; level: string }): Logger {
  return pino({
    level: opts.level,
    base: { service: opts.service, version: opts.version },
    timestamp: stdTimeFunctions.isoTime,
    redact: { paths: REDACTED_PATHS, censor: '[redacted]' },
    formatters: { level: (label) => ({ level: label }) },
    mixin() {
      const ctx = trace.getActiveSpan()?.spanContext();
      return ctx ? { trace_id: ctx.traceId, span_id: ctx.spanId } : {};
    },
  });
}
export type { Logger };
