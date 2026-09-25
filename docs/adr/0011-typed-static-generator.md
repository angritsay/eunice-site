# 11. The site stays a static generator, in TypeScript, with escaping by default

- Status: Accepted
- Date: 2026-09-25

## Context

The site is about 1,800 lines of generator: template literals that build 18 pages, plus
one stylesheet and `site.js`. It had no types, and escaping was opt-in: every
interpolation had to remember `esc()`. It worked, but nothing checked that it kept
working. A content typo, such as a desk name misspelled, a date in the wrong format or
two client-type pages sharing an id, surfaced as a broken page, if anyone noticed.

## Decision

**Keep the generator; make it TypeScript.** `build.ts` and `src/**/*.ts` are strict
TypeScript under the repository's baseline. Node 24 runs them directly, with no build
step for the build.

- **Escaping by default.** Markup is written with the `html` tag
  (`src/lib/html.ts`). Every interpolated value is escaped unless it is markup itself,
  built by `html` or explicitly marked `raw()`. A forgotten escape is no longer possible.
  An unescaped insert needs `raw()`, which is easy to find in review; today it is
  used nowhere.
- **Content is validated.** `src/content/schema.ts` states the shape of every kind of
  content in zod: desks, audience pages, people, insights, events, quotes, roles.
  - The build fails with the path to the mistake, e.g.
    `insights.0.date: must be YYYY-MM-DD`.
  - The same schemas give the content its types, so most mistakes do not even compile.
  - An audience id is unique *within its desk* (`exchanges` exists on two desks).
- **Typed context.** `Ctx`, `Page` and `NavItem` (`src/lib/types.ts`) describe what a
  page is given and must return. Placements are typed from `@eunice/contracts`, so a
  button cannot record an entry point the intake service would reject.

**The conversion changed no output.** `dist/` and `preview.html` are byte-identical to
the JavaScript generator's, compared file by file, before this change merged. The DOM
goldens and the determinism check agree.

## Options considered

- **Astro (or another framework).** A component model, islands, and content collections
  with schemas. Deferred, not rejected. It would replace every file under `apps/web/src`
  and risk the 18 live URLs, for gains the site does not need yet: it has no
  client-side state, and its only script is `site.js`. The case changes if the site
  gains a CMS, or interactive pages.
- **Leave it as JavaScript with `// @ts-check`.** Cheaper, but JSDoc types across
  template-heavy code are noisy, and escaping would stay opt-in.

## Consequences

- `CLAUDE.md` states the rule: markup only through `html`; `raw()` only for our own
  artwork; new content kinds get a schema.
- The generator is under Biome like the rest of the repository. The shipped stylesheet
  and SVGs are excluded, so formatting never changes the bytes visitors download.
