# The different services are rarely built or deployed together, so they are separated into different Dockerfiles.
# These still run at the top level of the monorepo, as they might depend on shared resources.

FROM node:20-slim AS base
ENV DB_HOST \
  DB_PORT \
  DB_NAME \
  DB_USER \
  DB_PASSWORD \
  INFLUX_URL \
  INFLUX_TOKEN
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

WORKDIR /app
COPY . .

RUN pnpm install --frozen-lockfile
RUN pnpm build --filter="@vorfahrt/api"

EXPOSE 3000
CMD pnpm start --filter="@vorfahrt/api"