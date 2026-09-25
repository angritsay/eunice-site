# Data model and data inventory

## Entities

```mermaid
erDiagram
  SUBMISSION ||--o| OUTBOX_EVENT : "announced by (until published)"
  OUTBOX_EVENT ||--o| DELIVERY : "emailed as (notifier)"

  SUBMISSION {
    uuid id PK "uuidv7, time-ordered"
    uuid idempotency_key UK "one per form opening"
    text fingerprint "sha256 of variant, fields, entry"
    text variant "general, private-markets, ..."
    text desk
    text queue "leads | careers"
    text name "personal"
    text email "personal"
    text company "personal, optional"
    text message "personal, optional"
    jsonb details "variant fields: fund, token, jurisdiction, link"
    text entry_page
    text entry_placement
    text entry_audience
    text entry_role
    text referrer
    jsonb utm
    timestamptz received_at
    timestamptz purge_after "received_at + RETENTION_DAYS"
  }
  OUTBOX_EVENT {
    uuid id PK "CloudEvents id = Nats-Msg-Id"
    text subject "intake.submission.received.v1"
    text event_type
    jsonb payload "the CloudEvent, incl. contact"
    text traceparent
    timestamptz created_at
  }
  DELIVERY {
    uuid event_id PK
    uuid submission_id
    text provider_id
    timestamptz delivered_at
  }
```

`SUBMISSION` and `OUTBOX_EVENT` are in schema `intake`. `DELIVERY` is in schema
`notifier`, which has no foreign key to `intake`: services share no tables, and the
relationship exists only through the event.

## The event

`ai.eunice.intake.submission.received.v1` is a CloudEvents 1.0 envelope. Its `data`
carries the submission (event-carried state), so the notifier never calls intake back.
The schema is `packages/contracts/src/events/submissions.ts`, and the published document
is `packages/contracts/generated/asyncapi.json`.

## Personal data inventory

| Where | What | Why | Kept for | Deleted by |
|---|---|---|---|---|
| `intake.submissions` | Name, email, company, message, variant fields | To reply to the lead | `RETENTION_DAYS` (365 by default) | Purge timer; erasure endpoint |
| `intake.outbox` | The same, inside the event | To announce the lead reliably | Until published (seconds) | Relay after the broker's ack; erasure |
| NATS `INTAKE` stream | The same, inside the event | To deliver it to the notifier | Until acknowledged; 7 days at most | Work-queue retention; max age |
| Ops / hiring inbox | The email | To reply | The inbox's own policy | Operator (UC-5) |
| `notifier.deliveries` | Event and submission ids only | Send once | 30 days | Purge timer |
| Umami | Page URL, referrer, browser, country; funnel events with the entry point | Measure the site | Umami's retention setting | Umami |
| Logs | Method, route, status, duration, ids; personal fields redacted | Operate | Platform log retention | Platform |
| Traces | Span names, routes, SQL text without parameters | Debug | Collector retention | Collector |
