// Everything notifier reads from its environment, validated before anything starts.
import { baseConfig } from '@eunice/platform/config';
import { z } from 'zod';

/** "Name <address>" or a bare address. */
const mailbox = z
  .string()
  .transform((s) => {
    const m = s.match(/^\s*(.*?)\s*<([^<>\s]+)>\s*$/);
    return m ? { name: m[1] || 'Eunice', email: m[2] ?? '' } : { name: 'Eunice', email: s.trim() };
  })
  .pipe(z.object({ name: z.string().regex(/^[^\r\n<>"]*$/), email: z.email() }));

export const notifierConfig = baseConfig
  .extend({
    DATABASE_URL: z.url(),
    NATS_URL: z.url(),
    /** Business operations: every lead goes here. */
    OPS_INBOX: z.email(),
    MAIL_FROM: mailbox,
    /** The site's origin, for links in the email. */
    SITE_URL: z.url(),
    /** Google Workspace's SMTP relay in production; Mailpit locally. */
    SMTP_HOST: z.string().min(1),
    SMTP_PORT: z.coerce.number().int().min(1).max(65535).default(587),
    /** Refuse to send over an unencrypted connection. Required in production. */
    SMTP_REQUIRE_TLS: z.stringbool().default(true),
    /** Days a delivery record is kept for de-duplication. */
    DELIVERY_RECORD_DAYS: z.coerce.number().int().min(1).max(365).default(30),
  })
  .refine((c) => c.SITE_ENV !== 'production' || c.SMTP_REQUIRE_TLS, {
    path: ['SMTP_REQUIRE_TLS'],
    message: 'must be true in production: lead details never travel unencrypted',
  });

export type NotifierConfig = z.infer<typeof notifierConfig>;
