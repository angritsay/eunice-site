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
    /** Hiring: every application goes here. */
    CAREERS_INBOX: z.email(),
    MAIL_FROM: mailbox,
    /** The site's origin, for links in the email. */
    SITE_URL: z.url(),
    EMAIL_TRANSPORT: z.enum(['mailpit', 'resend']),
    MAILPIT_URL: z.url().optional(),
    RESEND_API_KEY: z.string().min(1).optional(),
    /** Days a delivery record is kept for de-duplication. */
    DELIVERY_RECORD_DAYS: z.coerce.number().int().min(1).max(365).default(30),
  })
  .refine((c) => c.EMAIL_TRANSPORT !== 'mailpit' || c.MAILPIT_URL, {
    path: ['MAILPIT_URL'],
    message: 'is required when EMAIL_TRANSPORT=mailpit',
  })
  .refine((c) => c.EMAIL_TRANSPORT !== 'resend' || c.RESEND_API_KEY, {
    path: ['RESEND_API_KEY'],
    message: 'is required when EMAIL_TRANSPORT=resend',
  })
  .refine((c) => c.SITE_ENV !== 'production' || c.EMAIL_TRANSPORT === 'resend', {
    path: ['EMAIL_TRANSPORT'],
    message: 'must be resend in production',
  });

export type NotifierConfig = z.infer<typeof notifierConfig>;
