# Motion on the Eunice site

How the site moves, what each part is tied to, and how to change it without breaking it.
Motion is the most fragile part of the site: most numbers below depend on each other, and
a change that looks fine on one screen can break the timing, or the promise to visitors
who ask for less motion, everywhere else.

**The rule for contributors:** you may change the *words* inside a drawing (section "Safe
changes"). Anything that changes *how something moves* (a duration, a delay, an easing, a
keyframe, a class a keyframe hangs on, the film's steps) needs the owner's go-ahead
first: open the pull request as a draft and say so.

## The language

- **One easing:** `--wf-ease`, `cubic-bezier(.22,.61,.36,1)`, for every entrance, scene
  change and accent. The marquees run linear; the one pulse eases out.
- **One loop:** every product drawing repeats on the same nine seconds. Keyframe
  percentages are written against 9s: 8% is 0.72s, 92% is 8.28s.
- **One rhythm:** items step in 120ms apart (`.wf__l1`…`.wf__l5` = .12s….6s). The
  answer lines of the Ask view follow later (`.wf__d4`…`.wf__d7` = 1.75s…2.25s), after
  the question has typed.
- **One entrance:** rise a little and un-blur (`wf-in`: from 0.6u down, 2px blur, to
  rest), then hold, then everything fades out together at the end of the loop.
- **The accent lands last:** the cited page, the flagged event, the changed value take
  the desk colour after everything else has settled (`wf-hot`, `wf-pulse`, `wf-mark`).
- **One pulse, never a loop of pulses.**
- **Still for those who ask:** under `prefers-reduced-motion` nothing moves, nothing is
  hidden, and the page reads complete with JavaScript off.

## What moves, and where it lives

| What | Where | Timing | Under the pointer | Reduced motion |
|---|---|---|---|---|
| Product drawings (`uiAsk`, `uiRead`, `uiMonitor`, `uiReport`) | markup and copy: `apps/web/src/ui.ts`; motion: `site.css`, "The product, drawn" (`.wf…`, `@keyframes wf-*`) | 9s loop; caret blinks 1.1s; placeholder shimmers 1.4s | keeps playing | all animation off; scan line, placeholders hidden |
| The film (`uiFilm`: ask and cite, find, watch, the closing line) | markup: `ui.ts`; steps: `site.js` "Product films" (`FILM_STEPS`, `FADE`); look: `site.css` `.wf--film`, `.wf__scene`, `.wf__close` | scenes 6.5s, 6s, 6.5s, 3.5s; a 350ms fade between; each scene's animations play once over 8s | holds | stays on its first scene |
| Reveal on scroll | `site.js` "Reveal on scroll"; `site.css` `.reveal` | 0.9s, `--wf-ease`, items of a row one after another (up to 7), 90ms apart; a row of facts 220ms apart, one card at a time | — | nothing is hidden or moved |
| Home tiles | `site.css` `.tile__shot` | the drawing sits flat and tilts (12°, −14°, 3°) over 0.7s, `--wf-ease` | tilts | flat; tilts at once on hover, no transition |
| Logo rows ("Clients", "Partners") | `components.ts` `logoMarquee()`; `site.css` `.logos…`, `@keyframes logos` | 90s and 50s a loop, linear | holds | stands still; the row wraps |
| Hover and focus details | `site.css` (buttons .15s, menus .2s, cards .4–.5s) | short, ease | — | all transitions off |

The team does not move. It was an expanding strip until October 2026; Yi and Philip asked
for a plain grid (`teamGrid()`, angritsay/eunice-site#72), and the owner agreed to drop
the motion.

## What is tied to what

Change one side of these and the other breaks:

1. **Keyframe percentages ↔ the 9s loop.** Changing a drawing's duration rescales every
   moment in it. Change all of them or none.
2. **The 120ms ladder ↔ the number of rows.** A drawing shows up to five rows (`wf__l1`…
   `wf__l5`). A sixth row needs a `wf__l6` step and the owner's go-ahead.
3. **The typed question ↔ `steps(42)` in `wf-type`.** The Ask question types in 42 steps
   between 3% and 18% of the loop. Keep each question about 45–60 characters (today 49–56),
   so it types at the same speed on every desk.
4. **`FILM_STEPS` in `site.js` ↔ the film's look in `site.css`.** Four steps, one per
   scene and the closing line; `data-step` 0–3 lights the matching rail icon and
   breadcrumb (`.wf__r0`…`.wf__r2`, `.wf__c0`…`.wf__c2`). A fifth scene needs both files
   changed together.
5. **`FADE` (350ms) ↔ `.wf__crumb` transition (.35s).** The view and its breadcrumb fade
   out together; keep these equal.
6. **The scene's 8s ↔ its step.** A scene's own animations play once over 8s; its step
   (6–6.5s) cuts in before the end on purpose, so the hold is never seen to fade.
7. **Class names ↔ keyframes.** `wf__in`, `wf__l1`…, `wf__d4`…, `wf__cite--hot`,
   `is-flag`, `wf__sk`, `wf__val`, `is-on`, `is-leaving`, `is-paused` carry the motion.
   Renaming one in `ui.ts` silently stops its animation.
8. **The frame ↔ `.wf` / `.wf__win`.** The background art shows 4% a side round the
   window. Change it in `site.css` only, never per page.

## Safe changes

You can make these without asking, then run the checks below:

- The words inside a drawing: the question, answers, sources, document names, rows and
  values in the `PM`, `DA`, `TD` and `COMPANY` copy objects at the top of `ui.ts`. Keep the
  same number of rows and roughly the same length (see 3 above), keep the copy
  fictional (no real funds, tokens or clients), and keep `hot` pointing at the row that
  matters.
- Which drawing a page uses, and which desk it is drawn for (`uiAsk('digital-assets')`).
- The alt text of a drawing (`label`).
- The firms in a logo row (`clients`, `partners` in `content/index.ts`).

## Ask the owner first

- Any duration, delay, easing, keyframe percentage or `steps()` count.
- Adding or removing an animation, a scene, a row step or a pulse.
- `FILM_STEPS`, `FADE` or anything in the `site.js` motion sections.
- Anything under `@media (prefers-reduced-motion: reduce)`.
- A new drawing (it goes in `ui.ts`, reusing the window and its views).
- Adding a pause button to the film: the owner chose not to have one.

## How to check a change

1. `pnpm build`, then `pnpm test:web`. `test/web/motion.spec.ts` fails if:
   - a drawing leaves the nine-second loop;
   - its entrances use another easing;
   - rows stop stepping 120ms apart;
   - anything moves on any page under reduced motion.

   `layout.spec.ts` checks that the film steps, holds under the pointer and stays still
   under reduced motion, and that the reveal hides only what is below the fold.
2. Open the pull request's preview and watch each drawing you touched through two full
   loops, on desktop and on a phone, then once with reduced motion on (macOS: System
   Settings → Accessibility → Display → Reduce motion).
3. Say in the pull request which drawings you watched.
