# Shared packages

Code shared between the site and the services, or between services. Kept deliberately
small: sharing is coupling, so only two things are shared.

| Package | What | Who may depend on it |
| --- | --- | --- |
| `contracts` | The wire format: HTTP request and response schemas, event payloads, the form registry | Everyone, including the site |
| `platform` | Runtime plumbing every service needs the same way: config, logging, tracing, errors, health, outbox, NATS | Services only |
