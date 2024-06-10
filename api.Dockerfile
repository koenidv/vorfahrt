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

FROM base AS build
COPY . /app
WORKDIR /app
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile
RUN pnpm run -r --filter "@vorfahrt/api" build
RUN pnpm deploy --filter=api --prod /prod/api

FROM base
COPY --from=build /prod/api /prod/api
WORKDIR /prod/api
EXPOSE 3000
CMD [ "pnpm", "start" ]