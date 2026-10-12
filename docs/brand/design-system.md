# Eunice design system

How the site looks, and the parts it is built from. It describes what is already in the
code: the tokens in `apps/web/src/assets/site.css` and the components in
`apps/web/src/components.ts`, `ui.ts` and `art.ts`. The short rules in
[CLAUDE.md](../../CLAUDE.md) are the agreed ones; this page explains them and shows which
part to reach for. Words are in [tone-of-voice.md](tone-of-voice.md).

**Change a token, not a rule; change a component, not a page.** A fix that shows on
several pages goes into `site.css` or `components.ts`, so every page gets it.

## Principles

1. **Ink on white.** The master brand is black on white, with one cool grey. Colour is
   a hint that says which desk you are looking at, never decoration.
2. **Air over ornament.** Type is small and spacing is generous. Blocks are separated by
   space and a hairline on top, not by boxes, borders or shadows.
3. **Show the product, drawn.** Product imagery is a drawn, mid-fidelity Eunice window
   with fictional data, never a screenshot.
4. **Proof, not adjectives.** Numbers, named credentials and client quotes carry the
   claims.
5. **Nothing that reads as generated.** No numbering (01, 02), no uppercase eyebrows, no
   bordered card grids.

## Tokens

### Colour

| Token | Value | Use |
|---|---|---|
| `--white` | `#ffffff` | The page ground. White only. |
| `--band` | `#f5f7fa` | The one grey: a full-width band behind a section. A coloured tint never sits on it. |
| `--ink` | `#111214` | Headings, numbers, buttons, anything that must read first |
| `--text` | `#1f2430` | Body copy |
| `--muted` | `#5f6b7a` | Leads, secondary lines |
| `--faint` | `#6a717d` | Small metadata; still AA on white and on the band |
| `--line` | `#e4e8ef` | Hairlines between blocks |
| `--quote-bg` | `#f1efed` | The one warm grey, for every client quote card |
| `#16171b` | (literal) | The only dark grounds: the Home "About" band (`band--ink`), the closing call to action (`cta()`), the pull quote |

**Desk colours** (a hint only: the dot or mark beside the desk's name, its glyph on a
tile, the opening mark of its pull quote, the one accent in a product drawing):

| Desk | Token | Value |
|---|---|---|
| Private Markets | `--pm-field` | `#5b82f7` blue |
| Digital Assets | `--da-field` | `#FA8846` orange |
| Token Disclosure | `--td-field` | `#e0a03a` gold |

Each desk's `-ink`, `-text` and `-tint` tokens resolve to ink and the band on purpose, so
desk text, numbers, bullets and panels stay black and white. Do not bring colour back
into text or panels without asking the owner.

### Type

Manrope for headings, Inter for everything else, JetBrains Mono for quotes and the
product drawings. All three are self-hosted (no request to Google). Four roles only:

| Role | Class | Size | Notes |
|---|---|---|---|
| Heading 1 | `.h1` | 32–51.2px (fluid) | Manrope 400, tight tracking. One per page, in the hero. |
| Heading 2 | `.h2`, `sectionHead()` | 22.4–28.8px (fluid) | Names a section. Every section has a real heading. |
| Body | `.lead`, `.body`, `.small` | 13.6 / 13.6 / 12px | `.lead` is muted, max 34em wide. Base text is 12.8px. |
| Caption | `.caption`, `.label` | 10.4 / 13px | Metadata and small labels, in sentence case, never capitals. |

The scale went down 20% in September 2026 to leave more air; body copy sits under the
earlier 15px floor deliberately. Do not add sizes, sub-headings or take it lower without
asking. (`.h3`/`.h4` exist for fact titles and drawings, not as new heading levels.)

### Space and shape

| Token | Value | Use |
|---|---|---|
| `--section` | 104–200px (fluid) | Space between blocks. The layout test fails under 96px on desktop and 80px below 1024px. |
| `--section-tight` | 88–140px (fluid) | The tighter step, for a block that belongs to the one above |
| `--wrap` | 1312px | Content width, inside `--gutter` (20–64px) |
| `--radius` | 14px | Heroes, plates, the pull quote |
| Buttons | 999px radius, 44px tall (36px small) | Pills |

Breakpoints in use: 600, 720, 809/810, 960/961, 1100, 1199/1200px. Every layout stacks to
one column on a phone; nothing scrolls sideways.

## Page anatomy

A page is the header (`header()`), a hero, a run of sections, the closing call to action
(`cta()`) and the footer (`footer()`). `buildSite()` in `apps/web/build.ts` adds the shell.

- **Hero:** `.hero` with the text (H1, one or two `.lead` lines, buttons) on the left and
  a visual on the right: `heroField()` on product pages, a `plate()` or `stage()` elsewhere.
  `.hero--short` drops the visual.
- **Section:** `<section class="wrap section">`, opened by `sectionHead()`.
- **Band:** `.band` for a grey full-width section; `.band--ink` only for the Home "About" band.
- **Navigation** depends on where you are: company pages show the products, a product
  page shows its own audiences (`apps/web/src/site.config.ts`).

## Components

Reach for these before writing markup. All markup goes through the `html` tag
(`apps/web/src/lib/html.ts`), which escapes what it interpolates.

