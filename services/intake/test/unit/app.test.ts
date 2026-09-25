// The HTTP adapter against stub use cases: status codes, problem details, headers.
import { createLogger } from '@eunice/platform';
import { describe, expect, it, vi } from 'vitest';
import type { AppDeps } from '../../src/adapters/http/app.ts';
import { createApp } from '../../src/adapters/http/app.ts';
import { adminToken } from '../../src/adapters/http/guards.ts';
import { DEV_ADMIN_TOKEN_SHA256 } from '../../src/config.ts';

const ORIGIN = 'https://angritsay.github.io';
const KEY = '0199a0c2-7d7e-7c3e-9f5a-3c1f2b6d4e10';
const ACCEPTED_ID = '0199a0c2-0000-7000-8000-000000000001';

const body = {
  variant: 'careers',
  fields: {
    name: 'Jane Doe',
    email: 'jane@example.com',
    link: 'https://github.com/jane',
    message: 'I like hard problems.',
  },
  entry: { page: 'careers/', placement: 'roles', role: 'Founding engineer' },
  elapsedMs: 30_000,
};

function setup(overrides: Partial<AppDeps> = {}) {
  const deps: AppDeps = {
    submit: vi.fn(async () => ({ kind: 'accepted' as const, id: ACCEPTED_ID })),
    erase: vi.fn(async () => 2),
    log: createLogger({ service: 'intake', version: 'test', level: 'silent' }),
    readiness: {},
    allowedOrigins: [ORIGIN],
    rateLimit: { max: 3, windowMs: 60_000 },
    clientIp: (c) => c.req.header('x-test-ip') ?? 'unknown',
    isAdmin: adminToken(DEV_ADMIN_TOKEN_SHA256),
    version: 'test',
    ...overrides,
  };
  return { deps, app: createApp(deps) };
}

const post = (app: ReturnType<typeof setup>['app'], payload: unknown, headers: Record<string, string> = {}) =>
  app.request('/v1/submissions', {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'idempotency-key': KEY, ...headers },
    body: JSON.stringify(payload),
  });

describe('POST /v1/submissions', () => {
  it('accepts a valid submission with 202 and the id to quote', async () => {
    const { app, deps } = setup();
    const res = await post(app, body);
    expect(res.status).toBe(202);
    expect(await res.json()).toEqual({ id: ACCEPTED_ID, status: 'received' });
    expect(deps.submit).toHaveBeenCalledWith(expect.objectContaining({ variant: 'careers' }), KEY);
  });

  it('names each rejected field in RFC 9457 problem details', async () => {
    const { app, deps } = setup();
    const res = await post(app, {
      ...body,
      fields: { ...body.fields, link: 'http://insecure.example', email: 'nope' },
    });
    expect(res.status).toBe(400);
    expect(res.headers.get('content-type')).toBe('application/problem+json');
    const problem = (await res.json()) as { errors: { path: string }[] };
    expect(problem.errors.map((e) => e.path).sort()).toEqual(['fields.email', 'fields.link']);
    expect(deps.submit).not.toHaveBeenCalled();
  });

  it('requires an Idempotency-Key that is a UUID', async () => {
    const { app } = setup();
    expect((await post(app, body, { 'idempotency-key': 'abc' })).status).toBe(400);
    const res = await app.request('/v1/submissions', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(body),
    });
    expect(res.status).toBe(400);
  });

  it('answers 409 when the key belongs to a different submission', async () => {
    const { app } = setup({ submit: async () => ({ kind: 'conflict' }) });
    const res = await post(app, body);
    expect(res.status).toBe(409);
    expect(await res.json()).toMatchObject({ status: 409, title: 'Conflict' });
  });

  it('limits each client, and tells it when to come back', async () => {
    const { app } = setup();
    for (let i = 0; i < 3; i++) expect((await post(app, body, { 'x-test-ip': '203.0.113.7' })).status).toBe(202);
    const limited = await post(app, body, { 'x-test-ip': '203.0.113.7' });
    expect(limited.status).toBe(429);
    expect(Number(limited.headers.get('retry-after'))).toBeGreaterThan(0);
    // Another client is unaffected.
    expect((await post(app, body, { 'x-test-ip': '198.51.100.1' })).status).toBe(202);
  });

  it('allows the site origin to call it from a browser, and no other', async () => {
    const { app } = setup();
    const preflight = (origin: string) =>
      app.request('/v1/submissions', {
        method: 'OPTIONS',
        headers: {
          origin,
          'access-control-request-method': 'POST',
          'access-control-request-headers': 'content-type,idempotency-key,traceparent',
        },
      });
    const ok = await preflight(ORIGIN);
    expect(ok.headers.get('access-control-allow-origin')).toBe(ORIGIN);
    expect(ok.headers.get('access-control-allow-headers')?.toLowerCase()).toContain('idempotency-key');
    expect((await preflight('https://evil.example')).headers.get('access-control-allow-origin')).toBeNull();
  });

  it('never returns an internal error’s message', async () => {
    const { app } = setup({
      submit: async () => {
        throw new Error('connect ECONNREFUSED postgres://intake_app:secret@db');
      },
    });
    const res = await post(app, body);
    expect(res.status).toBe(500);
    expect(await res.text()).not.toContain('secret');
  });
});

describe('POST /v1/admin/erasures', () => {
  const erase = (app: ReturnType<typeof setup>['app'], authorization?: string) =>
    app.request('/v1/admin/erasures', {
      method: 'POST',
      headers: { 'content-type': 'application/json', ...(authorization ? { authorization } : {}) },
      body: JSON.stringify({ email: 'jane@example.com' }),
    });

  it('refuses without the admin token', async () => {
    const { app, deps } = setup();
    expect((await erase(app)).status).toBe(401);
    expect((await erase(app, 'Bearer wrong-token')).status).toBe(401);
    expect(deps.erase).not.toHaveBeenCalled();
  });

  it('erases with it', async () => {
    const { app } = setup();
    const res = await erase(app, 'Bearer local-dev-admin-token');
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ deleted: 2 });
  });
});

describe('the published contract', () => {
  it('serves an OpenAPI 3.1 document describing both endpoints', async () => {
    const { app } = setup();
    const doc = (await (await app.request('/openapi.json')).json()) as {
      openapi: string;
      paths: Record<string, unknown>;
    };
    expect(doc.openapi).toBe('3.1.0');
    expect(Object.keys(doc.paths).sort()).toEqual(['/v1/admin/erasures', '/v1/submissions']);
  });

  it('answers unknown routes with a 404 problem', async () => {
    const { app } = setup();
    const res = await app.request('/v1/nope');
    expect(res.status).toBe(404);
    expect(res.headers.get('content-type')).toBe('application/problem+json');
  });
});
