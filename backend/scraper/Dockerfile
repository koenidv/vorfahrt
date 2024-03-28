FROM node:20-slim AS builder

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

WORKDIR /dist

COPY package.json package-lock.json ./
COPY *.npmrc ../../*.npmrc ./
RUN npm ci

COPY . .
RUN npm run build
RUN npm prune --production


FROM node:20-slim

WORKDIR /dist
COPY --from=builder /dist/build/src build/
COPY --from=builder /dist/node_modules node_modules/
COPY package.json .
EXPOSE 3000
ENV NODE_ENV=production
CMD [ "node", "build", "--start" ]


LABEL org.opencontainers.image.source="https://github.com/koenidv/vorfahrt/tree/main/scraper"
LABEL org.opencontainers.image.description="Scraping service for Vorfahrt - A micromobility insight platform."