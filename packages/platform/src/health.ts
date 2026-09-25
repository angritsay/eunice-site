// Liveness says the process is up. Readiness says it can do its job right now: each
// dependency check must pass within a deadline, or the orchestrator stops sending
// traffic until it does.
import { Hono } from 'hono';

export type Check = () => Promise<unknown>;

const within = (ms: number, check: Check) =>
  Promise.race([
    check(),
    new Promise((_, reject) => setTimeout(() => reject(new Error(`timed out after ${ms}ms`)), ms)),
  ]);

export function healthRoutes(checks: Record<string, Check>, timeoutMs = 2000) {
  return new Hono()
    .get('/healthz', (c) => c.json({ status: 'ok' }))
    .get('/readyz', async (c) => {
      const results = await Promise.all(
        Object.entries(checks).map(async ([name, check]) => {
          try {
            await within(timeoutMs, check);
            return [name, 'ok'] as const;
          } catch (err) {
            return [name, err instanceof Error ? err.message : 'failed'] as const;
          }
        }),
      );
      const ready = results.every(([, r]) => r === 'ok');
      return c.json(
        { status: ready ? 'ready' : 'unavailable', checks: Object.fromEntries(results) },
        ready ? 200 : 503,
      );
    });
}
