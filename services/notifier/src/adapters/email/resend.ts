// Production: Resend (SOC 2 Type II), sending from a subdomain with SPF and DKIM. Its
// Idempotency-Key makes a repeated request for the same event send one email.

import type { Mailer } from '../../application/ports.ts';
import type { Email } from '../../domain/email.ts';
import { postJson } from './http.ts';

export function resendMailer(opts: { apiKey: string; from: { email: string; name: string } }): Mailer {
  return {
    async send(email: Email, idempotencyKey: string) {
      const res = (await postJson(
        'https://api.resend.com/emails',
        {
          from: `${opts.from.name} <${opts.from.email}>`,
          to: [email.to],
          // The bare address: a display name typed by a visitor is not put in a header.
          reply_to: email.replyTo.email,
          subject: email.subject,
          text: email.text,
        },
        { authorization: `Bearer ${opts.apiKey}`, 'idempotency-key': idempotencyKey },
      )) as { id: string };
      return { providerId: res.id };
    },
  };
}
