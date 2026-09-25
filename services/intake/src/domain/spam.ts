// Two cheap signals that catch most form bots without a CAPTCHA, a third party, or
// anything that makes a person prove they are one.

/** Faster than this from opening the form to submitting it, no person typed it. */
export const MIN_HUMAN_MS = 2500;

export type SpamVerdict = { readonly spam: false } | { readonly spam: true; readonly reason: 'honeypot' | 'too-fast' };

export function assessSpam(signals: { honeypot: string | undefined; elapsedMs: number }): SpamVerdict {
  if (signals.honeypot) return { spam: true, reason: 'honeypot' };
  if (signals.elapsedMs < MIN_HUMAN_MS) return { spam: true, reason: 'too-fast' };
  return { spam: false };
}
