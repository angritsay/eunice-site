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

To add one: copy the most recent record, take the next number, and link it here in the
same pull request.
