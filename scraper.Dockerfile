# The different services are rarely built or deployed together, so they are separated into different Dockerfiles.
# These still run at the top level of the monorepo, as they might depend on shared resources.

FROM node:20-slim AS base
ENV HOSTNAME \
  DB_HOST \
  DB_PORT \
  DB_USER \
  DB_PASSWORD \
  DB_NAME \
  INFLUX_URL \
  INFLUX_TOKEN \
  RPM_VEHICLE \
  RPM_MAP \
  RPM_CITIES \
  RPM_PERCENTAGES \
  INTERVAL_QUEUE_SYNC \
  RESTORE_FROM_SYNC
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

FROM base AS build
COPY . /app
WORKDIR /app
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile
RUN pnpm run -r --filter "@vorfahrt/scraper" build
RUN pnpm \
  --config.shamefully-hoist=true \
  --config.hoist=true \
  --config.node-linker=isolated \
  --config.symlinks=false \
  --config.shared-workspace-lockfile=false \
  deploy --filter=scraper --prod /prod/scraper

FROM base
COPY --from=build /prod/scraper /prod/scraper
WORKDIR /prod/scraper
EXPOSE 3000
EXPOSE 3001
CMD [ "pnpm", "start" ]