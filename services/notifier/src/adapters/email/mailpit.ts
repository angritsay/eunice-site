// Local and CI: Mailpit catches every message and shows it at http://localhost:8025.

import type { Mailer } from '../../application/ports.ts';
import type { Email } from '../../domain/email.ts';
import { postJson } from './http.ts';

export function mailpitMailer(opts: { baseUrl: string; from: { email: string; name: string } }): Mailer {
  return {
    async send(email: Email) {
      const res = (await postJson(`${opts.baseUrl.replace(/\/$/, '')}/api/v1/send`, {
        From: { Email: opts.from.email, Name: opts.from.name },
        To: [{ Email: email.to }],
        ReplyTo: [{ Email: email.replyTo.email, Name: email.replyTo.name }],
        Subject: email.subject,
        Text: email.text,
      })) as { ID: string };
      return { providerId: res.ID };
    },
  };
}
