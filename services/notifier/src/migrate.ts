// Applies notifier's migrations, then exits. A separate step before the service starts
// (a one-shot container locally, a release command in production), run with the schema
// owner's credentials. The service connects as a role that cannot change schema.
import { createPool, loadConfig, migrate } from '@eunice/platform';
import { z } from 'zod';

const config = loadConfig(z.object({ MIGRATION_DATABASE_URL: z.url() }));
const pool = createPool(config.MIGRATION_DATABASE_URL, { max: 1, applicationName: 'notifier-migrate' });
try {
  const ran = await migrate({ pool, dir: new URL('../migrations', import.meta.url).pathname, schema: 'notifier' });
  console.log(
    JSON.stringify({ level: 'info', service: 'notifier-migrate', applied: ran, msg: 'migrations up to date' }),
  );
} finally {
  await pool.end();
}
