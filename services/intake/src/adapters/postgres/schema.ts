// The tables as Kysely sees them. Written by hand: six columns do not need a
// generator, and the API contract is never derived from them (see ADR on contracts).
import type { ColumnType, Generated } from 'kysely';

type Json<T> = ColumnType<T, string, string>;

export interface SubmissionsTable {
  id: Generated<string>;
  idempotency_key: string;
  fingerprint: string;
  variant: string;
  desk: string;
  name: string;
  email: string;
  company: string | null;
  message: string | null;
  details: Json<Record<string, string>>;
  entry_page: string;
  entry_placement: string;
  entry_audience: string | null;
  referrer: string | null;
  utm: ColumnType<Record<string, string> | null, string | null, string | null>;
  received_at: Date;
  purge_after: Date;
}

export interface OutboxTable {
  id: string;
  subject: string;
  event_type: string;
  payload: Json<unknown>;
  traceparent: string | null;
  created_at: Generated<Date>;
}

export interface DB {
  'intake.submissions': SubmissionsTable;
  'intake.outbox': OutboxTable;
}
