# 1. Record architecture decisions

- Status: Accepted
- Date: 2026-09-25

## Context

This repository is growing from a static site into a site plus the services behind its
forms. The people who will maintain it, and anyone reviewing it, need to know why it is
shaped the way it is — which parts were chosen, which were rejected, and what would have
to change for a decision to be revisited. Commit messages carry some of this, but they
are scattered and hard to find by topic.

## Decision

Keep architecture decision records in `docs/adr/`, one file per decision, in MADR form:
context, the options considered, the decision, and its consequences.

- A record is written in the pull request that implements the decision, so the record and
  the code land together and cannot describe something that was never built.
- Accepted records are not edited beyond typos. Reversing a decision means a new record
  marked as superseding the old one.
- Decisions *not* to build something get records too. For a system this size those are
  often the more important ones.

## Consequences

- Reviewers can read the reasoning in one place, in order.
- Every significant pull request carries a little more writing. That cost is the point.
