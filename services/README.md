# Services

Each service is a deployable unit that owns one kind of data. The boundaries follow
data classification and ownership, not request volume — see the ADRs.

Every service has the same shape, enforced by `.dependency-cruiser.cjs`:

```
src/
  domain/        pure rules and types — no I/O, no framework, no other layers
  application/   use cases, and the ports (interfaces) they need
  adapters/      the ports implemented: HTTP, Postgres, NATS, email
  main.ts        entry point: validate config, start telemetry, then load the rest
  server.ts      the only place that wires adapters into use cases
migrations/      SQL, run as a separate step before the service starts
test/
  unit/          domain, application and the HTTP adapter, no containers
  integration/   adapters against real Postgres (and NATS), in containers
generated/       artefacts produced from the code (OpenAPI), checked for drift in CI
```

Both build from one recipe, `services/Dockerfile` (`--build-arg SERVICE=<name>`): a bundle,
its migrations and production dependencies, running as a non-root user.

| Service | Owns | Status |
| --- | --- | --- |
| [intake](intake/) | Form submissions (personal data, with a purge date) and the events announcing them | Implemented |
| [notifier](notifier/) | Nothing personal (a log of delivered event ids): turns a submission event into an email to the ops inbox | Implemented |
