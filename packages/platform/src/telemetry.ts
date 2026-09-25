// OpenTelemetry, exported over OTLP/HTTP. Start it before anything instrumented is
// imported: a service's main.ts loads its config and this module, starts telemetry, and
// only then imports the rest of the service, so pg and http are patched on first load.
//
// Incoming HTTP spans are created by the tracing middleware in http.ts, which knows the
// route template; auto-instrumentation covers what the service calls out to: Postgres
// (statement text only, never parameter values) and outgoing HTTP.
import { register } from 'node:module';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { HttpInstrumentation } from '@opentelemetry/instrumentation-http';
import { PgInstrumentation } from '@opentelemetry/instrumentation-pg';
import { UndiciInstrumentation } from '@opentelemetry/instrumentation-undici';
import { resourceFromAttributes } from '@opentelemetry/resources';
import { NodeSDK } from '@opentelemetry/sdk-node';
import { ATTR_SERVICE_NAME, ATTR_SERVICE_VERSION } from '@opentelemetry/semantic-conventions';

export interface Telemetry {
  shutdown(): Promise<void>;
}

export function startTelemetry(opts: {
  serviceName: string;
  serviceVersion: string;
  endpoint: string | undefined;
}): Telemetry {
  if (!opts.endpoint) return { shutdown: async () => {} };
  // Traces only. Metrics and logs are not exported over OTLP (logs go to stdout).
  process.env['OTEL_METRICS_EXPORTER'] ??= 'none';
  process.env['OTEL_LOGS_EXPORTER'] ??= 'none';
  // Services are ES modules; this hook lets the instrumentations patch what they import.
  register('@opentelemetry/instrumentation/hook.mjs', import.meta.url);
  const sdk = new NodeSDK({
    resource: resourceFromAttributes({
      [ATTR_SERVICE_NAME]: opts.serviceName,
      [ATTR_SERVICE_VERSION]: opts.serviceVersion,
    }),
    traceExporter: new OTLPTraceExporter({ url: `${opts.endpoint.replace(/\/$/, '')}/v1/traces` }),
    instrumentations: [
      // Not "ignore incoming requests": ignoring one suppresses tracing for everything
      // it does, which would blank the server span, the database spans and the outbox
      // traceparent. Incoming spans come from the tracing middleware instead.
      new HttpInstrumentation({ disableIncomingRequestInstrumentation: true }),
      new PgInstrumentation({ enhancedDatabaseReporting: false }),
      new UndiciInstrumentation(),
    ],
  });
  sdk.start();
  return { shutdown: () => sdk.shutdown() };
}
