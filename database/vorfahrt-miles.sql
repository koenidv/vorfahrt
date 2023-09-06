CREATE TYPE "EventType" AS ENUM (
  'booked',
  'ride_started',
  'ride_paused',
  'ride_resumed',
  'ride_refueled',
  'ride_ended',
  'charging_started',
  'charging_ended',
  'disappear',
  'return',
  'add',
  'change'
);

CREATE TYPE "Status" AS ENUM (
  'DEPLOYED_FOR_RENTAL',
  'BOOKED_BY_USER',
  'USER_IN_RIDE',
  'PAUSED_BY_USER',
  'IN_OPS',
  'CAR_SUBSCRIPTION',
  'AT_MILES_VRC',
  'AT_MOSTKI_VRC',
  'IN_LOGISTICS',
  'UPFITTING',
  'DOWNFITTING',
  'DOWNFITTED',
  'RETIRED'
);

CREATE TABLE "milesModels" (
  "id" integer PRIMARY KEY,
  "name" varchar NOT NULL,
  "size" integer NOT NULL,
  "seats" integer NOT NULL,
  "electric" boolean NOT NULL,
  "engine_power" integer NOT NULL,
  "transmission" varchar NOT NULL,
  "fuel_type" varchar NOT NULL,
  "added" timestamptz NOT NULL
);

CREATE TABLE "milesVehicleMeta" (
  "id" integer PRIMARY KEY,
  "miles_id" integer NOT NULL,
  "license_plate" varchar(12) NOT NULL,
  "model_id" integer NOT NULL,
  "color" varchar NOT NULL,
  "first_city" integer NOT NULL,
  "image_url" varchar NOT NULL,
  "added" timestamptz NOT NULL
);

CREATE TABLE "milesVehicleChange" (
  "id" integer PRIMARY KEY,
  "vehicle_id" integer NOT NULL,
  "status" "Status" NOT NULL,
  "changed" timestamptz NOT NULL,
  "event" "EventType" NOT NULL,
  "location" point,
  "city" integer,
  "fuel_percent" integer,
  "range" integer,
  "price_km" decimal,
  "price_parking" decimal,
  "price_unlock" decimal,
  "discounted" boolean,
  "charging" boolean,
  "coverage_gsm" integer,
  "coverage_satellites" integer
);

CREATE TABLE "milesDamages" (
  "id" integer PRIMARY KEY,
  "vehicle_id" integer NOT NULL,
  "title" varchar NOT NULL,
  "damages" varchar NOT NULL,
  "added" timestamptz NOT NULL
);

CREATE TABLE "milesCity" (
  "id" integer PRIMARY KEY,
  "miles_id" varchar NOT NULL,
  "name" varchar NOT NULL,
  "location" point NOT NULL,
  "added" timestamptz NOT NULL
);

CREATE TABLE "milesServiceAreasCurrent" (
  "id" integer PRIMARY KEY,
  "city_id" integer NOT NULL,
  "polygon" integer NOT NULL,
  "added" timestamptz NOT NULL
);

CREATE TABLE "milesServiceAreasHistory" (
  "id" integer PRIMARY KEY,
  "area_id" integer NOT NULL,
  "data" integer NOT NULL,
  "valid_until" timestamptz NOT NULL
);

CREATE TABLE "milesNoParkingAreasCurrent" (
  "id" integer PRIMARY KEY,
  "city_id" integer NOT NULL,
  "polygon" integer NOT NULL,
  "added" timestamptz NOT NULL
);

CREATE TABLE "milesNoParkingAreasHistory" (
  "id" integer PRIMARY KEY,
  "area_id" integer NOT NULL,
  "data" integer NOT NULL,
  "valid_until" timestamptz NOT NULL
);

CREATE TABLE "milesPolygons" (
  "id" integer PRIMARY KEY,
  "data" polygon NOT NULL,
  "added" timestamptz NOT NULL
);

CREATE TABLE "milesVehiclesCurrent" (
  "vehicle_id" integer NOT NULL,
  "status" "Status" NOT NULL,
  "location" point NOT NULL,
  "city" integer NOT NULL,
  "fuel_percent" integer NOT NULL,
  "range" integer NOT NULL,
  "price_base" decimal NOT NULL,
  "price_parking" decimal NOT NULL,
  "price_unlock" decimal NOT NULL,
  "discounted" boolean NOT NULL,
  "charging" boolean NOT NULL,
  "coverage_gsm" integer NOT NULL,
  "coverage_satellites" integer NOT NULL,
  "deploy_status" varchar NOT NULL,
  "last_update" timestamptz NOT NULL
);

CREATE TABLE "milesVehicleSizes" (
  "id" integer PRIMARY KEY,
  "name" varchar NOT NULL,
  "added" timestamptz NOT NULL
);

CREATE TABLE "milesPricing" (
  "id" integer PRIMARY KEY,
  "size_id" integer NOT NULL,
  "price_km" decimal NOT NULL,
  "price_parking" decimal NOT NULL,
  "price_unlock" decimal NOT NULL,
  "added" timestamptz NOT NULL
);

