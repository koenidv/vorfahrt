FROM node:20-slim AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

FROM base AS build
COPY . /app
WORKDIR /app
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile
RUN pnpm run -r --filter "@vorfahrt-backend/*" build

# deploying multiple services in the same layer didn't work due to external postinstall scripts
# thus they're deployed in separate layers
FROM base as deploy-scraper
COPY --from=build . .
RUN pnpm deploy --filter=scraper --prod /prod/scraper

FROM base as deploy-api
COPY --from=build . .
RUN pnpm deploy --filter=api --prod /prod/api

FROM base AS scraper
COPY --from=deploy-scraper /prod/scraper /prod/scraper
WORKDIR /prod/scraper
EXPOSE 3000
CMD [ "pnpm", "start" ]

FROM base AS api
COPY --from=deploy-api /prod/api /prod/api
WORKDIR /prod/api
EXPOSE 8000
CMD [ "pnpm", "start" ]