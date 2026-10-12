# Architecture decision records

Each significant decision is written down once, when it is made, in the pull request
that implements it. Records are [MADR](https://adr.github.io/madr/) and immutable once
accepted: a changed mind is a new record that supersedes the old one, so the history of
*why* survives alongside the history of *what*.

| # | Decision | Status |
|---|---|---|
| [0001](0001-record-architecture-decisions.md) | Record architecture decisions | Accepted |
| [0002](0002-dependencies-under-supply-chain-controls.md) | Allow dependencies, under supply-chain controls | Accepted |
| [0003](0003-monorepo-strict-typescript-enforced-architecture.md) | Monorepo, one strict TypeScript baseline, architecture rules enforced in CI | Accepted |
| [0004](0004-service-boundaries-by-data-classification.md) | Service boundaries follow data classification, not load | Superseded by 0014 |
| [0005](0005-contracts-first-one-form-registry.md) | Contracts first: one form registry drives the page and the server | Amended by 0014 |
| [0006](0006-schema-per-service-migrations-outbox.md) | A schema and two roles per service, SQL migrations, a transactional outbox | Superseded by 0014 |
| [0007](0007-personal-data-in-intake.md) | Personal data in intake: collect little, keep it briefly, show it to no one else | Superseded by 0014 |
| [0008](0008-edge-strict-csp-self-hosted-assets.md) | One edge, a strict Content Security Policy, everything self-hosted | Amended by 0014 |
| [0009](0009-broker-notifier-email.md) | NATS JetStream between intake and notifier; email through one port, two providers | Superseded by 0014 |
| [0010](0010-analytics-self-hosted-umami.md) | Analytics: self-hosted Umami, cookieless, funnel per entry point | Superseded by 0013 |
| [0011](0011-typed-static-generator.md) | The site stays a static generator, in TypeScript, with escaping by default | Accepted |
| [0012](0012-production-on-existing-vendors.md) | Production runs on vendors the company already has: AWS and Google Workspace | Superseded by 0014 |
| [0013](0013-analytics-google-analytics-with-consent.md) | Analytics: Google Analytics 4, loaded only after cookie consent | Accepted |
| [0014](0014-static-site-on-aws.md) | A static site on S3 and CloudFront, defined in Terraform; the never-deployed backend removed | Accepted |
| [0015](0015-demo-request-is-one-email.md) | A demo request is one work email, sent from the page | Accepted |

To add one: copy the most recent record, take the next number, and link it here in the
same pull request.
