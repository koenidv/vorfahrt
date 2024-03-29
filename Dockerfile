FROM node:20-slim AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

FROM base AS build
COPY . /app
WORKDIR /app
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile
RUN pnpm run -r --filter "@vorfahrt-backend/*" build
RUN pnpm deploy --filter=scraper --prod /prod/scraper
RUN rm -rf /app/node_modules/bcrypt_tmp_*
RUN pnpm deploy --filter=api --prod /prod/api

FROM base AS scraper
COPY --from=build /prod/scraper /prod/scraper
WORKDIR /prod/scraper
EXPOSE 3000
CMD [ "pnpm", "start" ]

FROM base AS api
COPY --from=build /prod/api /prod/api
WORKDIR /prod/api
EXPOSE 8000
CMD [ "pnpm", "start" ]