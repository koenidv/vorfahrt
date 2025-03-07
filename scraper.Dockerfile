# The different services are rarely built or deployed together, so they are separated into different Dockerfiles.
# These still run at the top level of the monorepo, as they might depend on shared resources.

FROM node:23-slim

ENV HOSTNAME=docker
ENV DB_HOST=postgres
ENV DB_PORT=5432
ENV DB_USER=postgres
ENV DB_PASSWORD=postgres
ENV DB_NAME=vorfahrt
ENV RPM_VEHICLE=60
ENV RPM_MAP=60
ENV INFLUX_URL=http://influxdb:8086
ARG SCRAPE_SINGLE_CITY_ID

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

WORKDIR /app
COPY . .

RUN pnpm install --frozen-lockfile
RUN pnpm build --filter="@vorfahrt/scraper"

WORKDIR /app/backend/scraper
ENTRYPOINT [ "pnpm", "start" ]