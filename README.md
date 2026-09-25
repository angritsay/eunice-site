# eunice.ai

The Eunice website as code: eighteen pages, one stylesheet, no framework, no dependencies. It replaces the Framer project.

**Pages:** Home · Private Markets · Digital Assets · Token Disclosure · Company · Careers · Insights

Each of the three desks also has a personalised page per client type — `/private-markets/lps/`, `/token-disclosure/issuers/` and so on — plus `/token-disclosure/register/`. Those are generated from `audiencePages` in `src/content/index.js` through one template in `src/pages/audience.js`, so adding a client type is an edit to the content file and nothing else.

## Why a repo instead of Framer

- **Branches that stay put.** In Framer a branch follows main, so a fix on main can break work in progress. Here a branch is a git branch: nothing moves until it is merged.
- **Edits by asking.** Anyone on the team can open the repo in Claude Code and say "add the October event" or "update Yi's bio". Every change is a readable diff and a pull request, reviewed before it goes live.
- **One source per fact.** A person, an event or an insight is written once in `src/content/index.js` and appears on every page that lists it. In Framer the same bio lives in three places.
- **Hosting is free** on GitHub Pages; `eunice.ai` can point at it when we are ready.

## Editing

| To change | Edit |
| --- | --- |
| People, bios, photos | `src/content/index.js` → `people` (photos go in `src/assets/img/people/`) |
| Insights, events, quotes, open roles | `src/content/index.js` |
| Copy on one page | `src/pages/<page>.js` |
| Navigation, footer, contact emails | `src/site.config.js` |
| Colours, type, spacing | tokens at the top of `src/assets/site.css` |

Anyone using Claude: read `CLAUDE.md` first — it holds the design rules.

## Build and publish

```
pnpm install
pnpm build              # → dist/ (the site)
pnpm preview            # also → preview.html (every page in one file, for sharing)
pnpm test:web           # the site in a real browser: see below
```

Every pull request runs the build and the web tests; `main` deploys only what passed, then checks the live URLs (`.github/workflows/ci.yml`). A daily run rebuilds so dated content stays current. One-time setup: repo **Settings → Pages → Source: GitHub Actions**.

## Tests

`pnpm test:web` builds nothing itself — run `pnpm build` first — then checks, on every page:

| Check | Catches |
| --- | --- |
| `urls` | A page that disappeared or appeared without being added to `test/web/urls.json` |
| `links` | Any internal link, asset or `#fragment` that points nowhere; new `href="#"` placeholders |
| `layout` | Horizontal scroll at 390, 768, 1024, 1280 and 1440px; touch targets under 24px (WCAG 2.2 AA) |
| `layout › base path` | A page that only works at `/` or only under `/eunice-site/` |
| `a11y` | WCAG 2.2 AA violations via axe; known ones are listed per element in `known-a11y.json`, which can only shrink |
| `dom` | Any change to rendered HTML, against goldens in `test/web/__golden__/` |

`pnpm check:determinism` builds twice and fails if a single byte differs.

## Before going live

- **The register has no listing.** `/token-disclosure/register/` explains what the register is and what an entry carries, but the list of published papers is a marked placeholder. It needs a source — the papers Eunice has notified — and a decision on how that reaches the build.
- **The copy on the personalised pages is a first draft.** The ten client-type pages were written from material already on the site rather than by the desks. No new claims or numbers, but they need the desks' own words before anyone points a client at them.
- Real assets: team portraits, and the Private Markets Documents and Portfolio screenshots (currently drawn in HTML as stand-ins). Product images in `src/assets/img/` were cropped from page exports and should be replaced with full-resolution originals. The master logo and the City of London and Mayfair photographs are in.
- Bios for Yi, Philip and Chrislyn; the text of the 4 September note.
- Contact: confirm `contactEmail` / `careersEmail`, and pick a form service for `formEndpoint` (until then the form opens the visitor's mail app).
- Links for each insight (`url` field) once the articles move over from Framer.
- DNS: point `eunice.ai` at GitHub Pages and set `BASE_PATH` back to `/`.
