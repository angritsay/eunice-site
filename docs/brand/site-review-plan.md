# Site review against Yi's voice

A review of every line we wrote, against the tone of voice as Yi calibrated it in
October 2026 ([tone-of-voice.md](tone-of-voice.md)). Her answers are the basis: where
they disagree with an older rule, they win.

## What the review checks

Every page, top to bottom, against these questions:

1. **First screen: why care?** Within the first scroll a prospective client sees who
   trusts us and what we hold: the trust line ("Enterprise-grade security · SOC 2 Type
   II, GDPR, and no training on your data"), clients, the figures in the claims table.
2. **Then: how are we different?** The page leads with the thesis (decision governance,
   a record you can defend, the same standard every time), not with "we do diligence".
3. **Shortest version.** Each line is the shortest that keeps its fact. Setup words go
   ("Enable you to", "how we can").
4. **Does it read as AI-written?** Stacked "X, not Y" lines, triplets on every row, em
   dashes, filler openers, abstract nouns. Nothing playful.
5. **AI named plainly**, with the client's team in control.
6. **Claims.** Only figures in the claims table. New ones (50+ risk types) wait for a
   source.
7. **Mechanics.** UK spelling, sentence case, no Oxford comma, buttons from the list,
   contractions where the full form reads stiff.
8. **Desk rules.** Regulation and the FCA sandbox only on Digital Assets and Token
   Disclosure.

## Scope

About 9,700 words on 17 pages, plus the shared parts. A scan of the built pages found
em dashes on 10 of them (7 on Careers) and "X, not Y" lines on 5.

| Pass | Pages | Words | Source files |
|---|---|---|---|
| 1. Home | Home | 1,310 | `pages/home.ts`, `content/index.ts` |
| 2. Private Markets | desk page; LPs, managers, family offices | 2,440 | `pages/private-markets.ts`, `pages/audience.ts`, `content/index.ts` (audiences) |
| 3. Digital Assets | desk page; exchanges, custodians, market makers | 2,290 | `pages/digital-assets.ts`, `content/index.ts` |
| 4. Token Disclosure | desk page; issuers, counsel, exchanges; register | 2,010 | `pages/token-disclosure.ts`, `pages/register.ts`, `content/index.ts` |
| 5. Company and Careers | Company, Careers, Insights index | 1,610 | `pages/company.ts`, `pages/careers.ts`, `pages/insights.ts` |
| 6. Shared | menus, footer, forms and their messages, page titles and descriptions, trust lines, call-to-action blocks, words inside the drawings, alt text | — | `site.config.ts`, `components.ts`, `packages/contracts/src/forms/`, `ui.ts` |

**Not in scope** (by the rules in `CLAUDE.md`): the pages ported word for word from the
live site (MiCA white paper, Security), the imported blog posts and job descriptions,
and the legal pages. Careers is the exception Yi raised ("too much even for careers"):
the page's own lines are in pass 5; the job descriptions stay as imported unless the
owner says otherwise.

## How each pass runs

1. **Extract.** Every visible line of the pass, with where it sits (hero, section, card,
   button, meta description), from the built HTML.
2. **Mark.** Each line gets a verdict against the checks above: keep, shorten, rewrite,
   cut, or "needs a fact" (a figure or a client quote we do not have yet).
3. **Rewrite.** A proposed line for every one that is not "keep". Yi's own lines go in
   as she wrote them.
4. **Approve.** The lines go to Yi and Nastia on one page per pass, like the voice
   check: approve, edit, or reject each line. Nothing changes on the site before that.
5. **Apply.** One pull request per pass with the approved lines. Words inside the
   drawings keep their length and row count ([motion.md](motion.md)); the golden HTML
   diff is checked to show only the approved changes. The preview link goes back to the
   approvers.

Pass 1 also applies Yi's picks for Home (the call to action, the trust line). Pass 2
starts from her Private Markets lines (the thesis hero, the USS words, the family offices
card). Pass 3 starts from her custodians line and her picks for exchanges, market makers
and the desk page once she has made them.

## What the passes need from people

| Needed | From | Blocks |
|---|---|---|
| The thesis line for Digital Assets and Token Disclosure (she gave Private Markets: "Better decision governance. Better outcomes.") | Yi | Passes 3 and 4 heroes |
| Her picks for exchanges, market makers and the Digital Assets page (added to the voice check after she answered) | Yi | Pass 3 |
| A source for "50+ risk types" | Yi or the Digital Assets desk | The custodians hero as she wrote it |
| Whether USS may be quoted, by name or not | Yi | Pass 2, "What this looks like now" |
| Whether the job descriptions are rewritten too | Nastia | Pass 5 |

## Order and size

Passes run in the order above: Home and Private Markets first, because they carry the
most traffic and Yi's clearest direction. Each pass is a review page, then one pull
request. The shared pass (6) runs alongside pass 1, since the menus, footer and forms
show on every page.

After the last pass, the "Known inconsistencies" list in the voice guide should be
empty, and `eunice-review` checks every later pull request against the same rules.
