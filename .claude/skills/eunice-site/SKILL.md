---
name: eunice-site
description: Make a change to the eunice.ai website the way the team agreed — copy, a person or bio, an insight, event, quote, role or logo, a section, a page, a visual or an animation. Use for any request to add, edit, remove or fix something on the site, including plain-language requests from non-developers ("update Yi's bio", "add the October event", "the hero line should say…").
---

# Changing the Eunice site

The people asking are often not developers. They describe what they want in plain words
and check the result on the preview link. Your job: make the change in the right place,
in the site's voice and design, prove it builds, and hand back a link and a short summary
they can read without opening the code.

## 1. Understand the ask

- Restate it to yourself in one line: what changes, on which page(s), for which desk.
- If it is ambiguous in a way that changes the result (which page, which wording, which
  desk), ask one short question before editing. Otherwise proceed.
- If they paste copy, use their words. Fix only spelling, UK spelling and obvious slips,
  and say what you changed.

## 2. Find where it lives

| What | Where |
|---|---|
| People, bios, insights, events, quotes, roles, clients, partners | `apps/web/src/content/index.ts` (one place; never paste into a page) |
| The copy of one page | `apps/web/src/pages/<page>.ts` |
| Client-type pages (`/private-markets/lps/` …) | `audiencePages` in `content/index.ts`, rendered by `pages/audience.ts` |
| Navigation and footer | `apps/web/src/site.config.ts` |
| Contact form fields and titles | `packages/contracts/src/forms/` |
| Shared blocks | `apps/web/src/components.ts`; styles in `apps/web/src/assets/site.css` |
| Product drawings | `apps/web/src/ui.ts`; fact drawings in `art.ts` |
| Images | `apps/web/src/assets/img/` (portraits: 1000×1000 WebP in `people/`) |
| Blog posts and job descriptions | Imported from the live site: re-import with `pnpm --filter @eunice/web import:live posts\|jobs`; never hand-edit |
| `mica-whitepaper.ts`, `security.ts` | Ported live pages: keep their copy and look unless the owner asks |

## 3. Write the words

Read [docs/brand/tone-of-voice.md](../../../docs/brand/tone-of-voice.md) before writing or
changing any copy that a visitor reads. The short version:

- Credible, short and punchy, the way a desk talks to a client: say what the client
  gets, with a source or a number where there is one. Take the shortest version that
  keeps the fact.
- It must never read as AI-generated or playful: no stacked "X, not Y" lines, no
  triplets on every row, few em dashes.
- Credentials and the thesis come early; "we do diligence" alone says nothing.
- UK spelling. Sentence case for headings and buttons. "Book demo" is the primary call
  to action.
- No hype words (revolutionary, unlock, game-changing, seamless, cutting-edge…).
- Only figures and credentials already stated on the site. Regulation and the FCA
  sandbox belong to Digital Assets only.

## 4. Build it

Read [docs/brand/design-system.md](../../../docs/brand/design-system.md) before adding or
changing markup, layout or styles. The short version:

- Reuse a component from `components.ts`; write markup only with the `html` tag.
- Ink on white; the one grey is `--band`; a desk keeps only a hint of its colour.
- Four type roles, no new sizes. Hairline on top, no boxes, no extra shadows.
- No numbering (01, 02) and no uppercase eyebrows. Every fact has its drawing.
- Fix something that shows on several pages in the shared component, never on one page.
- New content kind → a schema in `content/schema.ts`. New page → add it to
  `apps/web/test/web/urls.json`.

**Ask the owner first** (open the PR as a draft and say so) before you add a colour,
type size, shadow or dark section, invent a component, change the product drawings'
style, state a new figure or claim, or touch the ported live pages.

## 4b. If it moves, stop and read

Motion is the easiest thing to break and the hardest to notice. If the change touches
the product drawings (`ui.ts`), the `.wf…` styles or `@keyframes` in `site.css`, the
film, the reveal, the logo rows or the team strip in `site.js`, read
[docs/brand/motion.md](../../../docs/brand/motion.md) first.

- **Safe without asking:** the words inside a drawing (keep the row count and roughly
  the length; keep the typed question 45–60 characters; keep the copy fictional), which
  drawing or desk a page uses, the drawing's alt text, the firms in a logo row.
- **Ask the owner first, every time:** any duration, delay, easing, keyframe percentage,
  `steps()` count, class name a keyframe hangs on, `FILM_STEPS` or `FADE`, anything
  under `prefers-reduced-motion`, a new animation or a new drawing. Open the pull request
  as a draft and say what you want to change and why.
- **Never** rename `wf__in`, `wf__l1`…, `wf__d4`…, `is-on`, `is-leaving`, `is-paused` or
  the other classes the motion hangs on, add a pause button to the film, or make
  something move under reduced motion.
- After a motion change, `test/web/motion.spec.ts` must pass, and the pull request says
  which drawings you watched on the preview through two full loops, on desktop, on a
  phone and with reduced motion on.

## 5. Prove it

```
pnpm build
pnpm test:web
```

Both must pass. If you changed rendered HTML on purpose, run `pnpm test:web:update` and
read the golden diff: it should show your change and nothing else. If a test fails,
fix the cause; never skip, delete or loosen a test to get green.

## 6. Ship it

- Branch `claude/<topic>` (or `yi/<topic>` when Yi is driving). Never push to `main`,
  never force-push, never merge.
- Commit with a message that says what changed for a reader of the site.
- Open a **draft** pull request: one line per change, in plain words.
- Give the requester the preview link,
  `https://angritsay.github.io/eunice-site/preview/pr-<N>/`, live a few minutes after the
  checks pass, and tell them which page to look at. The owner reviews and merges.

## 7. Before you hand back

Check your own change against this list:

- [ ] The words read like the rest of the site (tone-of-voice.md checklist).
- [ ] No new colour, size, border, shadow, number label or eyebrow.
- [ ] Nothing that moves changed, or the owner agreed and motion.md's checks pass.
- [ ] Shared content edited in `content/index.ts`, not pasted into a page.
- [ ] Every claim and figure already appears elsewhere on the site.
- [ ] `pnpm build` and `pnpm test:web` pass; golden changes are only the intended ones.
- [ ] The summary for the requester says what changed, where, and the preview link.
