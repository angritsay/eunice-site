// Wiring: builds the adapters, hands them to the use case, consumes the stream, and
// shuts down cleanly — finishing the message in hand before closing the connection.

import { SUBMISSION_RECEIVED_SUBJECT } from '@eunice/contracts';
import { createDb, createLogger, createPool } from '@eunice/platform';
import { connectNats, consume } from '@eunice/platform/nats';
import type { Telemetry } from '@eunice/platform/telemetry';
import { serve } from '@hono/node-server';
import { mailpitMailer } from './adapters/email/mailpit.ts';
import { resendMailer } from './adapters/email/resend.ts';
import { createApp } from './adapters/http/app.ts';
import { postgresDeliveryLog } from './adapters/postgres/deliveries.ts';
import type { DB } from './adapters/postgres/schema.ts';
import { makeNotify } from './application/notify.ts';
import type { Mailer } from './application/ports.ts';
import type { NotifierConfig } from './config.ts';

/** Redelivery schedule: quick retries for a blip, then spaced out over about two hours. */
export const RETRY_DELAYS_MS = [5_000, 30_000, 120_000, 600_000, 1_800_000, 3_600_000] as const;

export async function start(config: NotifierConfig, telemetry: Telemetry) {
  const log = createLogger({ service: config.SERVICE_NAME, version: config.SERVICE_VERSION, level: config.LOG_LEVEL });
  const pool = createPool(config.DATABASE_URL, { applicationName: config.SERVICE_NAME, max: 5 });
  pool.on('error', (err) => log.error({ err }, 'idle database connection failed'));
  const db = createDb<DB>(pool);
  const deliveries = postgresDeliveryLog(db);

  const mailer: Mailer =
    config.EMAIL_TRANSPORT === 'resend' && config.RESEND_API_KEY
      ? resendMailer({ apiKey: config.RESEND_API_KEY, from: config.MAIL_FROM })
      : mailpitMailer({ baseUrl: config.MAILPIT_URL ?? '', from: config.MAIL_FROM });

  const notify = makeNotify({
    mailer,
    deliveries,
    routing: { opsInbox: config.OPS_INBOX, careersInbox: config.CAREERS_INBOX, siteUrl: config.SITE_URL },
    clock: { now: () => new Date() },
    log,
  });

  const nc = await connectNats(config.NATS_URL, config.SERVICE_NAME);
  // The stream is intake's; wait for it to exist rather than declaring it here.
  let consumer: Awaited<ReturnType<typeof consume>> | undefined;
  for (let delay = 500; !consumer; delay = Math.min(delay * 2, 10_000)) {
    try {
      consumer = await consume(
        nc,
        {
          stream: 'INTAKE',
          durable: 'notifier',
          filterSubject: SUBMISSION_RECEIVED_SUBJECT,
          retryDelaysMs: RETRY_DELAYS_MS,
        },
        log,
        (d) => notify(d.data, { lastAttempt: d.lastAttempt }),
      );
    } catch (err) {
      log.warn(
        { err: err instanceof Error ? err.message : String(err), retryInMs: delay },
        'waiting for the INTAKE stream',
      );
      await new Promise((r) => setTimeout(r, delay));
    }
  }
  log.info({ subject: SUBMISSION_RECEIVED_SUBJECT }, 'consuming');

  const purge = () =>
    deliveries
      .deleteOlderThan(new Date(Date.now() - config.DELIVERY_RECORD_DAYS * 86_400_000))
      .catch((err: unknown) => log.error({ err }, 'delivery record purge failed'));
  void purge();
  const purgeTimer = setInterval(purge, 6 * 3_600_000);
  purgeTimer.unref();

  const app = createApp({
    log,
    readiness: {
      database: () => pool.query('select 1'),
      broker: async () => {
        if (nc.isClosed()) throw new Error('connection closed');
        await nc.flush();
      },
    },
  });
  const server = serve({ fetch: app.fetch, port: config.PORT }, (info) =>
    log.info({ port: info.port, env: config.SITE_ENV, transport: config.EMAIL_TRANSPORT }, 'notifier ready'),
  );

  let stopping = false;
  const stop = async (signal: string) => {
    if (stopping) return;
    stopping = true;
    log.info({ signal }, 'shutting down');
    clearInterval(purgeTimer);
    await consumer?.stop();
    await nc.drain().catch(() => {});
    await new Promise<void>((resolve) => server.close(() => resolve()));
    await db.destroy();
    await telemetry.shutdown();
    process.exit(0);
  };
  process.once('SIGTERM', () => void stop('SIGTERM'));
  process.once('SIGINT', () => void stop('SIGINT'));
}
