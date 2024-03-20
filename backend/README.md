# Vorfahrt backend services

- [**scraper**](./scraper) scrapes data from Miles and stores them in Postgres and Influx. It also includes an trpc api for administration.
- [**api**](./api/) is a caching service in front of the databases, as well as a proxy for realitime database queries.

TypeORM definitions can be found in [/shared](/shared).
