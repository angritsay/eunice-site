# 12. Production runs on vendors the company already has: AWS and Google Workspace

- Status: Accepted
- Date: 2026-09-25
- Supersedes: the email transport in [ADR-0009](0009-broker-notifier-email.md), and the
  production proposal (Fly.io, Neon, Resend) in the plan

## Context

The first go-live proposal added three providers: Fly.io, Neon and Resend. Each is
SOC 2 certified, but each would be a **new sub-processor**. That means a vendor review,
another data processing agreement, another place personal data lives, and another bill.
The owner asked for no third-party services beyond what is needed.

Eunice already runs its product on AWS and its email on Google Workspace. Both are
already sub-processors, already in the SOC 2 scope, and already under the company's
access reviews.

## Decision

**Hosting: one EC2 instance in the existing AWS account (eu-west-2, London)** runs the
same `docker compose` stack that CI tests end to end:
- Postgres runs on the instance. Backups are a daily encrypted `pg_dump` to S3 (versioned,
  with a lifecycle rule) plus EBS snapshots, and a restore is checked on a schedule rather
  than assumed.
- Access is through SSM Session Manager only, with no SSH. The security group opens 80 and
  443 and nothing else.
- Deploys come from GitHub Actions through an OIDC role. There are no long-lived AWS keys.
- The infrastructure is one CloudFormation template (`deploy/aws/`), AWS-native, so no new
  tool is needed.

Managed services (ECS, RDS and a load balancer) were considered. For two small services at
this volume they would cost three to four times as much, and need several times the
infrastructure code, for availability that one instance with tested backups already covers.
The move is a configuration change if volume ever calls for it: the services are stateless
containers and the database is plain Postgres.

**Email: SMTP to Google Workspace's relay.** The Workspace admin allows the instance's
fixed address to send as `notify@eunice.ai`, TLS required. No password or API key is
stored. The notifier has one adapter, `smtp.ts`. Locally and in CI it talks to Mailpit's
SMTP port, so the tests exercise the production code path.
- **TLS is enforced in production:** the notifier refuses to start with
  `SMTP_REQUIRE_TLS=false` when `SITE_ENV=production`, and an integration test shows it
  sends nothing to a server that cannot encrypt.
- **Idempotency** moves from the provider's `Idempotency-Key` to the `Message-ID`. It is
  derived from the event id (`<eventId@eunice.ai>`), so if a crash between sending and
  recording makes the notifier send again, the mailbox sees the same Message-ID. The
  delivery log still prevents almost every repeat.
- **Failures.** Only a 5xx reply to the message itself is final. TLS, relay-permission and
  recipient refusals are configuration an admin can fix, so they are retried on the
  notifier's two-hour schedule before the `notification abandoned` alert.

**TLS certificates** come from Let's Encrypt through Caddy. It issues a certificate for
`api.eunice.ai` and sees no data.

## Consequences

- No new vendor review or DPA is needed for go-live. The SOC 2 change record lists: a new
  EC2 instance, an S3 bucket, a Workspace relay rule.
- The company operates one more server. Automatic security updates, CloudWatch logs and
  the runbooks in `docs/runbooks/` keep that small; restore and rollback are rehearsed
  before go-live.
- `nodemailer` becomes a dependency of the notifier. It is the standard Node SMTP client,
  has no dependencies of its own, and is pinned and quarantined like everything else
  ([ADR-0002](0002-dependencies-under-supply-chain-controls.md)).
