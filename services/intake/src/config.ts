// Everything intake reads from its environment, validated before anything starts.
import { createHash } from 'node:crypto';
import { baseConfig } from '@eunice/platform/config';
import { z } from 'zod';
import { MAX_RETENTION_DAYS, MIN_RETENTION_DAYS } from './domain/retention.ts';

/** sha256 of the admin token in .env.example. Refused in production. */
export const DEV_ADMIN_TOKEN_SHA256 = createHash('sha256').update('local-dev-admin-token').digest('hex');

export const intakeConfig = baseConfig
  .extend({
    /** Connects as the runtime role, which can read and write rows but not change the schema. */
    DATABASE_URL: z.url(),
    /** Days a submission is kept. The privacy notice states the same number. */
    RETENTION_DAYS: z.coerce.number().int().min(MIN_RETENTION_DAYS).max(MAX_RETENTION_DAYS).default(365),
    /** Origins allowed to submit from a browser, comma-separated. */
    ALLOWED_ORIGINS: z
      .string()
      .default('')
      .transform((s) =>
        s
          .split(',')
          .map((o) => o.trim())
          .filter(Boolean),
      ),
    /** The header our own edge sets with the client's address. Unset: use the socket. */
    CLIENT_IP_HEADER: z.string().toLowerCase().optional(),
    RATE_LIMIT_MAX: z.coerce.number().int().min(1).default(5),
    RATE_LIMIT_WINDOW_SECONDS: z.coerce.number().int().min(1).default(600),
    /** sha256 (hex) of the bearer token for admin endpoints. The token itself is never stored. */
    ADMIN_TOKEN_SHA256: z.string().regex(/^[a-f0-9]{64}$/, 'must be a hex sha256'),
    PURGE_INTERVAL_MINUTES: z.coerce.number().int().min(1).default(360),
  })
  .refine((c) => !(c.SITE_ENV === 'production' && c.ADMIN_TOKEN_SHA256 === DEV_ADMIN_TOKEN_SHA256), {
    path: ['ADMIN_TOKEN_SHA256'],
    message: 'is the development token; set a real one for production',
  })
  .refine((c) => !(c.SITE_ENV === 'production' && c.ALLOWED_ORIGINS.length === 0), {
    path: ['ALLOWED_ORIGINS'],
    message: 'must name the site origin in production',
  });

export type IntakeConfig = z.infer<typeof intakeConfig>;
