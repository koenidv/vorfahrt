import { EntityManager } from "typeorm";
import { RedisClientType } from "@redis/client";
import { VehicleMeta } from "../../entity/Miles/VehicleMeta";
import { VehicleCurrent } from "../../entity/Miles/VehicleCurrent";
import { apiVehicleJsonParsed } from "@koenidv/abfahrt/dist/src/miles/apiTypes";

export type VehicleMetaProps = {
  apiVehicle: apiVehicleJsonParsed;
  modelId: number;
  firstCityId: number;
  current: VehicleCurrent;
};

export async function insertVehicleMeta(
  manager: EntityManager,
  redis: RedisClientType,
  props: VehicleMetaProps,
): Promise<number> {
  const id = await insertPostgres(manager, props);
  await insertRedis(redis, id, props);
  return id;
}

async function insertPostgres(
  manager: EntityManager,
  props: VehicleMetaProps,
): Promise<number> {
  const meta = new VehicleMeta();
  meta.milesId = props.apiVehicle.idVehicle;
  meta.licensePlate = props.apiVehicle.LicensePlate;
  meta.color = props.apiVehicle.VehicleColor;
  meta.imageUrl = props.apiVehicle.URLVehicleImage;
  meta.isCharity = props.apiVehicle.isCharity;
  meta.modelId = props.modelId;
  meta.firstCityId = props.firstCityId;
  meta.current = props.current;

  const saved = await manager.save(meta);
  return saved.id;
}

async function insertRedis(
  redis: RedisClientType,
  id: number,
  props: VehicleMetaProps,
) {
  await redis.set(`miles:vehicle:${props.apiVehicle.idVehicle}`, id);
}
