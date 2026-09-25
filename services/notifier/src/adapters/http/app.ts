// notifier has no API: only the probes the platform uses to decide whether it is alive
// and ready.
import { type Check, healthRoutes, type Logger, notFound, problemHandler } from '@eunice/platform';
import { Hono } from 'hono';

export function createApp(deps: { log: Logger; readiness: Record<string, Check> }) {
  const app = new Hono();
  app.onError(problemHandler(deps.log));
  app.notFound(notFound);
  app.route('/', healthRoutes(deps.readiness));
  return app;
}
