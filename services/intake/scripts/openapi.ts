// Writes the OpenAPI document the running service serves at /openapi.json to
// generated/openapi.json in this package. CI regenerates it and fails on any difference, so the
// committed contract is always the one the code implements.
import { writeFile } from 'node:fs/promises';
import { createLogger } from '@eunice/platform';
import { createApp } from '../src/adapters/http/app.ts';

const app = createApp({
  submit: () => Promise.reject(new Error('not serving')),
  erase: () => Promise.reject(new Error('not serving')),
  log: createLogger({ service: 'intake', version: 'openapi', level: 'silent' }),
  readiness: {},
  allowedOrigins: [],
  rateLimit: { max: 1, windowMs: 1 },
  clientIp: () => '',
  isAdmin: () => false,
  version: '1.0.0',
});
const doc = await (await app.request('/openapi.json')).json();
const out = new URL('../generated/openapi.json', import.meta.url);
await writeFile(out, `${JSON.stringify(doc, null, 2)}\n`);
console.log(`wrote ${out.pathname}`);
