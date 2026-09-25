# eunice.ai

The Eunice website as code: eighteen pages, one stylesheet, no framework, no dependencies. It replaces the Framer project.

**Pages:** Home · Private Markets · Digital Assets · Token Disclosure · Company · Careers · Insights

Each of the three desks also has a personalised page per client type — `/private-markets/lps/`, `/token-disclosure/issuers/` and so on — plus `/token-disclosure/register/`. Those are generated from `audiencePages` in `apps/web/src/content/index.ts` through one template in `apps/web/src/pages/audience.ts`, so adding a client type is an edit to the content file and nothing else.

## Start here (a ten-minute tour)

1. **Run it.** `docker compose up --build --wait`, then open http://localhost:8080 and send
   a form. The email is at http://localhost:8025, the trace of that one request at
   http://localhost:16686, and the funnel at http://localhost:3001.
2. **What it is.** [docs/architecture/overview.md](docs/architecture/overview.md) has
   the C4 context and containers, and the boundaries with the ADRs behind them.
3. **How a lead moves.** [docs/architecture/flows.md](docs/architecture/flows.md) has
   sequence diagrams, each naming the code and the test that proves it.
4. **Why.** [docs/adr/](docs/adr/) records eleven decisions, including what was deliberately
   *not* built.
5. **What it must do, and how we know.** [docs/analysis/requirements.md](docs/analysis/requirements.md)
   lists the measurable requirements and where each is verified.
   [Failure modes](docs/architecture/failure-modes.md) covers what happens when each
   part is down.
6. **The code.** Start with the form registry (`packages/contracts/src/forms/`), which
   the page and the server both use. Then `services/intake/src/`: `domain` → `application`
   → `adapters` → `server.ts`, with the layering enforced in CI.

## Why a repo instead of Framer

- **Branches that stay put.** In Framer a branch follows main, so a fix on main can break work in progress. Here a branch is a git branch: nothing moves until it is merged.
- **Edits by asking.** Anyone on the team can open the repo in Claude Code and say "add the October event" or "update Yi's bio". Every change is a readable diff and a pull request, reviewed before it goes live.
- **One source per fact.** A person, an event or an insight is written once in `apps/web/src/content/index.ts` and appears on every page that lists it. In Framer the same bio lives in three places.
- **Hosting is free** on GitHub Pages; `eunice.ai` can point at it when we are ready.

## Editing

| To change | Edit |
| --- | --- |
| People, bios, photos | `apps/web/src/content/index.ts` → `people` (photos go in `apps/web/src/assets/img/people/`) |
| Insights, events, quotes, open roles | `apps/web/src/content/index.ts` |
| Copy on one page | `apps/web/src/pages/<page>.ts` |
| Navigation, footer, contact emails | `apps/web/src/site.config.ts` |
| Colours, type, spacing | tokens at the top of `apps/web/src/assets/site.css` |

Anyone using Claude: read `CLAUDE.md` first — it holds the design rules.

## Build and publish

```
pnpm install
pnpm build              # → dist/ (the site)
pnpm preview            # also → preview.html (every page in one file, for sharing)
pnpm test:web           # the site in a real browser: see below
```

Every pull request runs the build and the web tests; `main` deploys only what passed, then checks the live URLs (`.github/workflows/ci.yml`). A daily run rebuilds so dated content stays current. One-time setup: repo **Settings → Pages → Source: GitHub Actions**.

## The whole system, locally

The forms post to **intake**, which stores each submission and announces it on NATS;
**notifier** turns that into an email to the ops inbox, with Reply-To set to the lead
([services/](services/), decisions in [docs/adr/](docs/adr/)). One command runs it all —
Postgres, NATS, both services with their migrations, the site behind a Caddy edge with a
strict CSP, Mailpit to catch the email, Umami for analytics, and Jaeger for traces:

```
docker compose up --build --wait
open http://localhost:8080                  # the site; its forms submit for real
open http://localhost:8080/api/intake/docs  # the API, from its OpenAPI document
open http://localhost:8025                  # Mailpit: the email ops receives
open http://localhost:16686                 # one trace per submission, browser to inbox
open http://localhost:3001                  # Umami: visits and the form funnel per entry point
pnpm test:e2e                               # entry points to the inbox, the funnel, outages
docker compose down -v                      # stop, and delete the local data
```

No `.env` is needed; `.env.example` lists what can be changed.

| Command | Runs |
| --- | --- |
| `pnpm check` | Biome, strict TypeScript everywhere, architecture rules |
| `pnpm --filter './packages/*' --filter './services/*' test` | Unit tests, no containers |
| `pnpm --filter './services/*' test:integration` | Services against real Postgres 18 and NATS (Testcontainers) |
| `pnpm generate` | Regenerates the OpenAPI (intake) and AsyncAPI (events) documents; CI fails if they are stale |

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

`pnpm check:determinism` builds twice and fails if a single byte differs.

## Before going live

- **The register has no listing.** `/token-disclosure/register/` explains what the register is and what an entry carries, but the list of published papers is a marked placeholder. It needs a source — the papers Eunice has notified — and a decision on how that reaches the build.
- **The copy on the personalised pages is a first draft.** The ten client-type pages were written from material already on the site rather than by the desks. No new claims or numbers, but they need the desks' own words before anyone points a client at them.
- Real assets: team portraits, and the Private Markets Documents and Portfolio screenshots (currently drawn in HTML as stand-ins). Product images in `apps/web/src/assets/img/` were cropped from page exports and should be replaced with full-resolution originals. The master logo and the City of London and Mayfair photographs are in.
- Bios for Yi, Philip and Chrislyn; the text of the 4 September note.
- Contact: confirm `contactEmail` / `careersEmail`. The live form keeps opening the visitor's mail app until intake is deployed and a privacy notice is published; the production build refuses a form endpoint without one ([ADR-0007](docs/adr/0007-personal-data-in-intake.md)).
- Links for each insight (`url` field) once the articles move over from Framer.
- DNS: point `eunice.ai` at GitHub Pages and set `BASE_PATH` back to `/`.
