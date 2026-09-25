// Request-level protections: who the client is, whether they are sending too much,
// and whether they may use the admin endpoints.
import { createHash, timingSafeEqual } from 'node:crypto';
import { HttpProblem } from '@eunice/platform';
import { getConnInfo } from '@hono/node-server/conninfo';
import type { Context, MiddlewareHandler } from 'hono';

/**
 * The client's address. Behind our own edge, from the header it sets — never from a
 * header a client could set itself; with no edge configured, from the socket.
 */
export const clientIp =
  (trustedHeader: string | undefined) =>
  (c: Context): string => {
    if (trustedHeader) {
      const first = c.req.header(trustedHeader)?.split(',')[0]?.trim();
      if (first) return first;
    }
    return getConnInfo(c).remote.address ?? 'unknown';
  };

/**
 * A fixed window per client. State is in memory, which is right for one instance and
 * documented as the limit: more instances would each allow the full rate.
 */
export function rateLimit(opts: {
  max: number;
  windowMs: number;
  key: (c: Context) => string;
  now?: () => number;
}): MiddlewareHandler {
  const now = opts.now ?? Date.now;
  const windows = new Map<string, { count: number; resetAt: number }>();
  return async (c, next) => {
    const t = now();
    const key = opts.key(c);
    let w = windows.get(key);
    if (!w || w.resetAt <= t) {
      w = { count: 0, resetAt: t + opts.windowMs };
      windows.set(key, w);
    }
    w.count++;
    if (windows.size > 10_000) for (const [k, v] of windows) if (v.resetAt <= t) windows.delete(k);
    if (w.count > opts.max) {
      throw new HttpProblem(429, 'Too Many Requests', {
        detail: 'Too many submissions from this address. Please try again later.',
        headers: { 'Retry-After': String(Math.ceil((w.resetAt - t) / 1000)) },
      });
    }
    await next();
  };
}

/** Bearer-token check against a stored sha256, in constant time. The token is never stored. */
export const adminToken = (sha256Hex: string) => {
  const want = Buffer.from(sha256Hex, 'hex');
  return (authorization: string | undefined): boolean => {
    const token = authorization?.match(/^Bearer (\S+)$/)?.[1];
    if (!token) return false;
    const got = createHash('sha256').update(token).digest();
    return got.length === want.length && timingSafeEqual(got, want);
  };
};
