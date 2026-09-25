# syntax=docker/dockerfile:1
# Build from the repository root: docker build -f services/intake/Dockerfile .
#
# Stage 1 installs the workspace and bundles intake with the workspace packages it uses.
# Stage 2 is the runtime: production dependencies only, a non-root user, no pnpm, no
# compiler, no source — the bundle, its migrations, and node_modules.
FROM node:24.21.0-slim AS build
ENV COREPACK_ENABLE_DOWNLOAD_PROMPT=0
RUN corepack enable
WORKDIR /repo
COPY . .
RUN pnpm install --frozen-lockfile --filter @eunice/intake...
RUN pnpm --filter @eunice/intake build
# A flat node_modules with only production dependencies, including those of the bundled
# workspace packages (pino, OpenTelemetry), which the bundle imports by name.
RUN pnpm --filter @eunice/intake deploy --prod --config.node-linker=hoisted /out

FROM node:24.21.0-slim
ENV NODE_ENV=production
WORKDIR /app
COPY --from=build --chown=root:root /out/node_modules ./node_modules
COPY --from=build --chown=root:root /out/package.json ./package.json
COPY --from=build --chown=root:root /repo/services/intake/dist ./dist
COPY --from=build --chown=root:root /repo/services/intake/migrations ./migrations
# Files are root-owned and read-only to the service, which runs as an unprivileged user.
USER node
EXPOSE 3000
HEALTHCHECK --interval=10s --timeout=3s --start-period=10s --retries=3 \
  CMD ["node", "-e", "fetch('http://127.0.0.1:'+(process.env.PORT||3000)+'/healthz').then(r=>process.exit(r.ok?0:1),()=>process.exit(1))"]
CMD ["node", "--enable-source-maps", "dist/main.mjs"]
