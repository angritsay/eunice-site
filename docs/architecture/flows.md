# Flows

How a lead moves through the system, step by step. Each flow names the code that
implements it and the test that proves it.

## 1. Submitting a form

```mermaid
sequenceDiagram
  autonumber
  actor V as Visitor
  participant S as site.js
  participant E as Edge (Caddy)
  participant I as intake
  participant DB as Postgres (intake schema)

  V->>S: clicks "Talk to us" (data-form, data-placement)
  S->>S: enable the variant's fieldset<br/>entry = {page, placement, audience?, role?}<br/>Idempotency-Key = new UUID
  S-->>E: form_open (analytics)
  V->>S: fills in, presses Send
  S->>E: POST /api/intake/v1/submissions<br/>Idempotency-Key, traceparent
  E->>I: /v1/submissions (X-Forwarded-For set by the edge)
  I->>I: CORS, rate limit per address,<br/>validate against the variant's zod schema
  alt invalid
    I-->>S: 400 problem+json, errors[].path
    S->>S: mark those inputs aria-invalid
  else honeypot filled or submitted in under 2.5 s
    I-->>S: 202 (fake id), nothing stored
  else valid
    I->>DB: BEGIN · INSERT submission ON CONFLICT (key) DO NOTHING<br/>· INSERT outbox (event, traceparent) · COMMIT
    I-->>S: 202 {id, status: "received"}
    S-->>E: form_success (analytics)
  end
```

- Code: `apps/web/src/assets/site.js`, `services/intake/src/adapters/http/app.ts`,
  `application/submit.ts`, `adapters/postgres/store.ts`.
- Proven by: `services/intake/test/unit/app.test.ts` (status codes, CORS, 429, 409),
  `test/integration/postgres.test.ts` (atomicity, eight concurrent duplicates → one row),
  `e2e/lead-flow.spec.ts` (three entry points, a server-side rejection, the honeypot).

**A retry is a replay.** The same `Idempotency-Key` with the same content returns the
original id. The same key with different content gets `409`. The fingerprint covers
what was submitted, not the timing signals.

## 2. From the outbox to the ops inbox

```mermaid
sequenceDiagram
  autonumber
  participant R as intake: outbox relay
  participant DB as Postgres
  participant N as NATS (INTAKE, work queue)
  participant C as notifier
  participant L as notifier.deliveries
  participant M as SMTP: Workspace relay / Mailpit
  actor O as Ops inbox

  loop every 250 ms, or at once while there is backlog
    R->>DB: BEGIN · SELECT … FOR UPDATE SKIP LOCKED LIMIT 50
    R->>N: publish(subject, event, Nats-Msg-Id = event id, traceparent)
    N-->>R: ack (duplicate: true if seen within 10 min)
    R->>DB: DELETE published rows · COMMIT
  end
  N->>C: deliver (attempt n)
  C->>C: parse against the CloudEvents contract
  C->>L: seen this event id?
  alt already delivered
    C-->>N: ack
  else new
    C->>M: send (Message-ID = event id)<br/>To: OPS_INBOX or CAREERS_INBOX, Reply-To: lead
    M->>O: [Private Markets · lps · hero] Jane Doe — Acme Capital
    C->>L: record event id
    C-->>N: ack (message deleted)
  end
```

- Code: `services/intake/src/adapters/outbox/relay.ts`, `packages/platform/src/nats.ts`,
  `services/notifier/src/application/notify.ts`, `domain/email.ts`.
- Proven by: `services/intake/test/integration/relay.test.ts` (id, trace, de-dup,
  broker restart), `services/notifier/test/unit/*` (once per event, routing, header
  injection), `e2e/lead-flow.spec.ts` (email in Mailpit, one trace across both services).

## 3. When something is down

```mermaid
sequenceDiagram
  autonumber
  participant I as intake
  participant DB as Postgres
  participant N as NATS
  participant C as notifier
  participant M as Email provider

  Note over N: broker down
  I->>DB: submission + outbox row (202 to the visitor)
  I--xN: publish fails → rows stay, retry with backoff (≤ 30 s)
  Note over N: broker back
  I->>N: publish the backlog, in order
  Note over C: notifier down
  N->>N: message waits (work queue, 7-day maximum age)
  Note over C: notifier back
  N->>C: deliver
  C--xM: provider 503
  C-->>N: nak, retry in 5 s, 30 s, 2 min, 10 min, 30 min, 1 h
  C->>M: send (same Message-ID)
  Note over C: on the last attempt, or a 4xx that retrying cannot fix:<br/>log "notification abandoned" with the submission id — the alert.<br/>The lead is still in intake.
```

Proven by `e2e/resilience.spec.ts`. It stops the broker, and then the notifier, while a
lead is submitted, and checks that exactly one email arrives once each is back.

## 4. Erasure (GDPR Art. 17)

```mermaid
sequenceDiagram
  actor A as Operator (internal network)
  participant I as intake
  participant DB as Postgres
  A->>I: POST /v1/admin/erasures {email}<br/>Authorization: Bearer … (sha256 compared in constant time)
  I->>DB: DELETE submissions WHERE lower(email) = …<br/>DELETE outbox rows carrying it
  I-->>A: {deleted: n}
```

The edge does not route `/v1/admin/*`. The notifier holds no personal data. NATS deletes
messages once acknowledged. Mailboxes are outside the system and are cleared by the
operator (runbook, P9).

## 5. Analytics

```mermaid
sequenceDiagram
  participant B as Browser
  participant E as Edge
  participant U as Umami
  B->>E: GET /analytics/script.js
  B->>E: POST /analytics/api/send (page view)
  B->>E: POST /analytics/api/send form_open / form_start / form_submit / form_success<br/>{variant, entry, page, placement, audience?, role?}
  E->>U: /api/send
  Note over B,U: no cookies · Do Not Track honoured · never field values
```

Proven by `e2e/analytics.spec.ts`: the events arrive in order with the entry point, no
cookie is set, the name and email never reach Umami, and the dashboard is not reachable
through the edge.
