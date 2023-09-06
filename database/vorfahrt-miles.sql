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

CREATE TABLE "milesCities"
(
    "id"       integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    "miles_id" varchar     NOT NULL,
    "name"     varchar     NOT NULL,
    "location" point       NOT NULL,
    "added"    timestamptz NOT NULL
);

CREATE TABLE "milesVehicleSizes"
(
    "id"    integer PRIMARY KEY,
    "name"  varchar     NOT NULL,
    "added" timestamptz NOT NULL
);

CREATE TABLE "milesModels"
(
    "id"           integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    "name"         varchar     NOT NULL,
    "size_id"      integer     NOT NULL references "milesVehicleSizes" (id),
    "seats"        integer     NOT NULL,
    "electric"     boolean     NOT NULL,
    "engine_power" integer     NOT NULL,
    "transmission" varchar     NOT NULL,
    "fuel_type"    varchar     NOT NULL,
    "added"        timestamptz NOT NULL
);

CREATE TABLE "milesVehicleMeta"
(
    "id"            integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    "miles_id"      integer     NOT NULL,
    "license_plate" varchar(12) NOT NULL,
    "model_id"      integer     NOT NULL references "milesModels"(id),
    "color"         varchar     NOT NULL,
    "first_city"    integer     NOT NULL,
    "image_url"     varchar     NOT NULL,
    "added"         timestamptz NOT NULL
);

CREATE TABLE "milesVehicleChange"
(
    "id"                  integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    "vehicle_id"          integer     NOT NULL references "milesVehicleMeta"(id),
    "status"              "Status"    NOT NULL,
    "changed"             timestamptz NOT NULL,
    "event"               "EventType" NOT NULL,
    "location"            point,
    "city"                integer references "milesCities"(id),
    "fuel_percent"        integer,
    "range"               integer,
    "price_km"            decimal,
    "price_parking"       decimal,
    "price_unlock"        decimal,
    "discounted"          boolean,
    "charging"            boolean,
    "coverage_gsm"        integer,
    "coverage_satellites" integer
);

CREATE TABLE "milesDamages"
(
    "id"         integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    "vehicle_id" integer     NOT NULL references "milesVehicleMeta"(id),
    "title"      varchar     NOT NULL,
    "damages"    varchar     NOT NULL,
    "added"      timestamptz NOT NULL
);

CREATE TABLE "milesPolygons"
(
    "id"    integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    "data"  polygon     NOT NULL,
    "added" timestamptz NOT NULL
);

CREATE TABLE "milesServiceAreasCurrent"
(
    "id"      integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    "city_id" integer     NOT NULL references "milesCities"(id),
    "polygon" integer     NOT NULL references "milesPolygons"(id),
    "added"   timestamptz NOT NULL
);

CREATE TABLE "milesServiceAreasHistory"
(
    "id"          integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    "area_id"     integer     NOT NULL references "milesCities"(id),
    "data"        integer     NOT NULL references "milesPolygons"(id),
    "valid_until" timestamptz NOT NULL
);

CREATE TABLE "milesNoParkingAreasCurrent"
(
    "id"      integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    "city_id" integer     NOT NULL references "milesCities"(id),
    "polygon" integer     NOT NULL references "milesPolygons"(id),
    "added"   timestamptz NOT NULL
);

CREATE TABLE "milesNoParkingAreasHistory"
(
    "id"          integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    "area_id"     integer     NOT NULL references "milesCities"(id),
    "data"        integer     NOT NULL references "milesPolygons"(id),
    "valid_until" timestamptz NOT NULL
);

CREATE TABLE "milesVehiclesCurrent"
(
    "id"                  integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    "vehicle_id"          integer     NOT NULL references "milesVehicleMeta"(id),
    "status"              "Status"    NOT NULL,
    "location"            point       NOT NULL,
    "city_id"                integer     NOT NULL references "milesCities"(id),
    "fuel_percent"        integer     NOT NULL,
    "range"               integer     NOT NULL,
    "price_base"          decimal     NOT NULL,
    "price_parking"       decimal     NOT NULL,
    "price_unlock"        decimal     NOT NULL,
    "discounted"          boolean     NOT NULL,
    "charging"            boolean     NOT NULL,
    "coverage_gsm"        integer     NOT NULL,
    "coverage_satellites" integer     NOT NULL,
    "deploy_status"       varchar     NOT NULL,
    "last_update"         timestamptz NOT NULL
);

CREATE TABLE "milesPricing"
(
    "id"            integer PRIMARY KEY,
    "size_id"       integer     NOT NULL references "milesVehicleSizes"(id),
    "price_km"      decimal     NOT NULL,
    "price_parking" decimal     NOT NULL,
    "price_unlock"  decimal     NOT NULL,
    "added"         timestamptz NOT NULL
);

CREATE TABLE "milesPricingHistory"
(
    "id"            integer PRIMARY KEY,
    "pricing_id"    integer     NOT NULL references "milesPricing"(id),
    "price_km"      decimal     NOT NULL,
    "price_parking" decimal     NOT NULL,
    "price_unlock"  decimal     NOT NULL,
    "valid_until"   timestamptz NOT NULL
);

CREATE TABLE "milesTariffs"
(
    "id"                  integer PRIMARY KEY,
    "size_id"             integer     NOT NULL references "milesVehicleSizes"(id),
    "duration"            interval    NOT NULL,
    "distance"            integer     NOT NULL,
    "additional_price_km" decimal     NOT NULL,
    "price"               decimal     NOT NULL,
    "added"               timestamptz NOT NULL
);

CREATE TABLE "milesTariffsHistory"
(
    "id"                  integer PRIMARY KEY,
    "tariff_id"           integer     NOT NULL references "milesTariffs"(id),
    "additional_price_km" decimal     NOT NULL,
    "price"               decimal     NOT NULL,
    "valid_until"         timestamptz NOT NULL
);

CREATE TABLE "milesCityToCityPricing"
(
    "id"             integer PRIMARY KEY,
    "size_id"        integer     NOT NULL references "milesVehicleSizes"(id),
    "origin_id"      integer     NOT NULL references "milesCities"(id),
    "destination_id" integer     NOT NULL references "milesCities"(id),
    "price"          decimal     NOT NULL,
    "added"          timestamptz NOT NULL
);

CREATE TABLE "milesCityToCityPricingHistory"
(
    "id"             integer PRIMARY KEY,
    "citytocity_id"  integer     NOT NULL references "milesCityToCityPricing"(id),
    "price"          decimal     NOT NULL,
    "added"          timestamptz NOT NULL
);