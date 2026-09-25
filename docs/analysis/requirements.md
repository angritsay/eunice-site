# Requirements

What the system must do, and how well, each with where it is verified. Status:
**Met** (verified by the named check), **Partly** (the named part is verified), or
**Planned** (the phase that delivers it).

## Stakeholders

| Who | Needs |
|---|---|
| Visitor (prospective client, candidate) | A short form that fits what they came for; a clear confirmation; no tracking cookies |
| Business operations | Every lead, once, quickly, with enough context to reply well, and one click to reply |
| Hiring team | Applications separate from leads, with the role applied for |
| Marketing / leadership | Which pages and entry points produce leads |
| Security / compliance owner | Personal data minimised, retained for a stated period, erasable; no new sub-processors without sign-off |
| Engineers | Change one part without breaking another; see a request end to end |

## Functional

| ID | Requirement | Status | Verified by |
|---|---|---|---|
| FR-1 | The form adapts to its entry point: the variant decides the fields (fund, token and jurisdiction, CV link) | Met | `e2e/lead-flow.spec.ts`, `forms.spec.ts` |
| FR-2 | The server validates every submission against the same variant definition the page was built from | Met | `packages/contracts/test`, `app.test.ts` |
| FR-3 | Each submission records its entry point (page, placement, audience, role) and attribution (referrer, UTM) | Met | `e2e/lead-flow.spec.ts` |
| FR-4 | Business operations receives one email per lead, and hiring one per application | Met | `e2e/lead-flow.spec.ts`, `notify.test.ts` |
| FR-5 | The email names desk, entry point and person in the subject; Reply-To is the lead | Met | `email.test.ts`, `e2e/lead-flow.spec.ts` |
| FR-6 | A retried or double-clicked submission creates one lead | Met | `postgres.test.ts`, `submit.test.ts` |
| FR-7 | Submissions are deleted after the retention period; an address can be erased on request | Met | `postgres.test.ts`, `submit.test.ts` |
| FR-8 | Page views and the form funnel (open, start, submit, success, error) are measured per entry point | Met | `e2e/analytics.spec.ts` |
| FR-9 | Without a published privacy notice, production collects nothing: the form falls back to `mailto:` and analytics is off | Met | `forms.spec.ts` (build guards) |
| FR-10 | Public register of token white papers | Planned (P8) | — |

## Non-functional (measurable)

| ID | Quality | Target | Status | Verified by |
|---|---|---|---|---|
| NFR-1 | **Durability of leads** | 0 leads lost when broker, notifier or email provider is down | Met | `e2e/resilience.spec.ts`, `relay.test.ts` |
| NFR-2 | **Exactly-once notification** | 1 email per lead under redelivery and retry | Met; see failure modes for a crash mid-send | `notify.test.ts`, `e2e/resilience.spec.ts` |
| NFR-3 | **Latency to ops** | Email within 10 s of submission when all parts are up | Met locally (≈1–2 s) | `e2e/lead-flow.spec.ts` (20 s timeout) |
| NFR-4 | **Availability of the form** | Accepts leads while broker, notifier or email is down | Met | `e2e/resilience.spec.ts` |
| NFR-5 | **API latency** | p95 < 300 ms for `POST /v1/submissions` at 10 req/s | Planned (P9 load test) | — |
| NFR-6 | **Privacy by design** | No personal data in logs, traces, analytics or the notifier's store | Met | `logger.test.ts`, `notify.test.ts`, `e2e/analytics.spec.ts` |
| NFR-7 | **Least privilege** | Each service role can change no schema and read no other service's data | Met | `postgres.test.ts` in both services |
| NFR-8 | **Security headers** | CSP with no `unsafe-*` and no third-party origins; no CSP violations in the browser | Met | Caddyfile, `e2e/lead-flow.spec.ts` |
| NFR-9 | **Accessibility** | WCAG 2.2 AA on every page; the known issues can only shrink | Met | `a11y.spec.ts` |
| NFR-10 | **Observability** | One trace per lead, from the browser to the email provider | Met | `e2e/lead-flow.spec.ts` |
| NFR-11 | **Contract stability** | Committed OpenAPI/AsyncAPI always match the code | Met | CI drift check |
| NFR-12 | **Reproducibility** | Two builds of the site are byte-identical | Met | `check:determinism` |
| NFR-13 | **Onboarding** | From a clean clone to the running system with one command | Met | `docker compose up --build --wait`; CI `system` job |
| NFR-14 | **Cost** | < $15 / month in production | Planned (P5) | provider pricing, re-checked at signup |

## Constraints

- The pages we ship have no runtime JavaScript dependencies ([ADR-0002](../adr/0002-dependencies-under-supply-chain-controls.md)).
- TypeScript end to end, one repository ([ADR-0003](../adr/0003-monorepo-strict-typescript-enforced-architecture.md)).
- New sub-processors (hosting, database, email) need sign-off by whoever owns vendor
  management for SOC 2, before production.
