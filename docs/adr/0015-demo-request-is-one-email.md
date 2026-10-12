# 15. A demo request is one work email, sent from the page

- Status: Accepted
- Date: 2026-10-12
- Amends: the field list in [ADR-0005](0005-contracts-first-one-form-registry.md)

## Context

Every "Book demo" opened a dialog that asked a name, a work email and a note before
anything was sent. The owner wants a visitor to be able to ask for a demo with as little
work as possible: type an email, press the button, and the desk hears about it.

## Decision

**The demo forms need only the work email.** The `general`, `private-markets` and
`digital-assets` variants in `@eunice/contracts` also offer the name, and `digital-assets`
a note, both marked "(optional)". The white paper and sample report forms still require a
name, because the desk has to address what it sends back. Every field that is not
required is labelled "(optional)". The demo dialog is headed "Talk to Us".

**Every page closes with a single line for it** (`demoAsk()` through `cta()` in
`components.ts`): an email field and "Book demo" in the desk's colour, centred on white.
`site.js` sends it as it stands — no dialog — and thanks the visitor in place. The hero
and menu buttons still open the dialog. Token Disclosure's own form is the white paper,
so its pages ask for a demo through the general form, in the desk's gold. Careers and the
role pages leave the demo out: applications never go through a form on this site.

**Nothing is collected until there is a receiver.** As [ADR-0014](0014-static-site-on-aws.md)
leaves it, no form endpoint is set: the line, like the dialog, hands the request to the
visitor's own mail app, addressed to `contactEmail`. Whatever receives submissions later
validates them against the same variants, so it must accept a demo request with no name.

## Consequences

- A demo lead arrives with less to go on: the desk replies to an address and learns the
  name and the fund on the call. The page, button and audience still travel with it.
- Less personal data per lead, in keeping with "collect little".
