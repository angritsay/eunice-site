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
