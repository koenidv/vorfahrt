import { EntityManager, Point } from "typeorm";
import { RedisClientType } from "@redis/client";
import { MilesVehicleStatus } from "@koenidv/abfahrt";
import { VehicleCurrent } from "../../entity/Miles/VehicleCurrent";
import { createPoint } from "./parsePoint";
import { VehicleMeta } from "../../entity/Miles/VehicleMeta";

export type VehicleCurrentProps = {
  meta: VehicleMeta;
  milesId: number;
  status: typeof MilesVehicleStatus;
  lat: number;
  lng: number;
  fuelPercent: number;
  range: number;
  pricePreBooking: number;
  charging: boolean;
  coverageGsm: number;
  coverageSatellites: number;
  cityId: number;
  pricingId: number;
};

export async function insertVehicleCurrent(
  manager: EntityManager,
  redis: RedisClientType,
  props: VehicleCurrentProps,
): Promise<number> {
  const id = await insertPostgres(manager, props);
  await insertRedis(redis, props);
  return id;
}

async function insertPostgres(
  manager: EntityManager,
  props: VehicleCurrentProps,
): Promise<number> {
  const current = new VehicleCurrent();
  current.status = props.status;
  current.location = createPoint({ lat: props.lat, lng: props.lng });
  current.fuelPercent = props.fuelPercent;
  current.range = props.range;
  current.pricePreBooking = props.pricePreBooking;
  current.charging = props.charging;
  current.coverageGsm = props.coverageGsm;
  current.coverageSatellites = props.coverageSatellites;
  current.cityId = props.cityId;
  current.pricingId = props.pricingId;

  const saved = await manager.save(current);
  return saved.id;
}

async function insertRedis(
  redis: RedisClientType,
  props: VehicleCurrentProps,
) {
  await redis.hSet(`miles:vehicle:${props.milesId}`, {
    status: props.status.toString(),
    location: createPoint({ lat: props.lat, lng: props.lng }),
    fuelPercent: props.fuelPercent.toString(),
    range: props.range.toString(),
    pricePreBooking: props.pricePreBooking.toString(),
    charging: props.charging.toString(),
    coverageGsm: props.coverageGsm.toString(),
    coverageSatellites: props.coverageSatellites.toString(),
    cityId: props.cityId.toString(),
    pricingId: props.pricingId.toString(),
  });

}
