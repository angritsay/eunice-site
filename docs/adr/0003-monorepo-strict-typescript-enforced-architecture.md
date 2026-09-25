# 3. Monorepo, one strict TypeScript baseline, architecture rules enforced in CI

- Status: Accepted
- Date: 2026-09-25

## Context

The repository is about to hold the site, two or more services, and code shared between
them: form definitions that the browser renders and the server validates, and event
schemas that one service publishes and another consumes. That shared code has to change
atomically with everything that uses it.

## Decision

**One repository, pnpm workspaces.** `apps/web` (the site), `services/*` (deployable
units), `packages/*` (shared code). A contract change and every consumer of it land in one
pull request and one CI run; there is no version skew to manage between packages that are
only ever released together.

**No build orchestrator yet.** Turborepo or Nx would cache and parallelise task graphs.
With a handful of packages, `pnpm -r` and `--filter` do the same job with nothing to
learn; we adopt one when CI time says so, not before.

**One strict TypeScript baseline** (`tsconfig.base.json`): `strict` plus
`noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`,
`noPropertyAccessFromIndexSignature` and `erasableSyntaxOnly`. `tsc` only checks types;
Node 24 runs `.ts` directly by stripping them, and services are bundled for their images,
so nothing emits JavaScript. `erasableSyntaxOnly` bans the TypeScript features that
type-stripping cannot handle (enums, namespaces, parameter properties), so every file is
runnable as written.

**TypeScript 6, not 7.** TypeScript 7 (the native Go port) type-checks much faster, but
does not yet publish the programmatic API that tools read TypeScript through. We found
this the useful way: with TypeScript 7 installed, dependency-cruiser parsed no `.ts`
files and every architecture rule passed while checking nothing. TypeScript 6 is the
final JavaScript release, built as the bridge to 7 with the same type system. We move to
7 when the tools that depend on the API support it.

**Architecture rules are enforced, not described** (`.dependency-cruiser.cjs`, run in CI):

| Rule | Keeps true |
| --- | --- |
| `services-are-isolated` | A service never imports another; they meet over HTTP or events |
| `domain-imports-only-domain`, `domain-does-no-io` | The domain is pure and testable without infrastructure |
| `application-does-not-know-adapters` | Use cases depend on ports they own, not on Postgres or NATS |
| `shared-packages-stay-shared`, `contracts-are-a-leaf` | Shared code does not depend back on its consumers |
| `web-does-not-import-services` | The site reaches services over HTTP only |
| `not-to-unresolvable`, `no-circular` | Nothing escapes the rules by being unresolvable or cyclic |

Each rule was checked against a deliberate violation before being relied on.

**Biome** lints and formats in one fast tool. The site generator and its assets are
exempt until they are rewritten (P2, P7), so that moving them stays a pure move.

## Consequences

- `pnpm check` runs lint, types and architecture rules; CI runs it on every pull request
  as its own job, alongside the web tests.
- A diagram in `docs/` that says "the domain depends on nothing" is backed by a check that
  fails the build when it stops being true.
- Two exemptions are temporary and named: the generator's lint/format (removed in P7),
  and TypeScript 6 (revisited when TypeScript 7's API is published).
