# 4. Service boundaries follow data classification, not load

- Status: Accepted
- Date: 2026-09-25

## Context

The site needs a backend for one job: take a form submission from a visitor, keep it, and
make sure the business-operations team hears about it. Traffic is tiny — tens of
submissions a week. Any split into services therefore has to be justified by something
other than scale, or it is cost without benefit.

What does differ between the parts of the job is the **data** and the **failure modes**:

| Concern | Data held | What hurts when it fails |
|---|---|---|
| Accepting a submission | Personal data (name, email, message) | A lead is lost |
| Telling ops | Email-provider credentials, no stored personal data | A lead waits |
| Analytics | Anonymous page and funnel events | A chart has a gap |

## Decision

**intake** (this change) is the only service that stores personal data. It validates a
submission, stores it with its purge date, and writes an event announcing it — in the same
transaction (transactional outbox, [ADR-0006](0006-schema-per-service-migrations-outbox.md)).
It answers the browser as soon as the row is committed.

**notifier** (next change) consumes that event from a broker and emails the ops inbox. It
holds the email-provider credentials and stores no personal data. Splitting it off means:

- an email outage, slow provider, or bad credential never fails or slows a submission;
- the credential that can send mail from our domain lives in one small process;
- the split is the cheapest one to undo: the consumer could move back into intake by
  swapping one adapter.

**Analytics** is a product we run (Umami, its own ADR), not a service we write.

**Deliberately not split**, each because nothing in the table above justifies it: content
(stays in git, built into static pages), authentication (the only authenticated call is
one admin endpoint, guarded by a bearer token), an API gateway product (Caddy does TLS,
routing and headers), Kubernetes or a service mesh (two services, one instance each).

## Consequences

- The system has one place where personal data is written, and so one place where
  retention and erasure must hold ([ADR-0007](0007-personal-data-in-intake.md)).
- Services never call each other or read each other's tables; they meet only through
  `packages/contracts` (HTTP schemas and event payloads). `.dependency-cruiser.cjs`
  fails the build if one service imports another.
- A broker becomes part of the system in the next change. Until then intake's outbox
  simply accumulates, which is its designed behaviour when the broker is down.
