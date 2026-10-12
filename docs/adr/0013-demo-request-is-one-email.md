# 13. A demo request is one work email, sent from the page

- Status: Accepted
- Date: 2026-10-12
- Amends: the field list in [ADR-0005](0005-contracts-first-one-form-registry.md) and
  "collect little" in [ADR-0007](0007-personal-data-in-intake.md)

## Context

Every "Book demo" opened a dialog that asked a name, a work email and a note before
anything was sent. The owner wants a visitor to be able to ask for a demo with as little
work as possible: type an email, press the button, and the desk hears about it.

## Decision

**The demo forms need only the work email.** The `general`, `private-markets` and
`digital-assets` variants also offer the name, and `digital-assets` a note, both marked
"(optional)". The white paper and sample report forms still require a name, because the
desk has to address what it sends back. Every field that is not required is labelled
"(optional)".

**The closing "Book demo" on a page is a single line** (`demoAsk()` in
`components.ts`): an email field and the button. `site.js` sends it as it stands — no
dialog — and thanks the visitor in place. The hero and menu buttons still open the
dialog, which for a demo holds the name (optional) and the email.

**The name is optional end to end.** The submission event (`contact.name`), intake's
domain and table (`0005_name_optional.sql` drops `not null`) and the notifier accept a
lead without one. The email to ops then names the lead by their address, and the reply
goes to that address.

**Collection still waits for go-live.** Nothing here sets a form endpoint. Until the
privacy page is published and `PUBLIC_FORM_ENDPOINT` is set (ADR-0007), the line hands
the request to the visitor's own mail app, addressed to `contactEmail`, as the dialog
does.

## Consequences

- A demo lead arrives with less to go on: ops replies to an address, and learns the
  name and the fund on the call. The page, button and audience still travel with it.
- We hold less personal data per lead, which keeps ADR-0007's "collect little" true.
- Bots meet the same defences: the honeypot stays on the dialog, and intake's minimum
  time and per-address rate limit apply to the line as well.
