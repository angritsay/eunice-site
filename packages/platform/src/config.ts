// Configuration comes from the environment, is validated once at start-up, and a
// service with bad configuration refuses to start — rather than failing on the first
// request that happens to need the missing value.
import { z } from 'zod';

export class ConfigError extends Error {
  readonly problems: readonly string[];
  constructor(problems: readonly string[]) {
    super(`Invalid configuration:\n${problems.map((p) => `  ${p}`).join('\n')}`);
    this.name = 'ConfigError';
    this.problems = problems;
  }
}

/** Parses the environment against a schema. Error messages name variables, never values. */
export function loadConfig<S extends z.ZodType>(schema: S, env: NodeJS.ProcessEnv = process.env): z.infer<S> {
  const parsed = schema.safeParse(env);
  if (parsed.success) return parsed.data;
  throw new ConfigError(parsed.error.issues.map((i) => `${i.path.join('.') || '(root)'}: ${i.message}`));
}

/** Settings every service has. Services extend this with their own. */
export const baseConfig = z.object({
  SERVICE_NAME: z.string().min(1),
  SERVICE_VERSION: z.string().default('dev'),
  SITE_ENV: z.enum(['local', 'test', 'production']).default('local'),
  PORT: z.coerce.number().int().min(1).max(65535).default(3000),
  LOG_LEVEL: z.enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace', 'silent']).default('info'),
  /** OTLP/HTTP collector. Unset: traces are not exported, and nothing else changes. */
  OTEL_EXPORTER_OTLP_ENDPOINT: z.url().optional(),
});
export type BaseConfig = z.infer<typeof baseConfig>;
