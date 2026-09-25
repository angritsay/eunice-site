# 9. NATS JetStream between intake and notifier; email through one port, two providers

- Status: Accepted
- Date: 2026-09-25

## Context

[ADR-0004](0004-service-boundaries-by-data-classification.md) split telling ops about a
lead off from accepting it. Something has to carry the event between them, and the email
has to reach the ops inbox reliably, once, and in a form someone can act on straight away.

## Decision

**NATS JetStream is the broker.** One small binary, persistent streams, per-message
acknowledgement, redelivery with delays, de-duplication by message id, and W3C trace
context in headers. Kafka would be the right tool at a different scale; here it would
be the largest component in the system. A Postgres table polled by the notifier would be
cheaper still, but it would have the notifier reading intake's schema, which
[ADR-0006](0006-schema-per-service-migrations-outbox.md) rules out.

**The `INTAKE` stream is a work queue.** A message is deleted as soon as a consumer
acknowledges it, and after seven days regardless. The broker holds personal data only
until it has been handled. The price is that each subject has one consumer group. A
second consumer of submissions (a CRM sync, say) would need its own subject, or a stream
whose messages carry no personal data.

**Delivery guarantees, end to end:**

| Step | Guarantee | How |
|---|---|---|
| Browser → intake | Exactly one submission per form opening | `Idempotency-Key` unique in the table ([ADR-0006](0006-schema-per-service-migrations-outbox.md)) |
| intake → broker | At least once, stored once | Transactional outbox; relay claims rows with `FOR UPDATE SKIP LOCKED`, deletes after the broker's ack; `Nats-Msg-Id` = event id inside a 10-minute de-dup window |
| broker → notifier | At least once | Durable consumer, explicit ack, redelivery after 5 s, 30 s, 2 min, 10 min, 30 min, 1 h |
| notifier → inbox | Once per event | Delivery log keyed by event id (ids only, no personal data), and the provider's `Idempotency-Key` for the gap between sending and recording |

The e2e suite stops the broker and then the notifier, submits during each outage, and
checks that exactly one email arrives once the part is back.

**An email ops can act on from the inbox.** Subject
`[Private Markets · lps · hero] Jane Doe — Acme Capital`: desk, audience, button, who.
`Reply-To` is the lead, so a reply goes straight to them. The body lists every field, the
page as a link, the referrer and the campaign, and the submission id. It is plain text
only, because everything in it was typed by a stranger. Line breaks are removed from
anything that goes into a header. Recipients come from configuration only: leads go to
`OPS_INBOX`, applications to `CAREERS_INBOX`. The client never chooses an address, so the
form cannot be used as a relay.

**One `Mailer` port, two HTTP adapters.** Mailpit's send API locally and in CI, where
every message can be inspected at `localhost:8025`. Resend in production (SOC 2 Type II,
SPF/DKIM on a sending subdomain). Neither needs an SMTP library. The notifier refuses to
start in production with anything but Resend.

**Failure is loud and loses nothing.** A malformed event, or a provider answering that
the request itself is wrong (4xx other than 408/429), is dropped at once. Retrying cannot
fix either. After the last retry, the notifier logs `notification abandoned` with the
submission id at error level: that line is the alert. The lead itself is never lost,
because intake stored it before any of this happened.

**One trace, browser to inbox.** The site sends a `traceparent`. intake continues it,
stores it with the outbox row, and the relay publishes under it however much later that
is. The notifier's consumer span continues it again, down to the HTTP call to the email
provider. Database spans are recorded only inside such a trace, so background polling
does not flood the tracing backend.

## Consequences

- `docker compose up` now runs NATS, the notifier and Mailpit as well. The AsyncAPI
  document (`packages/contracts/generated/asyncapi.json`) is generated from the same zod
  schemas as the services and checked for drift in CI.
- intake stays ready while NATS is down: the broker is not part of its readiness check.
  The notifier's readiness includes both its database and the broker.
- The stream is declared by its owner (intake, on start); the notifier declares only its
  own durable consumer and waits for the stream if it starts first.
