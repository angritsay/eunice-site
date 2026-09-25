# 2. Allow dependencies, under supply-chain controls

- Status: Accepted
- Date: 2026-09-25
- Supersedes: the rule "No framework, no npm packages — keep it that way" in `CLAUDE.md`

## Context

The site was built with no dependencies at all: plain Node generates plain HTML. That rule
served it well. Nothing third-party could break it, slow it down or be compromised under
it, and the whole build could be read in an afternoon.

It now has to grow in two directions the rule cannot accommodate:

- **Tests.** The site has none. Checking pages in a real browser at five widths, running an
  accessibility audit and comparing rendered HTML needs a browser driver and an audit
  engine. Writing those ourselves is not a serious option.
- **Services.** The contact form currently falls back to `mailto:` because there is nothing
  to receive it. Services need an HTTP framework, a database driver and a message client.

The rule existed to protect the site from its dependencies. The decision is how to keep
that protection while taking some on.

## Options considered

1. **Keep the rule.** Hand-write test tooling and services with only the Node standard
   library. Rejected: it trades a well-understood supply-chain risk for a large amount of
   unreviewed homemade infrastructure, which is worse.
2. **Allow dependencies freely.** Rejected: that discards what the rule was protecting.
3. **Allow dependencies, and make adding and updating them deliberate.** Chosen.

## Decision

Dependencies are allowed in tooling and services. The **pages we ship to visitors keep zero
runtime JavaScript dependencies**: no framework, no bundle, only our own `site.js`.

Every dependency comes in under these controls:

| Control | Where | What it stops |
|---|---|---|
| Exact versions, committed lockfile, `--frozen-lockfile` in CI | `package.json`, `pnpm-lock.yaml`, `ci.yml` | A build silently picking up a different version than the one reviewed |
| Install scripts blocked unless named | `onlyBuiltDependencies` in `pnpm-workspace.yaml` | A package running code on every developer machine and CI runner at install |
| 3-day release quarantine | `minimumReleaseAge` in `pnpm-workspace.yaml` | Installing a compromised release in the window before it is caught and pulled. Verified: pnpm refuses a `@playwright/test` pre-release published the day before |
| 7-day update cooldown, grouped weekly | `.github/dependabot.yml` | The same risk, through automated update PRs |
| A dependency is justified in the PR that adds it | review | Accumulation of packages nobody chose on purpose |

## Consequences

- The repository now has a lockfile, and `pnpm install` is the first step of every build.
- The first dependencies are test tooling only (`@playwright/test`, `@axe-core/playwright`).
  Nothing reaches the browser.
- `CLAUDE.md` is updated to state the new rule.
