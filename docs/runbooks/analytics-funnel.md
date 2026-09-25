# Analytics: reading the form funnel

Umami records a page view per visit and five events per form opening, each with the entry
point it came from. Locally, open **http://localhost:3001** (user `admin`, password
`UMAMI_ADMIN_PASSWORD` from `.env.example`). In production, the dashboard is on the
internal network only (see the go-live notes).

## Events

| Event | When | Extra data |
|---|---|---|
| `form_open` | A button opened the form | — |
| `form_start` | First keystroke in the form | — |
| `form_submit` | The visitor pressed Send | — |
| `form_success` | Accepted | `channel`: `api` or `mailto` |
| `form_error` | Not accepted (validation, network) | `reason` |

Every event carries `variant` (which form), `page`, `placement` (nav, hero, band, roles,
closing, footer), `audience` on client-type pages, `role` for job applications, and
`entry` — one label for all of it, e.g. `private-markets/lps/ · hero`.

## The funnel per entry point

1. **Reports → Funnel → New.** Steps: event `form_open` → `form_start` → `form_submit` →
   `form_success`. Window: 30 minutes.
2. Add a filter on the event property **`entry`** (or `variant`, `placement`,
   `audience`) to see one entry point, or save one report per desk.
3. Read it as: *opened* (interest) → *started* (the form did not put them off) →
   *submitted* → *accepted*. A drop between started and submitted points at the form
   itself; one between submitted and accepted points at validation or the service.

## Questions it answers

- Which buttons bring leads, per desk and per client type: `form_success` by `entry`.
- Whether a hero call to action outperforms the closing one: compare `placement`.
- Whether a variant's extra fields cost completions: `form_start` → `form_submit` by
  `variant`.

## What it will not tell you

Who anyone is. No names, emails or message text reach analytics, and there are no
cookies, so a returning visitor is not linked across days. A lead's identity is only in
intake, and in the email ops receives.
