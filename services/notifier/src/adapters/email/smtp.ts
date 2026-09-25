// Email over SMTP. In production that is the Google Workspace SMTP relay (the company's
// existing mail provider, which accepts mail only from our server's fixed address and
// only over TLS); locally and in CI it is Mailpit. One adapter for both, so the tests
// exercise the code that runs in production.
import nodemailer from 'nodemailer';
import { type Mailer, PermanentMailError } from '../../application/ports.ts';
import type { Email } from '../../domain/email.ts';

export interface SmtpOptions {
  host: string;
  port: number;
  /** Refuse to send unless the connection is encrypted (STARTTLS, or TLS on port 465). */
  requireTls: boolean;
  from: { email: string; name: string };
}

/**
 * Whether retrying can help. Only a 5xx reply to the message itself (DATA) is final:
 * sending the same message again would be refused again. Everything else is retried on
 * the notifier's schedule (about two hours): timeouts and 4xx replies pass on their own,
 * and configuration problems (TLS not offered, relay not allowed for our address, a
 * recipient refused) are fixed by an admin, after which the waiting leads go out.
 */
export function isPermanent(err: unknown): boolean {
  const e = err as { responseCode?: number; command?: string };
  return e.command === 'DATA' && typeof e.responseCode === 'number' && e.responseCode >= 500;
}

export function smtpMailer(opts: SmtpOptions): Mailer {
  const transport = nodemailer.createTransport({
    host: opts.host,
    port: opts.port,
    secure: opts.port === 465,
    requireTLS: opts.requireTls,
    ignoreTLS: !opts.requireTls,
    connectionTimeout: 10_000,
    greetingTimeout: 10_000,
    socketTimeout: 20_000,
  });
  const domain = opts.from.email.split('@')[1] ?? 'localhost';

  return {
    async send(email: Email, idempotencyKey: string) {
      try {
        const info = await transport.sendMail({
          from: { name: opts.from.name, address: opts.from.email },
          to: email.to,
          replyTo: { name: email.replyTo.name, address: email.replyTo.email },
          subject: email.subject,
          text: email.text,
          // Stable per event: if a crash between sending and recording makes us send
          // again, the recipient's mailbox sees the same Message-ID and keeps one copy.
          messageId: `<${idempotencyKey}@${domain}>`,
        });
        return { providerId: info.messageId };
      } catch (err) {
        const reason = `${opts.host} refused: ${err instanceof Error ? err.message : String(err)}`.slice(0, 300);
        if (isPermanent(err)) throw new PermanentMailError(reason);
        throw new Error(reason);
      }
    },
  };
}
