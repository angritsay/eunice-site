# 14. A static site on S3 and CloudFront, defined in Terraform; the backend removed

- Status: Accepted
- Date: 2026-10-12
- Supersedes: [ADR-0004](0004-service-boundaries-by-data-classification.md),
  [ADR-0006](0006-schema-per-service-migrations-outbox.md),
  [ADR-0007](0007-personal-data-in-intake.md),
  [ADR-0009](0009-broker-notifier-email.md),
  [ADR-0012](0012-production-on-existing-vendors.md)
- Amends: [ADR-0005](0005-contracts-first-one-form-registry.md),
  [ADR-0008](0008-edge-strict-csp-self-hosted-assets.md)

## Context

The repository moves to Eunice's GitHub organisation and engineering takes over running
it. Their rule (Vinay, 9–12 Oct 2026): as few moving parts as possible, services the
company already pays for, and infrastructure in Terraform like the rest of Eunice's AWS.

The repository held a full backend for the contact form: two Node services, Postgres,
NATS, a Caddy edge, an EC2 stack in CloudFormation, backups and their runbooks. It was
built and tested in CI but never deployed: the deploy workflow skipped every run. The
live site has only ever been static files, and its form opens the visitor's mail app.

## Decision

1. **The site is static files and nothing else.** The backend is removed: `services/`,
   `packages/platform`, `infra/` (Caddy, Postgres, Umami), `e2e/`, both compose files,
   the CloudFormation stack and deploy scripts, the deploy workflow, the CI jobs that
   tested them, and the docs that described them. The last commit that carries all of
   it is `02e84bd` on `claude/zen-allen-zxhqcd`; git keeps it.
2. **Hosting is S3 behind CloudFront, in Eunice's AWS account, defined in Terraform**
   (`infra/terraform/`): one `static-site` module, a `staging` and a `prod` environment.
   The bucket is private and read only through CloudFront (origin access control). A
   CloudFront function serves `/path/` from `/path/index.html`; `404.html` answers
   unknown paths. DNS for `eunice.ai` stays in `eunice-infrastructure`; the module can
   write the records when given the hosted zone, or output what to add there.
3. **Security headers come from CloudFront**, not from the pages: HSTS, nosniff,
   Referrer-Policy, frame denial, and a strict Content-Security-Policy. This finally
   gives the live site the CSP that ADR-0008 asked for and GitHub Pages could not send.
   The policy allows Google Analytics (ADR-0013) and nothing else from outside.
   Staging also sends `X-Robots-Tag: noindex`.
4. **Deploys run from GitHub Actions** through a short-lived OIDC role that can only
   write its bucket and invalidate its distribution. `main` deploys to staging after CI
   passes; production is a manual run of the same workflow. Each skips until its
   environment's variables are set.
5. **Pull request previews stay on GitHub Pages** (`pages.yml`) until engineering
   chooses otherwise; they carry `noindex`.
6. **The privacy notice is the policy already on eunice.ai** (`/privacy-policy/`). The
   production build still refuses a form endpoint or analytics without that page, but no
   longer waits for a new notice. Chrislyn or Ana check whether it needs a line on GA.
7. **The form registry stays** (`packages/contracts`, forms only): the dialog is built
   from it, and whatever receives the form validates against it. The HTTP and event
   schemas, OpenAPI and AsyncAPI documents went with the services.
8. **Where the form goes is open:** the company's CRM is Attio. Until it is wired, the
   form keeps opening the mail app. See `docs/handover.md` for the proposal.

## Consequences

- Nothing of ours runs: no server, database, queue or certificate to patch, back up or
  rotate. The cost is S3, CloudFront and Route 53 records.
- A form receiver, when it comes, is a separate decision with its own record.
- The CSP lives in Terraform. A new third-party script or connection means changing the
  policy there in the same pull request, and the site's `motion`, `forms` and `links`
  tests do not see it: check the browser console on staging.
- The repository is smaller: two packages (`apps/web`, `packages/contracts`) and the
  Terraform.
