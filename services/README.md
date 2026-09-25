# Services

Each service is a deployable unit that owns one kind of data. The boundaries follow
data classification and ownership, not request volume — see the ADRs.

Every service has the same shape, enforced by `.dependency-cruiser.cjs`:

```
src/
  domain/        pure rules and types — no I/O, no framework, no other layers
  application/   use cases, and the ports (interfaces) they need
  adapters/      the ports implemented: HTTP, Postgres, NATS, email
  main.ts        the only place that wires adapters into use cases
migrations/      SQL, run as a separate step before the service starts
test/
  unit/          domain and application, no containers
  integration/   adapters against real Postgres and NATS
```