| Component | Use it for | Don't |
|---|---|---|
| `button(ctx, {label, kind, form, to})` | Every button. `kind`: `dark` (primary), `outline`, `light`, `outline-light` on ink. `form` opens the contact dialog. | Invent a new button style. The primary call to action is "Book demo". |
| `sectionHead(label, aside?, action?)` | The heading of every section, with an optional line or button on the right | Add an eyebrow or a number above it |
| `feature({title, body, visual, flip, desk, stage})` | A product row: text and visual in equal halves, alternating with `flip` | Make one side wider |
| `facts(items, cols)` | A row of short facts, each `{art, title, text}` with its line drawing from `art.ts` | Add a fact without a drawing. Pick one of: `shield lock noTrain cite seed award sandbox sources globe legal tag library date`, or add one to `art.ts`. |
| `numbers(ctx, { lead, rows })` | Proof: a recognition led by its publisher's logo and the line it gave us, then figures in hairline rows, each with a short note | Use a figure the site does not already state |
| `badges(items)` | Credentials in outlined pills (SOC 2 Type II, GDPR…) | Explain them inside the pill |
| `path(stops, {onward})` | A sequence that matters, drawn as stops on one line | Number the steps |
| `bullets(items, desk)` | A short list inside a feature | Colour the bullets |
| `pullQuote(q)` | The one quote a page puts on stage: large, on ink, opening mark in the desk colour | Use more than one per page |
| `quoteBlock(q)` | Rows of client quotes: warm ground, words in mono, the desk named by its mark | Put them on the grey band |
| `logoMarquee(ctx, 'clients' \| 'partners')`, `partnersRow(ctx)`, `investorsBlock(ctx)` | Logo rows: grey caption on the left, firms drifting left in one grey. The investors block mirrors `numbers()`: a statement and the scout programmes in words, the four logos in an open 2×2 wall, no rules between them | Add a firm anywhere but `clients`/`partners` in `content/index.ts` |
| `insightsBlock(...)`, `insightCard`, `insightRow` | Blog and news. One featured card sits left, the list beside it. | Stretch a single card across the page |
| `eventsBlock(...)` | Upcoming and past events from `content/index.ts` | Hard-code an event on a page |
| `teamGrid(ctx, ids, hiring?)` | The team: one plain grid, portrait, name, role, LinkedIn; an optional hiring card last | Paste a bio into a page |
| `whoCards(...)`, `audienceLine(...)` | Who a desk serves, linking to its client-type pages | |
| `plate(ctx, {img \| html})` | A raised product visual: the one shadow on the site | Add a shadow anywhere else |
| `heroField({desk})`, `stage({film})` | The product hero and the product film | |
| `article(ctx, ...)`, `listCards(...)` | Posts, jobs and legal pages; list pages | |
| `cta(ctx, {title, text, buttons})` | The closing call to action on ink | Add a second dark section |

Content used on more than one page (people, insights, events, quotes, roles, partners)
lives only in `apps/web/src/content/index.ts`, checked by `content/schema.ts`.

## Product drawings

`apps/web/src/ui.ts` draws one Eunice window (glyph and breadcrumb, a rail of line icons,
one view) with fictional funds and tokens:

| Drawing | Shows |
|---|---|
| `uiAsk(desk)` | A question asked and an answer where every line is cited. Digital Assets answers with a four-column table (token, event, date, your decision), the decision cited; the token counts in drawings (340 tokens) are fictional copy, not a claim |
| `uiRead(desk)` | A document read, the passage that matters marked and cited |
| `uiMonitor(desk)` | Events monitored over time, one change flagged |
| `uiReport(desk)` | A report built to your template, every line sourced |
| `uiFilm(...)` | The film site.js steps through: ask and cite, find, watch, the closing line |

- **Drawing:** ink on white, hairlines, four type sizes, quiet page-mark citations. The
  desk colour marks only the one thing that matters.
- **Motion:** one easing (`--wf-ease`), items 120ms apart, entrances that rise and
  un-blur, the accent landing last, one pulse (never a loop of pulses), everything fading
  out together. Every drawing runs on the same nine-second loop. It holds while the
  pointer rests on it and stands still under reduced motion. There is no pause button.
- **Frame:** the desk's background art shows only as a thin border round the window (4%
  a side, about 15% of the drawing): dunes for the company, misted ridges for Private
  Markets, copper for Digital Assets and Token Disclosure. Change the frame in `site.css`
  (`.wf`, `.wf__win`), never per page.
- **New drawing:** add it to `ui.ts`, reusing the window and its views, after reading
  [motion.md](motion.md).

## Imagery

- Background art is abstract, blurred nature generated to the palette. No city or street
  photography, no stock people.
- Team portraits: 720×720 cut-out WebP in `assets/img/people/`, shown square.
- Blog covers: WebP, at most 1200px wide, in `assets/img/blog/`. A cover a re-import brings in as PNG or JPEG is converted before it is committed.
- Logos: one grey, sized by height in `content/index.ts`.

## Motion

The full rules, what is tied to what, and what is safe to change are in
[motion.md](motion.md); `test/web/motion.spec.ts` holds them. In short:

Blocks ease up into place as they scroll in, the items of a row following one another
(`site.js`, `.reveal`); only what starts below the fold is hidden. Logo rows drift slowly.
All of it stops under `prefers-reduced-motion`, and the page reads complete with
JavaScript off.

## Accessibility

- Text colours pass WCAG AA on white and on the band. `test/web/a11y.spec.ts` runs axe
  (WCAG 2.2 AA) on every page; known issues live in `known-a11y.json`, which can only
  shrink, so a new violation fails.
- Every image has alt text naming what it shows; decorative copies (the loop of a logo row)
  are hidden from screen readers.
- Focus is always visible (`:focus-visible`). Buttons are 44px tall, and small links get
  extra padding on touch screens.

## Adding something new

Ask the owner first before you:

- add a colour, a type size, a shadow, a border or a dark section;
- add a new component when an existing one nearly fits;
- change the frame, the motion or the drawing style of the product visuals;
- touch the pages ported from the live site (`mica-whitepaper.ts`, `security.ts`), which
  keep the live copy and look.

A significant decision gets a record in `docs/adr/` in the same pull request.
