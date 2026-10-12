# Handover to engineering

The site moves from `angritsay/eunice-site` to Eunice's GitHub organisation, and
engineering takes over deploying it. This page lists what the repository holds, what is
live, what was decided with engineering in October 2026, and what is still open. The
guiding rule: as few moving parts as possible, and a service Eunice already pays for
wherever one fits.

## What is live

Only the static site. `apps/web` builds plain HTML (TypeScript, no framework, our own
`site.js`). `.github/workflows/pages.yml` publishes it to GitHub Pages at
`https://angritsay.github.io/eunice-site/`, with a preview per pull request. `eunice.ai`
still points at the old Framer site.

The "Book demo" / "Talk to us" form opens the visitor's mail app, addressed to
`inquiries@eunice.ai`. Nothing is collected on our side. No analytics runs and no cookie
is set.

## Decided (October 2026, with Vinay)

| Topic | Decision | Where |
|---|---|---|
| Hosting | AWS: S3 + CloudFront, in Terraform with a shared module and staging and prod environments. DNS stays in `eunice-infrastructure`. The Terraform here is a first draft for engineering to take over | [`infra/terraform/`](../infra/terraform/README.md), [ADR-0014](adr/0014-static-site-on-aws.md) |
| Deploys | main → staging after CI passes; production by hand from main. PR previews stay on GitHub Pages | `.github/workflows/deploy.yml` |
| Backend | The never-deployed services (intake, notifier, queue, Postgres, Caddy, EC2) are removed. The last commit that had them is `02e84bd` | ADR-0014 |
| Analytics | Google Analytics 4, probably a new property. Loads only after the visitor accepts the built-in cookie banner | [ADR-0013](adr/0013-analytics-google-analytics-with-consent.md) |
| Consent | The built-in banner is enough | ADR-0013 |
| Privacy notice | Reuse the existing policy at `/privacy-policy/`; it does not block deploying. Chrislyn or Ana to check it covers GA (and the form, once it posts somewhere) | The production build checks that page exists before it allows a form endpoint or analytics |
| Repository | Moves to the Eunice organisation later; Vinay sets up access | — |
| Blog | Posts stay as files in `apps/web/src/content/posts/`; no CMS for now | — |

## Open: the demo form into Attio

Eunice uses Attio as its CRM, so the form should land there. Attio's API needs a secret
key, so the page cannot call it directly: something small has to sit between them.

**Proposal**

1. An AWS Lambda (Node) behind the same CloudFront distribution at `/api/inquiry`, so the
   page posts to its own origin and the CSP needs no new entry. The Attio key sits in
   Secrets Manager.
2. It checks the submission against the form's schema (`packages/contracts`, already
   shared with the site), drops bots (the hidden `website` field, a minimum time on the
   form, a per-IP rate limit; AWS WAF if spam arrives anyway).
3. It writes to Attio:
   - the person, found or created by email
     (`PUT /v2/objects/people/records?matching_attribute=email_addresses`);
   - a note on that person with the message, the page, the referrer and the UTM tags
     (`POST /v2/notes`);
   - optionally an entry in an "Inbound" list, so the desk sees new leads in one place.
4. Someone hears about it: an Attio workflow on the new list entry, or an email from the
   Lambda through SES.

The site already sends what this needs: `site.js` posts JSON (fields, page, referrer, UTM,
the honeypot, time on form) to `PUBLIC_FORM_ENDPOINT` and falls back to email when it is
unset. Turning it on is one build variable once the endpoint exists.

**To decide:** whether to use an Attio list for inbound leads (and which), who is
notified and how, and whether the Lambda lives in this repository's Terraform or in
`eunice-infrastructure`. Until then the form keeps opening the visitor's mail app.

## Also open

| Question | Notes |
|---|---|
| GA property | Create it, then set `GA_MEASUREMENT_ID` on the `staging` and `production` GitHub environments (`infra/terraform/README.md`) |
| Required checks | CI no longer has the Services, System or Deploy config jobs. If the `main` ruleset lists them as required, replace them with Terraform and the two remaining jobs |
| `github.io` copy | Once `eunice.ai` serves the site, keep Pages for previews only, so search engines do not see duplicates |

## Also worth knowing

- **Content-Security-Policy.** GitHub Pages cannot send headers, so the current copy has
  none. On AWS, CloudFront sends a strict one (`infra/terraform/modules/static-site/main.tf`):
  only the site's own files, plus Google Analytics.
- **Editing.** Content and page copy rules are in [../CLAUDE.md](../CLAUDE.md), the voice
  in [brand/tone-of-voice.md](brand/tone-of-voice.md), the design in
  [brand/design-system.md](brand/design-system.md), motion in
  [brand/motion.md](brand/motion.md), and the contribution flow in
  [../CONTRIBUTING.md](../CONTRIBUTING.md). Contributors' Claude follows the
  `eunice-site` skill; `eunice-review` gives the reviewer a first pass.
