FROM node:20-alpine AS builder

ENV DB_HOST \
    DB_PORT \
    DB_USER \
    DB_PASSWORD \
    DB_NAME \
    INFLUX_URL \
    INFLUX_TOKEN

WORKDIR /dist

# install pnpm
RUN curl -f https://get.pnpm.io/v6.16.js | node - add --global pnpm

COPY package.json pnpm-lock.yaml ./
RUN exec sh && pnpm install --frozen-lockfile --prod

COPY . .
RUN exec sh && pnpm run build
RUN exec sh && pnpm prune --production


FROM node:20-alpine

WORKDIR /dist
COPY --from=builder /dist/build build/
COPY --from=builder /dist/node_modules node_modules/
COPY package.json .
EXPOSE 3000
ENV NODE_ENV=production
CMD [ "node", "build" ]


LABEL org.opencontainers.image.source="https://github.com/koenidv/vorfahrt/tree/main/scraper"
LABEL org.opencontainers.image.description="Scraping service for Vorfahrt - A micromobility insight platform."