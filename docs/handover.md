# Handover to engineering

The site moves from `angritsay/eunice-site` to Eunice's GitHub organisation in October
2026, and engineering takes over deploying it. This page lists what the repository
holds, what is actually live, and what is still to decide. The guiding rule from that
handover: as few moving parts as possible, and a service Eunice already pays for wherever
one fits.

## What is live

Only the static site. `apps/web` builds plain HTML (TypeScript, no framework, our own
`site.js`), and `.github/workflows/pages.yml` publishes it to GitHub Pages at
`https://angritsay.github.io/eunice-site/`, with a preview per pull request. `eunice.ai`
still points at the old Framer site.

The "Book demo" / "Talk to us" form opens the visitor's mail app, addressed to
`inquiries@eunice.ai`. Nothing is collected on our side. No analytics runs and no cookie
is set.

## What is built but has never been deployed

| Part | What it does | Holds | Decision |
|---|---|---|---|
| `services/intake` | Takes form submissions, filters spam, stores them for 365 days, erases a person on request | Personal data: name, work email, message, page, referrer, UTM | **Open:** replace with a form or CRM API Eunice already pays for, then remove |
| `services/notifier` | Emails each lead to the ops inbox through the Google Workspace SMTP relay | Delivery log only | Goes with intake |
| NATS JetStream | Queue between intake and notifier | Leads in transit, up to 7 days | Goes with intake |
| Postgres 18 | Schemas for intake and notifier | Leads | Goes with intake |
| Caddy (`infra/caddy`, `deploy/Caddyfile`) | Local edge with a strict CSP; production TLS for `api.eunice.ai` | — | Goes with intake |
| `deploy/aws`, `deploy/*.sh`, `deploy/systemd` | One EC2 instance, ECR, S3 backups, alerts, OIDC deploy role | Backups | Goes with intake. `deploy-services.yml` has skipped every run: `AWS_DEPLOY_ROLE_ARN` was never set |
| `packages/platform` | Logging, database, queue and tracing code for the services | — | Goes with intake |
| Mailpit, Jaeger, `e2e/` | Local inbox, trace viewer, end-to-end tests of the stack | Test data | Goes with intake |
| `packages/contracts` | The form's fields, shared by the site and intake | — | Keep (the site's form is built from it) |

The reasons behind each part are in [adr/](adr/) 0004 to 0012. Removing the backend
changes nothing a visitor sees today.

## Decided

- **Analytics: Google Analytics 4**, which Eunice already uses
  ([ADR-0013](adr/0013-analytics-google-analytics-with-consent.md)). Self-hosted Umami is
  removed. GA loads only after the visitor accepts a cookie banner, and only when the
  Pages build sets `PUBLIC_GA_MEASUREMENT_ID`. Until then the site is unchanged.
- **Blog posts stay as files** (`apps/web/src/content/posts/`). A CMS can come later; no
  database for it.

## Open

| Question | What the site needs | Notes |
|---|---|---|
| Which form service? | An API the static page can POST name, work email, message and page to; it emails or creates a lead; EU storage, spam filtering, deletion on request | The site posts JSON to `PUBLIC_FORM_ENDPOINT` in `site.js`; the request shape changes to whatever the service expects. Job applications already use Tally; the MiCA page links to Calendly |
| Which host? | Static files on `eunice.ai` with HTTPS, and a preview per pull request | GitHub Pages in the Eunice org works as it is (add a `CNAME`, set `BASE_PATH=/`). A host that sends headers can carry the CSP that Pages cannot |
| Consent tool? | Consent before GA loads | The built-in bar is enough for GA alone; swap it if Eunice already pays for a consent platform |
| GA property | The `G-…` measurement id | Set it as a repository variable and pass it to the Pages build |
| Privacy notice | Approved text naming the form service and GA | Draft for counsel: pull request #20. The production build refuses a form endpoint or analytics until a page with slug `privacy` exists ([ADR-0007](adr/0007-personal-data-in-intake.md)); the current `privacy-policy` page is the old live copy |

## Also worth knowing

- **No CSP on the live site.** GitHub Pages cannot send headers, and no `<meta>` CSP is
  set ([ADR-0008](adr/0008-edge-strict-csp-self-hosted-assets.md)).
- **Search engines.** The `github.io` copy has no `noindex`. Once `eunice.ai` serves the
  same pages, retire the `github.io` site or mark it `noindex`, so search engines do not
  see duplicates.
- **Editing.** Content and page copy rules are in [../CLAUDE.md](../CLAUDE.md); the
  contribution flow is in [../CONTRIBUTING.md](../CONTRIBUTING.md).
