# The different services are rarely built or deployed together, so they are separated into different Dockerfiles.
# These still run at the top level of the monorepo, as they might depend on shared resources.

FROM node:20-slim AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

FROM base AS build
COPY . /app
WORKDIR /app
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile
RUN pnpm run -r --filter "@vorfahrt-backend/scraper" build
RUN pnpm deploy --filter=scraper --prod /prod/scraper

FROM base
COPY --from=build /prod/scraper /prod/scraper
WORKDIR /prod/scraper
EXPOSE 3000
CMD [ "pnpm", "start" ]