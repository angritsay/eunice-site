# 6. A schema and two roles per service, SQL migrations, a transactional outbox

- Status: Accepted
- Date: 2026-09-25

## Context

intake needs a database; the notifier will need a little state; analytics needs its own.
One Postgres is plenty for all of them, and cheaper to run and back up than several.
Sharing a database server must not become sharing data: "services integrate through each
other's tables" is the failure this decision exists to prevent.

## Decision

**One schema per service, two roles per schema** (`infra/postgres/roles.sql`, the same
script locally, in CI and in production):

- `intake_owner` owns the `intake` schema. Migrations run as it, and nothing else does.
- `intake_app` is what the running service connects as. It can use exactly the tables its
  migrations grant it — `select, insert, delete` on submissions (no `update`: a submission
  is a record of what was sent), `select, insert, delete` on the outbox — and cannot
  create, alter or drop anything, or read another service's schema.
- Nobody may create objects in `public`.

A test against real Postgres (`services/intake/test/integration`) proves each of these:
the app role is refused DDL, updates, the migration history, and `public`.

**Migrations are plain SQL files**, applied in order, each in a transaction, under an
advisory lock (`packages/platform/src/migrate.ts`). They run as a **separate step before
the service starts** — a one-shot container locally, a release command in production —
never at boot, so a service instance never holds schema-changing credentials.

**Kysely for queries**, typed against a hand-written schema interface. It is a query
builder, not an ORM: the SQL it sends is the SQL you would write, and nothing is lazy or
implicit. The API contract is never derived from the tables.

**Transactional outbox.** intake writes a submission and the event announcing it in one
transaction. The event cannot describe a submission that was not stored, and a stored
submission cannot lose its event because the broker was down. The row keeps the W3C
`traceparent` of the request, so the relay publishing it later continues the same trace.
An outbox row is deleted once published, so personal data in its payload lives there only
until delivery.

**Idempotency.** The site generates an `Idempotency-Key` (a UUID) when the form opens and
reuses it on retry. The key is unique in the table; a retry returns the original id, and
concurrent duplicates serialise on the unique index (tested with eight simultaneous
requests). A key reused for *different* content is a client bug and gets `409`, decided by
a fingerprint over what was submitted — not the timing signals, which differ per retry.

**Ids are UUIDv7** (Postgres 18 `uuidv7()`): time-ordered, so inserts stay index-friendly,
and safe to show a visitor as a reference.

## Consequences

- Moving a service to its own database later is a dump of one schema and a new URL.
- Adding a service means adding its two roles to `roles.sql` and its grants to its own
  migrations — both reviewed in the pull request that adds it.
- In production (Neon) the operator runs `roles.sql` once with psql; its passwords come
  from the platform's secret store.
