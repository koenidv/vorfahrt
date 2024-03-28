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
COPY . /app
WORKDIR /app

FROM base AS prod-deps
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --prod --frozen-lockfile

FROM base AS build
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile
RUN pnpm run build

FROM base
COPY --from=prod-deps /app/node_modules /app/node_modules
COPY --from=build /app/build/src /app/build
EXPOSE 3000
ENV NODE_ENV=production
CMD [ "node", "build", "--start" ]


LABEL org.opencontainers.image.source="https://github.com/koenidv/vorfahrt/tree/main/scraper"
LABEL org.opencontainers.image.description="Scraping service for Vorfahrt - A micromobility insight platform."