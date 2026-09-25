// Reading what the system stored, straight from its database. There is deliberately no
// API that returns submissions, so the tests look where ops' tooling would.
import { execFileSync } from 'node:child_process';

export function sql<T>(query: string): T[] {
  const out = execFileSync(
    'docker',
    ['compose', 'exec', '-T', 'postgres', 'psql', '-U', 'postgres', '-d', 'eunice', '-At', '-c', query],
    { encoding: 'utf8' },
  );
  return out
    .split('\n')
    .filter(Boolean)
    .map((line) => JSON.parse(line) as T);
}

export interface StoredSubmission {
  variant: string;
  desk: string;
  queue: string;
  name: string;
  email: string;
  company: string | null;
  message: string | null;
  details: Record<string, string>;
  entry_page: string;
  entry_placement: string;
  entry_audience: string | null;
  entry_role: string | null;
  utm: Record<string, string> | null;
}

/** Test addresses are unique per run, so they are safe to put in a query. */
export const submissionsFor = (email: string) => {
  if (!/^[a-z0-9.+-]+@example\.com$/.test(email)) throw new Error(`Not a test address: ${email}`);
  return sql<StoredSubmission>(`select row_to_json(s) from intake.submissions s where email = '${email}'`);
};

export const outboxFor = (email: string) =>
  sql<{ subject: string; traceparent: string | null }>(
    `select json_build_object('subject', subject, 'traceparent', traceparent) from intake.outbox where payload->'data'->'contact'->>'email' = '${email}'`,
  );

export const compose = (...args: string[]) => execFileSync('docker', ['compose', ...args], { stdio: 'pipe' });

const MAILPIT = process.env['E2E_MAILPIT_URL'] ?? 'http://localhost:8025';

export interface Mail {
  ID: string;
  Subject: string;
  To: { Address: string }[];
  ReplyTo: { Address: string; Name: string }[];
  Text: string;
}

/** Polls until something is true, or fails with the last reason it was not. */
export async function eventually<T>(check: () => Promise<T | undefined>, timeoutMs = 20_000): Promise<T> {
  const until = Date.now() + timeoutMs;
  for (;;) {
    const value = await check().catch(() => undefined);
    if (value !== undefined) return value;
    if (Date.now() > until) throw new Error(`not within ${timeoutMs}ms`);
    await new Promise((r) => setTimeout(r, 250));
  }
}

/** The emails in Mailpit whose Reply-To is this lead. */
export async function mailsFrom(email: string): Promise<Mail[]> {
  const list = (await (await fetch(`${MAILPIT}/api/v1/messages?limit=200`)).json()) as {
    messages: (Omit<Mail, 'Text'> & { ID: string })[];
  };
  const mine = list.messages.filter((m) => m.ReplyTo.some((r) => r.Address === email));
  return Promise.all(
    mine.map(async (m) => ({
      ...m,
      Text: ((await (await fetch(`${MAILPIT}/api/v1/message/${m.ID}`)).json()) as Mail).Text,
    })),
  );
}

/** Waits for exactly the email a lead should produce. */
export const mailFor = (email: string, timeoutMs?: number) =>
  eventually(async () => {
    const mails = await mailsFrom(email);
    return mails.length > 0 ? mails : undefined;
  }, timeoutMs);

const JAEGER = process.env['E2E_JAEGER_URL'] ?? 'http://localhost:16686';

/** The services and span names recorded under one trace id. */
export async function traceSpans(traceId: string): Promise<{ service: string; name: string }[]> {
  const res = await fetch(`${JAEGER}/api/v3/traces/${traceId}`);
  if (!res.ok) return [];
  const body = (await res.json()) as {
    result: {
      resourceSpans: {
        resource: { attributes: { key: string; value: { stringValue?: string } }[] };
        scopeSpans: { spans: { name: string }[] }[];
      }[];
    };
  };
  return body.result.resourceSpans.flatMap((rs) => {
    const service = rs.resource.attributes.find((a) => a.key === 'service.name')?.value.stringValue ?? '?';
    return rs.scopeSpans.flatMap((ss) => ss.spans.map((s) => ({ service, name: s.name })));
  });
}
