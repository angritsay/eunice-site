# Failure modes

What happens when each part fails, what the visitor sees, what ops sees, and how we
know. "Tested" means an automated test exercises the failure. It is not a claim from
reading the code.

| Failure | Visitor sees | Leads lost? | Ops sees | Detected by | Tested |
|---|---|---|---|---|---|
| NATS down | Nothing different (202) | No: outbox holds them | Email arrives late | intake logs `outbox relay failed; retrying` | `e2e/resilience.spec.ts`, `relay.test.ts` |
| notifier down | Nothing different | No: stream holds them, up to 7 days | Email arrives late | notifier `/readyz` fails; stream backlog | `e2e/resilience.spec.ts` |
| Email provider 5xx / timeout | Nothing different | No: retried for ~2 hours | Email arrives late | `notification failed; will retry` (warn) | `notify.test.ts` |
| Email provider rejects (4xx) or retries run out | Nothing different | **Not emailed**, still stored in intake | No email | `notification abandoned` (error) with submission id: **alert on this** | `notify.test.ts` |
| Malformed event | — | Not emailed, still stored | No email | `event does not match the contract` (error) | `notify.test.ts` |
| Postgres down | Error message with the mail link | No: the visitor is told and given `mailto:` | — | intake `/readyz` 503; 500s | `app.test.ts` (500 never leaks internals) |
| intake down | Error message with the mail link | No, same as above | — | edge 502; platform health check | — (P9: synthetic check) |
| Double click / network retry | One confirmation | No duplicates | One email | — | `postgres.test.ts` (8 concurrent → 1 row) |
| Same key, different content | Error message | — | — | 409 | `app.test.ts`, `postgres.test.ts` |
| Bot (honeypot / too fast) | "Thank you" | Nothing stored | Nothing | info log with reason | `e2e/lead-flow.spec.ts`, `spam` unit tests |
| Flood from one address | 429 with Retry-After | — | — | access log status 429 | `app.test.ts` |
| Relay crashes after publish, before commit | — | No | One email: broker de-dups by event id; notifier by delivery log | — | `relay.test.ts` (de-dup) |
| notifier crashes after send, before recording | — | No | The email is sent again with the same Message-ID; Gmail keeps one copy | — | reasoned, not tested |
| Umami down | Nothing different | — | Gap in charts | edge 502 on `/analytics/*` | — |

## Known limits, stated

- **The rate limit is kept in memory per instance.** Two instances would each allow the
  full rate. It is right for one instance, and a shared store is the fix when there are
  more ([ADR-0007](../adr/0007-personal-data-in-intake.md)).
- **One work-queue consumer per subject.** A second consumer of submissions needs its own
  subject ([ADR-0009](../adr/0009-broker-notifier-email.md)).
- **Alerting is a log line today.** `notification abandoned` at error level is the
  signal. Wiring it to a pager is part of go-live.
