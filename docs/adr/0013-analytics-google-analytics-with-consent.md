# 13. Analytics: Google Analytics 4, loaded only after cookie consent

- Status: Accepted
- Date: 2026-10-12
- Supersedes: [ADR-0010](0010-analytics-self-hosted-umami.md)

## Context

The site moves to Eunice's own GitHub organisation, and engineering takes over running it.
Their rule for the move: as few moving parts as possible, and a third-party service the
company already pays for wherever one fits, so there is nothing of ours to deploy, patch
or back up. Self-hosted Umami (ADR-0010) needs a container, a database schema, a
bootstrap job and an edge route, and it was never deployed. Eunice already uses Google
Analytics, so it adds no new sub-processor.

## Decision

**Google Analytics 4, in Eunice's own property, loaded only after the visitor accepts a
cookie banner.**

- **Off by default.** The build adds analytics only when `PUBLIC_GA_MEASUREMENT_ID` is set
  (a `G-…` id; anything else fails the build). Without it no banner is shown and nothing
  from Google is referenced, which `forms.spec.ts` checks.
- **Consent first.** GA sets cookies, so it is not exempt the way cookieless Umami was
  meant to be. A bar at the foot of the page asks once (Accept / Decline). Until Accept,
  `site.js` loads nothing from Google and sets no cookie. The choice is kept in
  `localStorage` on that device, and a "Cookies" link in the footer brings the bar back,
  so withdrawing consent is as easy as giving it (GDPR Art. 7(3)).
- **The same five events.** `form_open`, `form_start`, `form_submit`, `form_success` and
  `form_error`, each with the entry point (`variant`, `page`, `placement`, `audience`,
  `entry`), now sent with `gtag('event', …)`. **Never what was typed.**
- **The privacy gate stays.** A production build with analytics on still needs the
  approved privacy page ([ADR-0007](0007-personal-data-in-intake.md)), which must now
  name Google Analytics and its cookies.
- **One exception to "our own JavaScript only".** gtag.js is the only third-party script
  the site loads, and only after consent.

Umami is removed: its containers in both compose files, its bootstrap, its schema and
role, its edge routes, its configuration and secrets, and its end-to-end test.

## Options considered

| Option | Why not |
|---|---|
| Keep self-hosted Umami | Cookieless and private, but it is infrastructure to run, and nobody owns it after the move |
| Google Analytics with no banner | GA sets cookies; without consent that is not lawful in the UK and EU |
| Consent Mode "cookieless pings" before consent | Sends data to Google before the visitor has chosen; harder to explain in the privacy notice |
| A paid consent platform | Not needed for one service; can replace the bar later if Eunice already pays for one |

## Consequences

- Visitors who decline are not counted, so the numbers are a floor.
- A Content Security Policy, if the new host adds one, must allow
  `https://www.googletagmanager.com` (script) and `https://*.google-analytics.com`
  (connect).
- The funnel is built in GA's Explore view: see
  [runbooks/analytics-funnel.md](../runbooks/analytics-funnel.md).
- Going live: create or pick the GA4 property, set the measurement id on the Pages
  build, publish the approved privacy notice.