CREATE TABLE "milesPricingHistory" (
  "id" integer PRIMARY KEY,
  "pricing_id" integer NOT NULL,
  "price_km" decimal NOT NULL,
  "price_parking" decimal NOT NULL,
  "price_unlock" decimal NOT NULL,
  "valid_until" timestamptz NOT NULL
);

CREATE TABLE "milesTariffs" (
  "id" integer PRIMARY KEY,
  "size_id" integer NOT NULL,
  "duration" interval NOT NULL,
  "distance" integer NOT NULL,
  "additional_price_km" decimal NOT NULL,
  "price" decimal NOT NULL,
  "added" timestamptz NOT NULL
);

CREATE TABLE "milesTariffsHistory" (
  "id" integer PRIMARY KEY,
  "tariff_id" integer NOT NULL,
  "duration" interval NOT NULL,
  "distance" integer NOT NULL,
  "additional_price_km" decimal NOT NULL,
  "price" decimal NOT NULL,
  "valid_until" timestamptz NOT NULL
);

CREATE TABLE "milesCityToCityPricing" (
  "id" integer PRIMARY KEY,
  "size_id" integer NOT NULL,
  "origin_id" integer NOT NULL,
  "destination_id" integer NOT NULL,
  "price" decimal NOT NULL,
  "added" timestamptz NOT NULL
);

CREATE TABLE "milesCityToCityPricingHistory" (
  "id" integer PRIMARY KEY,
  "citytocity_id" integer NOT NULL,
  "origin_id" integer NOT NULL,
  "destination_id" integer NOT NULL,
  "price" decimal NOT NULL,
  "added" timestamptz NOT NULL
);

CREATE INDEX ON "milesModels" ("electric");

CREATE INDEX ON "milesModels" ("size");

CREATE INDEX ON "milesVehicleMeta" ("license_plate");

CREATE INDEX ON "milesVehicleMeta" ("model_id");

CREATE INDEX ON "milesVehicleChange" ("event");

CREATE INDEX ON "milesVehicleChange" ("changed");

ALTER TABLE "milesVehicleMeta" ADD FOREIGN KEY ("model_id") REFERENCES "milesModels" ("id");

ALTER TABLE "milesVehicleChange" ADD FOREIGN KEY ("vehicle_id") REFERENCES "milesVehicleMeta" ("id");

ALTER TABLE "milesDamages" ADD FOREIGN KEY ("vehicle_id") REFERENCES "milesVehicleMeta" ("id");

ALTER TABLE "milesVehicleMeta" ADD FOREIGN KEY ("first_city") REFERENCES "milesCity" ("id");

ALTER TABLE "milesVehicleChange" ADD FOREIGN KEY ("city") REFERENCES "milesCity" ("id");

ALTER TABLE "milesVehicleMeta" ADD FOREIGN KEY ("id") REFERENCES "milesVehiclesCurrent" ("vehicle_id");

ALTER TABLE "milesModels" ADD FOREIGN KEY ("size") REFERENCES "milesVehicleSizes" ("id");

ALTER TABLE "milesNoParkingAreasCurrent" ADD FOREIGN KEY ("city_id") REFERENCES "milesCity" ("id");

ALTER TABLE "milesServiceAreasCurrent" ADD FOREIGN KEY ("city_id") REFERENCES "milesCity" ("id");

ALTER TABLE "milesServiceAreasHistory" ADD FOREIGN KEY ("area_id") REFERENCES "milesServiceAreasCurrent" ("id");

ALTER TABLE "milesNoParkingAreasHistory" ADD FOREIGN KEY ("area_id") REFERENCES "milesNoParkingAreasCurrent" ("id");

ALTER TABLE "milesServiceAreasCurrent" ADD FOREIGN KEY ("polygon") REFERENCES "milesPolygons" ("id");

ALTER TABLE "milesServiceAreasHistory" ADD FOREIGN KEY ("data") REFERENCES "milesPolygons" ("id");

ALTER TABLE "milesNoParkingAreasCurrent" ADD FOREIGN KEY ("polygon") REFERENCES "milesPolygons" ("id");

ALTER TABLE "milesNoParkingAreasHistory" ADD FOREIGN KEY ("data") REFERENCES "milesPolygons" ("id");

ALTER TABLE "milesPricing" ADD FOREIGN KEY ("size_id") REFERENCES "milesVehicleSizes" ("id");

ALTER TABLE "milesPricingHistory" ADD FOREIGN KEY ("pricing_id") REFERENCES "milesPricing" ("id");

ALTER TABLE "milesTariffs" ADD FOREIGN KEY ("size_id") REFERENCES "milesVehicleSizes" ("id");

ALTER TABLE "milesTariffsHistory" ADD FOREIGN KEY ("tariff_id") REFERENCES "milesTariffs" ("id");

ALTER TABLE "milesCityToCityPricing" ADD FOREIGN KEY ("size_id") REFERENCES "milesVehicleSizes" ("id");

ALTER TABLE "milesCityToCityPricing" ADD FOREIGN KEY ("origin_id") REFERENCES "milesCity" ("id");

ALTER TABLE "milesCityToCityPricing" ADD FOREIGN KEY ("destination_id") REFERENCES "milesCity" ("id");

ALTER TABLE "milesCityToCityPricingHistory" ADD FOREIGN KEY ("citytocity_id") REFERENCES "milesCityToCityPricing" ("id");
