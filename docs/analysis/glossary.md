# Glossary

| Term | Meaning |
|---|---|
| **Desk** | A product line with its own team: Private Markets, Digital Assets, Token Disclosure |
| **Audience** | A client type with its own page, e.g. `lps` (limited partners) under Private Markets |
| **Variant** | A form: its title, lead text and fields. Six today, defined once in `packages/contracts/src/forms/variants.ts` |
| **Placement** | Where on a page a form was opened: nav, hero, body, band, closing, footer |
| **Entry point** | Page + placement (+ audience). Where a lead came from; stored with it, shown to ops, used to group analytics |
| **Submission** | What a visitor sent through a form, as stored by intake |
| **Lead** | A submission; every one goes to business operations |
| **Idempotency-Key** | A UUID the page makes when a form opens; the server stores each key once |
| **Outbox** | A table where an event is written in the same transaction as the change it announces, then published by a relay |
| **Relay** | The loop inside intake that publishes outbox rows to NATS and deletes them once stored |
| **Work queue** | A NATS stream that deletes each message once it is acknowledged |
| **Delivery log** | The notifier's record of which events became email: ids only |
| **Funnel** | `form_open → form_start → form_submit → form_success` in Umami |
| **Problem details** | RFC 9457 JSON error body, the same from every service |
| **Go-live gate** | The conditions under which the production site may collect data: privacy notice, secrets, email DNS, SOC 2 sign-off |
