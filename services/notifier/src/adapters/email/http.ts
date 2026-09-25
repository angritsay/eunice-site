// Both email providers are reached over HTTP. A 4xx other than 408/429 is the provider
// saying the request itself is wrong, so retrying it is futile; anything else may pass.
import { PermanentMailError } from '../../application/ports.ts';

export async function postJson(url: string, body: unknown, headers: Record<string, string> = {}) {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'content-type': 'application/json', accept: 'application/json', ...headers },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(10_000),
  });
  if (res.ok) return (await res.json()) as unknown;
  const detail = `${new URL(url).host} answered ${res.status}`;
  if (res.status >= 400 && res.status < 500 && res.status !== 408 && res.status !== 429) {
    throw new PermanentMailError(detail);
  }
  throw new Error(detail);
}
