# eunice.ai

The Eunice website as code: eighteen pages, one stylesheet, no framework, no runtime dependencies. It replaces the Framer project.

**Pages:** Home · Private Markets · Digital Assets · Token Disclosure · Company · Careers · Insights

Each of the three desks also has a personalised page per client type — `/private-markets/lps/`, `/token-disclosure/issuers/` and so on — plus `/token-disclosure/register/`. Those are generated from `audiencePages` in `apps/web/src/content/index.ts` through one template in `apps/web/src/pages/audience.ts`, so adding a client type is an edit to the content file and nothing else.

## Start here

**Engineering taking the site over:** read [docs/handover.md](docs/handover.md) first: what is live, what is decided and what is left.

1. **Run it.** `pnpm install && pnpm build`, then open `apps/web/dist/index.html`, or `pnpm preview` for every page in one file.
2. **How it is built.** `apps/web/build.ts` renders every page from `apps/web/src/` into plain HTML. Markup goes through one escaping `html` tag; content is checked against a schema when the site builds ([ADR-0011](docs/adr/0011-typed-static-generator.md)).
3. **How it looks, reads and moves.** [docs/brand/](docs/brand/): the design system, the tone of voice and the motion rules, which contributors' Claude follows through `.claude/skills/`.
4. **Where it runs.** AWS S3 and CloudFront, defined in Terraform under [infra/terraform/](infra/terraform/), with a staging and a production environment ([ADR-0014](docs/adr/0014-static-site-on-aws.md)).
5. **Why.** [docs/adr/](docs/adr/) records every significant decision, including what was built and then removed.

## Why a repo instead of Framer

- **Branches that stay put.** In Framer a branch follows main, so a fix on main can break work in progress. Here a branch is a git branch: nothing moves until it is merged.
- **Edits by asking.** Anyone on the team can open the repo in Claude Code and say "add the October event" or "update Yi's bio". Every change is a readable diff and a pull request, reviewed before it goes live.
- **One source per fact.** A person, an event or an insight is written once in `apps/web/src/content/index.ts` and appears on every page that lists it. In Framer the same bio lives in three places.
- **Hosting is plain files** on S3 behind CloudFront in Eunice's own AWS account: nothing to run or patch.

## Editing

| To change | Edit |
| --- | --- |
| People, bios, photos | `apps/web/src/content/index.ts` → `people` (photos go in `apps/web/src/assets/img/people/`) |
| Insights, events, quotes, open roles | `apps/web/src/content/index.ts` |
| Copy on one page | `apps/web/src/pages/<page>.ts` |
| Navigation, footer, contact emails | `apps/web/src/site.config.ts` |
| Colours, type, spacing | tokens at the top of `apps/web/src/assets/site.css` |

Anyone using Claude: read `CLAUDE.md` first — it holds the design rules.

New to the repo? [CONTRIBUTING.md](CONTRIBUTING.md) explains how a change goes from a branch to the live site.

## Build and publish

```
pnpm install
pnpm build              # → dist/ (the site)
pnpm preview            # also → preview.html (every page in one file, for sharing)
pnpm test:web           # the site in a real browser: see below
```

Every pull request runs the build and the web tests (`.github/workflows/ci.yml`). Publishing is `.github/workflows/pages.yml`, which runs after CI: it publishes the head of `main` (a failed CI run on `main` never deploys, and the ruleset only lets checked pull requests in), then checks the live URLs, and every open pull request from this repository gets a preview at `/eunice-site/preview/pr-<N>/` (noindex; forks are never built; a pull request's code is built with a read-only token and never runs in the job that deploys). A closed pull request's preview goes on the next run. A daily run rebuilds so dated content stays current. One-time setup: repo **Settings → Pages → Source: GitHub Actions**.

## Checks

| Command | Runs |
| --- | --- |
| `pnpm check` | Biome, strict TypeScript, architecture rules |
| `pnpm build` then `pnpm test:web` | The site in a real browser (below) |
| `pnpm check:determinism` | Two builds, byte for byte the same |

## Tests

`pnpm test:web` builds nothing itself — run `pnpm build` first — then checks, on every page:

| Check | Catches |
| --- | --- |
| `urls` | A page that disappeared or appeared without being added to `apps/web/test/web/urls.json` |
| `links` | Any internal link, asset or `#fragment` that points nowhere; new `href="#"` placeholders |
| `layout` | Horizontal scroll at 390, 768, 1024, 1280 and 1440px; touch targets under 24px (WCAG 2.2 AA) |
| `layout › base path` | A page that only works at `/` or only under `/eunice-site/` |
| `a11y` | WCAG 2.2 AA violations via axe; known ones are listed per element in `known-a11y.json`, which can only shrink |
| `dom` | Any change to rendered HTML, against goldens in `apps/web/test/web/__golden__/` |
| `forms` | The contact dialog per entry point; no submission sent anywhere until an endpoint is set; the cookie banner when analytics is on |
| `motion` | A drawing off the nine-second loop or the one easing; anything that moves under reduced motion ([docs/brand/motion.md](docs/brand/motion.md)) |

## Before going live

- **The register has no listing.** `/token-disclosure/register/` explains what the register is and what an entry carries, but the list of published papers is a marked placeholder. It needs a source — the papers Eunice has notified — and a decision on how that reaches the build.
- **The copy on the personalised pages is a first draft.** The ten client-type pages were written from material already on the site rather than by the desks. No new claims or numbers, but they need the desks' own words before anyone points a client at them.
- Real assets: team portraits. Product visuals are drawn in HTML on purpose (`apps/web/src/ui.ts`), not screenshots. The master logo is in; the background art (dunes, ridges) is generated and needs no licence.
- Bios for Yi, Philip and Chrislyn; the text of the 4 September note.
- Contact form: it opens the visitor's mail app (addressed to `inquiries@eunice.ai`) until it is wired to Attio ([docs/handover.md](docs/handover.md)).
- Links for each insight (`url` field) once the articles move over from Framer.
- Hosting: apply the Terraform for staging, then production; point `eunice.ai` at CloudFront from `eunice-infrastructure` ([infra/terraform/README.md](infra/terraform/README.md)).
- Analytics: create the GA4 property and set its measurement id on the production build.
