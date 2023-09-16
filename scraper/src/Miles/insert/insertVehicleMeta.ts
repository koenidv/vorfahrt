import { EntityManager } from "typeorm";
import { RedisClientType } from "@redis/client";
import { VehicleMeta } from "../../entity/Miles/VehicleMeta";
import { VehicleCurrent } from "../../entity/Miles/VehicleCurrent";

export type VehicleMetaProps = {
  milesId: number;
  licensePlate: string;
  color: string;
  imageUrl: string;
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
  meta.milesId = props.milesId;
  meta.licensePlate = props.licensePlate;
  meta.color = props.color;
  meta.imageUrl = props.imageUrl;
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
  await redis.set(`miles:vehicle:${props.milesId}`, id);
}
