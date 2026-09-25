# Privacy notice: DRAFT for counsel

> **Status: draft, not published, not legal advice.** Written by engineering from what
> the system actually does, so counsel can check the facts and supply the legal
> judgement. Items marked **[CONFIRM]** need a decision. The production build will not
> collect anything until an approved version is published as the site's `/privacy/`
> page ([ADR-0007](../adr/0007-personal-data-in-intake.md)).

## Who we are

Reasoon Limited, trading as Eunice, [registered address — CONFIRM], is the controller of
the personal data described here. Contact: [privacy contact address — CONFIRM, e.g.
privacy@eunice.ai].

## What we collect when you use a form on this site

| You give us | Why | Lawful basis **[CONFIRM]** |
|---|---|---|
| Name, email, company (optional), your message | To reply to your enquiry | Legitimate interests: responding to a business enquiry you started |
| Details for the desk you contacted: the fund or token you mention, the jurisdiction you choose | So the right desk can reply usefully | As above |
| For a job application: a link to your CV or work, and your message | To consider your application | Steps at your request before a possible contract; legitimate interests |

We also record, with your submission:
- **Where on the site you sent it from:** the page, and which button you used.
- **The page that linked you to us (the referrer), and any campaign tags** (`utm_*`)
  in the address you used.

This tells us which parts of the site are useful. It is not used to identify you
anywhere else.

We do not ask for, and ask you not to send, special category data.

## Who handles it

| Recipient | Role | Where |
|---|---|---|
| Our business operations team (enquiries) or hiring team (applications) | Read and reply | UK |
| Amazon Web Services | Hosts the systems that receive and store submissions | London (eu-west-2) |
| Google (Workspace) | Delivers the email that notifies our team; hosts our mailboxes | **[CONFIRM data location under the company's Workspace agreement]** |

Both are existing processors of Eunice under our agreements with them. We do not sell
personal data or share it for marketing.

## How long we keep it

Submissions are deleted automatically **365 days** after we receive them
**[CONFIRM period; the system allows 30–1,095 days]**. The emails notifying our team
stay in our mailboxes under [mailbox retention policy — CONFIRM]. Encrypted backups
are kept for 35 days and then deleted.

## Analytics

We measure how the site is used with Umami, which we run on our own servers: no
analytics company receives data about your visit.
- **No cookies are set**, and nothing is stored on your device to recognise you.
- **Your IP address is not stored.**
- We count page views, and whether a form was opened, started, sent or failed, and from
  which page and button. **We never record what you type into a form.**
- If your browser sends a *Do Not Track* signal, nothing is recorded.

**[CONFIRM]** whether this measurement qualifies for the PECR exemption for
strictly-necessary/analytics storage, given that no information is stored on or read
from the device beyond loading the page.

## Your rights

You can ask us for a copy of your data, or ask us to correct or delete it, restrict or
object to our use of it, or move it. Write to [privacy contact — CONFIRM]. We can delete
everything we hold about an email address, including backups as they expire.

You can also complain to the Information Commissioner's Office (ico.org.uk).

## Security

Data travels encrypted (TLS) at every step: from your browser to us, and from our
systems to our mailboxes. It is stored encrypted, and access is limited to the people
who reply. Our controls are covered by our SOC 2 Type II audit.

## Changes

We will update this page if what we collect or why changes, with the date below.

*Last updated: [date of approval]*

---

### Engineering notes for counsel (not part of the notice)

- Facts above are enforced in code:
  - retention: `services/intake`, purge job;
  - erasure: admin endpoint (runbook `docs/runbooks/operations.md`);
  - no field values in analytics and no cookies: e2e test `e2e/analytics.spec.ts`;
  - TLS to the mail relay required in production: notifier config;
  - admin endpoints not public: edge configuration.
- The data inventory with every storage location is in
  [`docs/analysis/data-model.md`](../analysis/data-model.md).
