// Plain SQL migrations, applied in file-name order, each in its own transaction, under
// an advisory lock so two deploys cannot race. Run as a separate step before the
// service starts, with the schema owner's credentials — the running service connects
// as a role that cannot change the schema at all.
import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import type pg from 'pg';

const FILE = /^\d{4}_[a-z0-9_]+\.sql$/;

export async function migrate(opts: { pool: pg.Pool; dir: string; schema: string }): Promise<string[]> {
  if (!/^[a-z_]+$/.test(opts.schema)) throw new Error(`Invalid schema name: ${opts.schema}`);
  const table = `${opts.schema}.schema_migrations`;
  const lockKey = `migrate:${opts.schema}`;
  const client = await opts.pool.connect();
  try {
    await client.query('select pg_advisory_lock(hashtext($1))', [lockKey]);
    await client.query(
      `create table if not exists ${table} (name text primary key, applied_at timestamptz not null default now())`,
    );
    const applied = new Set(
      (await client.query<{ name: string }>(`select name from ${table}`)).rows.map((r) => r.name),
    );
    const files = (await readdir(opts.dir)).filter((f) => FILE.test(f)).sort();
    const ran: string[] = [];
    for (const file of files) {
      if (applied.has(file)) continue;
      const sql = await readFile(path.join(opts.dir, file), 'utf8');
      await client.query('begin');
      try {
        await client.query(sql);
        await client.query(`insert into ${table} (name) values ($1)`, [file]);
        await client.query('commit');
        ran.push(file);
      } catch (err) {
        await client.query('rollback');
        throw new Error(`Migration ${file} failed: ${err instanceof Error ? err.message : String(err)}`, {
          cause: err,
        });
      }
    }
    return ran;
  } finally {
    await client.query('select pg_advisory_unlock(hashtext($1))', [lockKey]).catch(() => {});
    client.release();
  }
}
