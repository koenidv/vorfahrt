# Vorfahrt's MILES scraper

## setup

1. Setup .npmrc with `@vorfahrt:registry=https://npm.pkg.github.com` and your github token
2. `$ pnpm i`
3. add a `.env` matching `.env.example`
4. local dev: create database vorfahrt on a postgres db and start an influx instance
5. `$ pnpm start --start` or `npm start -- --start` to directly start the scrapers

expected influx buckets (api key without manage permissions):
vorfahrt org:
- `miles` (write, read)
- `system_scraper` (write)

dockerfile uses npm because pnpm wouldn't behave. use `npm i --package-lock-only` then `docker build . --platform linux/arm64/v8`

## options
- --start
- --no-measure
- --use-old-fuel-filters
- --use-dynamic-map-throttling