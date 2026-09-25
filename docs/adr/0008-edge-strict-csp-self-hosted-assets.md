# 8. One edge, a strict Content Security Policy, everything self-hosted

- Status: Accepted
- Date: 2026-09-25

## Context

A page that collects personal data should not run code from anywhere but its own origin.
The old site loaded fonts from Google (a third party that sees every visitor's address)
and would have needed `unsafe-inline` for its inline configuration script.

## Decision

- **Fonts are self-hosted** (`apps/web/src/assets/fonts/`, with their OFL licences) and
  preloaded. No request leaves our origin to render a page.
- **Page configuration is JSON** in `<script type="application/json">`, which the browser
  never executes, so it needs no CSP exception. The site has no inline scripts or styles.
- **The edge sets the policy:**
  `default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data:;
  font-src 'self'; connect-src 'self'; object-src 'none'; base-uri 'self';
  form-action 'self'; frame-ancestors 'none'`, with HSTS, `nosniff`, a strict referrer
  policy and a restrictive permissions policy. The end-to-end tests fail on any CSP
  violation in the console.
- **Caddy** is the edge locally (`infra/caddy/Caddyfile`): the site and
  `/api/intake/*` on one origin, so the browser needs no CORS locally, and Caddy replaces
  any client-sent `X-Forwarded-For`, so intake can trust it for the rate limit.
  intake still enforces an origin allow-list for production, where the site (GitHub
  Pages) and the API are on different origins.

## Consequences

- Adding a third-party script or style becomes a visible change to the policy, not a
  one-line tag.
- GitHub Pages cannot set response headers. Until the site moves behind our edge in
  production, the same policy has to be delivered as a `<meta>` tag (go-live change).
