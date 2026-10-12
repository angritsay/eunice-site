---
name: eunice-review
description: Review a pull request on the eunice.ai website against the team's voice and design rules before the owner approves it. Use when asked to review, check or "look over" a site PR, or to go through the morning's open pull requests.
---

# Reviewing a change to the Eunice site

The owner reviews every pull request before it merges. This skill does the first pass so
the owner only has to decide. Read the diff, check it against the rules, and report
plainly: what is fine, what must change, and what is a matter of taste.

## How

1. List the open pull requests (or take the one named). For each, read the description,
   the diff and the CI checks. Open the preview link the bot posted
   (`https://angritsay.github.io/eunice-site/preview/pr-<N>/`) if you can view it.
2. Check the diff against:
   - **Words** — [docs/brand/tone-of-voice.md](../../../docs/brand/tone-of-voice.md):
     plain, specific, UK spelling, sentence case, no hype words, only figures and
     credentials the site already states, regulation only on Digital Assets.
   - **Design** — [docs/brand/design-system.md](../../../docs/brand/design-system.md) and
     the rules in `CLAUDE.md`: ink on white, the one grey, desk colour as a hint only,
     four type roles, hairlines not boxes, no numbering or eyebrows, components reused,
     shared fixes in the shared component.
   - **Structure** — shared content only in `content/index.ts`; imported posts and jobs
     not hand-edited; ported pages (`mica-whitepaper.ts`, `security.ts`) untouched; a new
     page added to `urls.json`; golden changes match the intent.
   - **Safety** — no secrets, no new dependency without a reason, no tests skipped or
     loosened, nothing that collects personal data without the privacy gate.
3. Do not push fixes to someone else's branch unless the owner asks. Suggest the exact
   change instead.

## Report

One block per pull request:

- **Verdict:** ready to approve / needs changes / needs the owner's call.
- **Must change:** each item with the file and line, what is wrong, and the fix.
- **Owner's call:** anything that breaks a design rule on purpose or adds a new claim,
  colour, size or component.
- **Fine as is:** one line.

Keep it short. Quote the line you mean rather than describing it.
