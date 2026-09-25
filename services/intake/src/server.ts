// Wiring: the one place that knows every adapter. It builds the adapters, hands them to
// the use cases as ports, serves HTTP, runs the retention purge, and shuts down cleanly.
import { randomUUID } from 'node:crypto';
import { createDb, createLogger, createPool } from '@eunice/platform';
import type { Telemetry } from '@eunice/platform/telemetry';
import { serve } from '@hono/node-server';
import { createApp } from './adapters/http/app.ts';
import { adminToken, clientIp } from './adapters/http/guards.ts';
import type { DB } from './adapters/postgres/schema.ts';
import { postgresSubmissionStore } from './adapters/postgres/store.ts';
import { makeErase, makePurgeExpired } from './application/retention.ts';
import { makeSubmit } from './application/submit.ts';
import type { IntakeConfig } from './config.ts';

export const EVENT_SOURCE = '/services/intake';

export async function start(config: IntakeConfig, telemetry: Telemetry) {
  const log = createLogger({ service: config.SERVICE_NAME, version: config.SERVICE_VERSION, level: config.LOG_LEVEL });
  const pool = createPool(config.DATABASE_URL, { applicationName: config.SERVICE_NAME });
  pool.on('error', (err) => log.error({ err }, 'idle database connection failed'));
  const db = createDb<DB>(pool);

  const store = postgresSubmissionStore(db);
  const clock = { now: () => new Date() };
  const submit = makeSubmit({
    store,
    clock,
    ids: { uuid: randomUUID },
    log,
    retentionDays: config.RETENTION_DAYS,
    source: EVENT_SOURCE,
  });
  const purgeExpired = makePurgeExpired({ store, clock, log });

  const app = createApp({
    submit,
    erase: makeErase({ store, log }),
    log,
    readiness: { database: () => pool.query('select 1') },
    allowedOrigins: config.ALLOWED_ORIGINS,
    rateLimit: { max: config.RATE_LIMIT_MAX, windowMs: config.RATE_LIMIT_WINDOW_SECONDS * 1000 },
    clientIp: clientIp(config.CLIENT_IP_HEADER),
    isAdmin: adminToken(config.ADMIN_TOKEN_SHA256),
    version: config.SERVICE_VERSION,
  });

  // Retention runs in the service, on a timer: deleting is idempotent, so running it on
  // more than one instance is harmless, and there is no scheduler to operate.
  const purge = () => purgeExpired().catch((err: unknown) => log.error({ err }, 'retention purge failed'));
  void purge();
  const purgeTimer = setInterval(purge, config.PURGE_INTERVAL_MINUTES * 60_000);
  purgeTimer.unref();

  const server = serve({ fetch: app.fetch, port: config.PORT }, (info) =>
    log.info({ port: info.port, env: config.SITE_ENV }, 'intake listening'),
  );

  let stopping = false;
  const stop = async (signal: string) => {
    if (stopping) return;
    stopping = true;
    log.info({ signal }, 'shutting down');
    clearInterval(purgeTimer);
    // Stop accepting connections and let in-flight requests finish, then release the rest.
    await new Promise<void>((resolve) => server.close(() => resolve()));
    await db.destroy();
    await telemetry.shutdown();
    process.exit(0);
  };
  process.once('SIGTERM', () => void stop('SIGTERM'));
  process.once('SIGINT', () => void stop('SIGINT'));
}
