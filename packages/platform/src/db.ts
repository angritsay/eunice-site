import { Kysely, PostgresDialect } from 'kysely';
import pg from 'pg';

export function createPool(url: string, opts: { max?: number; applicationName: string }) {
  return new pg.Pool({ connectionString: url, max: opts.max ?? 10, application_name: opts.applicationName });
}

export const createDb = <DB>(pool: pg.Pool) => new Kysely<DB>({ dialect: new PostgresDialect({ pool }) });

export type Pool = pg.Pool;
