FROM node:20-slim AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

FROM base AS build
COPY . /app
WORKDIR /app
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile
RUN pnpm run -r build
RUN pnpm deploy --filter=scraper --prod /prod/scraper
RUN pnpm deploy --filter=api --prod /prod/api

FROM base
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

COPY --from=build /prod/scraper /prod/scraper
COPY --from=build /pnpm/store /pnpm/store
WORKDIR /prod/scraper
EXPOSE 3000
EXPOSE 3001
CMD [ "pnpm", "start" ]