# Analytics: reading the form funnel

Google Analytics 4 records a page view per visit and five events per form opening, each
with the entry point it came from — for visitors who accepted the cookie banner only
([ADR-0013](../adr/0013-analytics-google-analytics-with-consent.md)). It is off until the
Pages build sets `PUBLIC_GA_MEASUREMENT_ID` (a `G-…` id from the GA property).

## Events

| Event | When | Extra data |
|---|---|---|
| `form_open` | A button opened the form | — |
| `form_start` | First keystroke in the form | — |
| `form_submit` | The visitor pressed Send | — |
| `form_success` | Accepted | `channel`: `api` or `mailto` |
| `form_error` | Not accepted (validation, network) | `reason` |

Every event carries `variant` (which form), `page`, `placement` (nav, hero, body, band,
closing, footer), `audience` on client-type pages, and `entry` — one label for all of
it, e.g. `private-markets/lps/ · hero`. Register `entry`, `variant`, `placement` and
`audience` as event-scoped custom dimensions in GA (Admin → Custom definitions) so the
reports can filter on them.

## The funnel per entry point

1. **Explore → Funnel exploration.** Steps: event `form_open` → `form_start` →
   `form_submit` → `form_success`. Make it an open funnel within one session.
2. Break down by the custom dimension **`entry`** (or `variant`, `placement`,
   `audience`) to see one entry point, or save one exploration per desk.
3. Read it as: *opened* (interest) → *started* (the form did not put them off) →
   *submitted* → *accepted*. A drop between started and submitted points at the form
   itself; one between submitted and accepted points at validation or the service.

## Questions it answers

- Which buttons bring leads, per desk and per client type: `form_success` by `entry`.
- Whether a hero call to action outperforms the closing one: compare `placement`.
- Whether a variant's extra fields cost completions: `form_start` → `form_submit` by
  `variant`.

## What it will not tell you

Who anyone is. No names, emails or message text reach analytics. Visitors who declined
cookies are not counted at all, so the numbers are a floor, not a total. A lead's
identity is only in the email ops receives (and in intake, if it is deployed).
