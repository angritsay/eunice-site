# 10. Analytics: self-hosted Umami, cookieless, funnel per entry point

- Status: Accepted
- Date: 2026-09-25

## Context

The business wants two things measured: how the site is used, and how each form performs
— per entry point, because the same form opened from the LPs hero and from the footer
are different funnels. The owner set three constraints: respect SOC 2 (and the site's GDPR
claim), add little code, cost little.

## Decision

**Umami, self-hosted, on the Postgres we already run.**

- **SOC 2 / GDPR.** Self-hosting adds no new analytics sub-processor. The data stays
  in our infrastructure, under the same access, backup and logging controls as
  everything else. The tracker sets **no cookies** and stores nothing in the browser to
  recognise a visitor. It honours Do Not Track (`data-do-not-track`). Umami stores no
  raw IP address. This keeps personal data minimal and is designed to fall under the
  consent exemption for audience measurement. Counsel confirms that at go-live, and the
  privacy notice says what is measured. The production build refuses to include the
  tracker without a privacy page, the same guard as the form
  ([ADR-0007](0007-personal-data-in-intake.md)).
- **Little code.** No backend code at all. About 25 lines in `site.js` send five events
  — `form_open`, `form_start` (first keystroke), `form_submit`, `form_success`,
  `form_error`. Each carries the entry point: `variant`, `page`, `placement`,
  `audience`, `role`, and a combined `entry` label such as
  `private-markets/lps/ · hero`. **Never what was typed.** The e2e test checks that
  neither the name nor the email reaches Umami, and that no cookie is set.
- **Low cost.** MIT licence, one small container, one more schema in the existing
  database.

**Isolation, as for our own services.** Umami has its own schema and role. Unlike our
services it migrates itself on start, so its role owns its schema, but it still cannot
see `intake` or `notifier`. The one privilege it would need beyond that, creating
`pgcrypto`, is done once by `roles.sql`. The edge exposes only `/analytics/script.js` and
`/analytics/api/send`. The dashboard and its admin API are not routed, which the e2e test
checks. A bootstrap job replaces Umami's default admin password on first start and
registers the site under a fixed id, so the build can name it in advance.

**The tracker is served from our own origin**, so the strict CSP stays
`script-src 'self'; connect-src 'self'` ([ADR-0008](0008-edge-strict-csp-self-hosted-assets.md)).

## Options considered

| Option | Why not |
|---|---|
| Our own collector service | A lot of code, and a dashboard to build, for a solved problem |
| Google Analytics 4 | A third-party processor, cookies and a consent banner — against the site's own GDPR claim |
| PostHog Cloud | SOC 2 certified and capable, but a new sub-processor and a heavy SDK for five events |
| Plausible (hosted) | Close to Umami, but a paid third-party processor; self-hosting it is heavier (ClickHouse) |

## Consequences

- The funnel report is configured in Umami, not in code. See
  [runbooks/analytics-funnel.md](../runbooks/analytics-funnel.md).
- A new form or placement needs no analytics change. Its events arrive with its entry
  point automatically.
- Umami is a dependency we operate: its version is pinned (`3.4.0`) and moves in a pull
  request like any other.
