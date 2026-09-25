# syntax=docker/dockerfile:1
# One recipe for every service. Build from the repository root:
#   docker build -f services/Dockerfile --build-arg SERVICE=intake .
#
# Stage 1 installs the workspace and bundles the service with the workspace packages it uses.
# Stage 2 is the runtime: production dependencies only, a non-root user, no pnpm, no
# compiler, no source — the bundle, its migrations, and node_modules.
FROM node:24.21.0-slim AS build
ARG SERVICE
ENV COREPACK_ENABLE_DOWNLOAD_PROMPT=0
RUN corepack enable
WORKDIR /repo
COPY . .
RUN test -n "$SERVICE" && pnpm install --frozen-lockfile --filter "@eunice/$SERVICE..."
RUN pnpm --filter "@eunice/$SERVICE" build
# A flat node_modules with only production dependencies, including those of the bundled
# workspace packages (pino, OpenTelemetry), which the bundle imports by name.
RUN pnpm --filter "@eunice/$SERVICE" deploy --prod --config.node-linker=hoisted /out \
 && rm -rf /out/dist /out/migrations \
 && cp -r "services/$SERVICE/dist" "services/$SERVICE/migrations" /out/

FROM node:24.21.0-slim
ENV NODE_ENV=production
WORKDIR /app
COPY --from=build --chown=root:root /out/node_modules ./node_modules
COPY --from=build --chown=root:root /out/package.json ./package.json
COPY --from=build --chown=root:root /out/dist ./dist
COPY --from=build --chown=root:root /out/migrations ./migrations
# Files are root-owned and read-only to the service, which runs as an unprivileged user.
USER node
EXPOSE 3000
HEALTHCHECK --interval=10s --timeout=3s --start-period=10s --retries=3 \
  CMD ["node", "-e", "fetch('http://127.0.0.1:'+(process.env.PORT||3000)+'/healthz').then(r=>process.exit(r.ok?0:1),()=>process.exit(1))"]
CMD ["node", "--enable-source-maps", "dist/main.mjs"]
