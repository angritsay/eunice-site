# Use cases

## UC-1 Ask a desk a question

**Actor:** a visitor on a desk or client-type page. **Goal:** reach the right desk with
enough context to get a useful reply.

1. The visitor presses a call to action. Its position on the page (hero, band, closing,
   nav, footer) is the *placement*.
2. The form opens with that desk's title, lead text and fields: the fund for Private
   Markets, the token for Digital Assets, token and jurisdiction for Token Disclosure.
3. The visitor fills it in and sends it.
4. The system confirms it and says when to expect a reply.
5. Business operations receives an email:
   `[<desk> · <audience> · <placement>] <name> — <company>`, and replies to the visitor.

**Alternatives.** 3a: a field is invalid. The form marks it and nothing is stored.
3b: the connection fails. The form shows the desk's email address instead. 3c: the
visitor sends twice. One lead is stored and one email goes out.
**Postcondition.** The lead is stored with its entry point and attribution, and is
deleted after the retention period.

## UC-2 Apply for a role

**Actor:** a candidate on the careers page. As UC-1, except:
- the form asks for an https link to a CV or work, and why regulated finance;
- the email goes to the hiring inbox, and its subject names the role.

## UC-3 Request a sample report

**Actor:** a visitor on Digital Assets. As UC-1, with the `sample-report` variant: no
extra fields, and the desk replies with the redacted report.

## UC-4 Reply to a lead

**Actor:** business operations. **Goal:** answer within one working day.

1. The ops inbox receives the email: desk, entry point, every field, the page as a
   link, referrer and campaign, and a submission id.
2. Ops presses Reply. The reply goes to the visitor, because Reply-To is the lead.

## UC-5 Erase a person's data

**Actor:** operator, on the internal network. **Trigger:** a request under GDPR Art. 17.
1. The operator calls `POST /v1/admin/erasures` with the address and the admin token.
2. Every submission, and any unpublished event, for that address is deleted. The
   response gives the count.
3. The operator clears the emails in the ops and hiring inboxes (outside the system).

## UC-6 Read the funnel

**Actor:** marketing or leadership. **Goal:** see which entry points produce leads.
Umami → Reports → Funnel `form_open → form_start → form_submit → form_success`, filtered by
`entry`, `variant` or `placement` ([runbook](../runbooks/analytics-funnel.md)).
