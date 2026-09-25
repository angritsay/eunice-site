import { Hono } from 'hono';
import { pino } from 'pino';
import { describe, expect, it } from 'vitest';
import { healthRoutes } from '../src/health.ts';
import { HttpProblem, notFound, problemHandler } from '../src/http.ts';

const silent = pino({ level: 'silent' });

describe('problem details', () => {
  const app = new Hono()
    .get('/bad', () => {
      throw new HttpProblem(422, 'Unprocessable', {
        detail: 'nope',
        errors: [{ path: 'fields.email', message: 'invalid' }],
      });
    })
    .get('/boom', () => {
      throw new Error('database password is hunter2');
    })
    .onError(problemHandler(silent))
    .notFound(notFound);

  it('turns an HttpProblem into RFC 9457 JSON', async () => {
    const res = await app.request('/bad');
    expect(res.status).toBe(422);
    expect(res.headers.get('content-type')).toBe('application/problem+json');
    expect(await res.json()).toMatchObject({ title: 'Unprocessable', status: 422, errors: [{ path: 'fields.email' }] });
  });

  it('never leaks an unexpected error’s message to the client', async () => {
    const res = await app.request('/boom');
    expect(res.status).toBe(500);
    expect(await res.text()).not.toContain('hunter2');
  });

  it('answers unknown routes with a 404 problem', async () => {
    expect((await app.request('/nope')).status).toBe(404);
  });
});

describe('health', () => {
  it('is live while not ready, and says which dependency is failing', async () => {
    const app = healthRoutes({
      db: async () => {
        throw new Error('connection refused');
      },
    });
    expect((await app.request('/healthz')).status).toBe(200);
    const ready = await app.request('/readyz');
    expect(ready.status).toBe(503);
    expect(await ready.json()).toMatchObject({ checks: { db: 'connection refused' } });
  });

  it('treats a hung dependency as not ready', async () => {
    const app = healthRoutes({ db: () => new Promise(() => {}) }, 50);
    expect((await app.request('/readyz')).status).toBe(503);
  });
});
