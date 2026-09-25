# 7. Personal data in intake: collect little, keep it briefly, show it to no one else

- Status: Accepted
- Date: 2026-09-25

## Context

The site says it is GDPR-compliant and SOC 2 Type II audited. A form backend is the first
part of it that holds personal data, so it has to make those claims true by construction
rather than by policy alone.

## Decision

**Collect little.** Each variant asks only what the desk needs to reply. No file uploads
(a CV is a link, https only). Attribution is the page, the button, `document.referrer` and
the `utm_*` parameters of the current URL — nothing is stored in the browser to carry them
between pages, and no cookie is set.

**Keep it briefly, automatically.** Every row is written with `purge_after`
(`RETENTION_DAYS`, 365 by default, bounded to 30–1095 at start-up). The service deletes
expired rows on a timer; the privacy notice states the same period, and the code keeps the
promise without anyone remembering to.

**Erase on request.** `POST /v1/admin/erasures` deletes every submission for an address,
and any not-yet-published event carrying it (GDPR Art. 17). It needs a bearer token whose
sha256 is configured (the token itself is never stored), compared in constant time; the
edge does not route `/v1/admin/*` at all, so the endpoint is reachable only from inside.

**Show it to no one else.** Logs redact name, email, company, message and field values by
path before a line is written (tested). Database spans record statement text, never
parameter values. Error responses never include internal messages.

**Stop bots without a third party.** A hidden honeypot field, a minimum time between
opening the form and submitting it, and a per-address rate limit. A bot gets the same
`202` a person does, so it learns nothing to adapt to; nothing it sent is kept. No CAPTCHA:
it would add a sub-processor and make people prove they are people.

**The live site stays `mailto:` until go-live is approved.** The production build refuses
to set a form endpoint unless a privacy page exists, so collection cannot start by
accident before the notice is published.

## Consequences

- Any new field is a registry change that a reviewer sees, not a quiet addition.
- The rate limit is kept in memory: correct for one instance, and documented as the limit.
  More instances would each allow the full rate; the fix then is a shared store.
- intake is the one place retention and erasure must hold; the notifier stores no
  personal data, and the broker deletes each message once acknowledged.
