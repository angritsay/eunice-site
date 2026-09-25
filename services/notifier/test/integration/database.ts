// A real Postgres 18 in a container, set up exactly as every environment is: the shared
// roles script, then notifier's migrations run as the schema owner.
import { fileURLToPath } from 'node:url';
import { createPool, migrate, type Pool } from '@eunice/platform';
import { PostgreSqlContainer, type StartedPostgreSqlContainer } from '@testcontainers/postgresql';

export const POSTGRES_IMAGE = 'postgres:18.6-alpine';
const ROLES_SQL = fileURLToPath(new URL('../../../../infra/postgres/roles.sql', import.meta.url));
export const MIGRATIONS = fileURLToPath(new URL('../../migrations', import.meta.url));

export interface TestDatabase {
  container: StartedPostgreSqlContainer;
  /** Connects as notifier_owner, as migrations do. */
  owner: Pool;
  /** Connects as notifier_app, as the running service does. */
  app: Pool;
  stop(): Promise<void>;
}

export async function startDatabase(): Promise<TestDatabase> {
  const container = await new PostgreSqlContainer(POSTGRES_IMAGE).start();
  await container.copyFilesToContainer([{ source: ROLES_SQL, target: '/eunice/roles.sql' }]);
  const setup = await container.exec([
    'psql',
    '--username',
    container.getUsername(),
    '--dbname',
    container.getDatabase(),
    '-v',
    'intake_owner_password=owner-pw',
    '-v',
    'intake_app_password=app-pw',
    '-v',
    'notifier_owner_password=n-owner-pw',
    '-v',
    'notifier_app_password=n-app-pw',
    '-v',
    'umami_password=umami-pw',
    '-f',
    '/eunice/roles.sql',
  ]);
  if (setup.exitCode !== 0) throw new Error(`roles.sql failed: ${setup.output}`);

  const url = (user: string, password: string) =>
    `postgres://${user}:${password}@${container.getHost()}:${container.getPort()}/${container.getDatabase()}`;
  const owner = createPool(url('notifier_owner', 'n-owner-pw'), { max: 2, applicationName: 'test-owner' });
  const app = createPool(url('notifier_app', 'n-app-pw'), { max: 10, applicationName: 'test-app' });
  // An idle connection closed by the server (the container stopping) is reported as an
  // error event; without a listener it would crash the test run after the tests passed.
  for (const pool of [owner, app]) pool.on('error', () => {});
  return {
    container,
    owner,
    app,
    async stop() {
      await Promise.all([owner.end(), app.end()]);
      await container.stop();
    },
  };
}

export const runMigrations = (db: TestDatabase) => migrate({ pool: db.owner, dir: MIGRATIONS, schema: 'notifier' });
