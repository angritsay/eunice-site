# 5. Contracts first: one form registry drives the page and the server

- Status: Accepted
- Date: 2026-09-25

## Context

Forms differ by where the visitor opens them: the Private Markets desk asks which fund, the
Token Disclosure desk asks which token and where it will be offered, an application asks
for a link to a CV. The old site kept this copy in a `TOPICS` object inside `site.js`,
and nothing on a server checked any of it.

With a backend, the same definition exists twice — what the browser asks, and what the
server accepts. Two copies drift: a field added to one side is rejected, or silently
dropped, by the other.

*Update, Sep 2026:* every variant now asks the same three things — name, work email and
an optional note — to make the forms quicker to send, and job applications moved to each
role's own application form (Tally), so the `careers` variant is gone. The registry
still decides the wording, the desk and validation, on both sides.

## Decision

**One registry, `packages/contracts/src/forms/`, is the only definition.** Each *variant*
(general, private-markets, digital-assets, token-disclosure, sample-report)
lists its fields; each field carries its label, input kind *and its zod schema*.

- The site's build renders the dialog from it: one disabled `<fieldset>` per variant,
  enabled by `site.js` for the button pressed.
- intake validates each request against the chosen variant's schema, as a discriminated
  union on `variant`. Unknown fields are rejected (`strictObject`), so a stale page cannot
  send data the server does not expect to keep.

**Entry points are data, not code.** Every button that opens the form carries
`data-form` (the variant) and `data-placement` (nav, hero, band, roles, closing, footer).
With the page path and the page's audience, that is the *entry point* stored with every
submission, shown to ops, and later used to group the analytics funnel. A new form
somewhere on the site is a button attribute; a new variant is one registry entry.

**The HTTP contract is generated from the code that implements it.** Routes are declared
once with `@hono/zod-openapi`; the same declaration validates requests, types the
handler, and produces the OpenAPI 3.1 document served at `/openapi.json` (browsable at
`/docs`). `pnpm openapi` writes it to `services/intake/generated/openapi.json`; CI
regenerates it and fails if the committed copy differs, so a reviewer sees every contract
change as a diff.

**Events are CloudEvents 1.0** with a versioned reverse-DNS `type`
(`ai.eunice.intake.submission.received.v1`). A breaking change is a new type, never an
edit to an existing one.

**Errors are RFC 9457 problem details**, the same shape from every service. A 400 lists
each rejected field by path, and the site marks those inputs `aria-invalid`.

## Consequences

- Client and server cannot disagree about a form: they read the same object.
- `packages/contracts` depends on zod only and nothing else in the repository
  (`contracts-are-a-leaf`), so the site can import it at build time.
- The static type of a submission is written out by hand once (`SubmissionRequest`
  interface), because a union over every variant does not survive as a useful type; the
  runtime schema remains the stricter check.

## Options considered

- **Hand-written OpenAPI, code generated from it.** Better when several teams consume an
  API in several languages. Here one team owns both ends in one language; generating the
  document from the code removes a step that can be skipped.
- **JSON Schema in the page, validated in the browser only.** Rejected: the server must
  validate anyway, and would need its own copy.
