// Process entry point. Order matters: configuration is validated first (a service with
// bad configuration refuses to start), then telemetry starts, and only then is the rest
// of the service imported — so the libraries it traces are patched as they first load.
import { loadConfig } from '@eunice/platform/config';
import { startTelemetry } from '@eunice/platform/telemetry';
import { notifierConfig } from './config.ts';

const config = loadConfig(notifierConfig);
const telemetry = startTelemetry({
  serviceName: config.SERVICE_NAME,
  serviceVersion: config.SERVICE_VERSION,
  endpoint: config.OTEL_EXPORTER_OTLP_ENDPOINT,
});
const { start } = await import('./server.ts');
await start(config, telemetry);
