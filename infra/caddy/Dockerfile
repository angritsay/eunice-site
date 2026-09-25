# syntax=docker/dockerfile:1
# The site behind the local edge. Build from the repository root:
#   docker build -f infra/caddy/Dockerfile .
# The site is built for SITE_ENV=local with the form pointed at intake through this edge;
# the production build (GitHub Pages) is unaffected.
FROM node:24.21.0-slim AS site
ENV COREPACK_ENABLE_DOWNLOAD_PROMPT=0
RUN corepack enable
WORKDIR /repo
COPY . .
RUN pnpm install --frozen-lockfile --filter @eunice/web...
ARG PUBLIC_FORM_ENDPOINT=/api/intake/v1/submissions
RUN SITE_ENV=local PUBLIC_FORM_ENDPOINT=$PUBLIC_FORM_ENDPOINT pnpm --filter @eunice/web build

FROM caddy:2.10.2-alpine
COPY infra/caddy/Caddyfile /etc/caddy/Caddyfile
COPY --from=site /repo/apps/web/dist /srv
