import { EntityManager } from "typeorm";
import { RedisClientType } from "@redis/client";
import { VehicleMeta } from "../../entity/Miles/VehicleMeta";
import { City } from "../../entity/Miles/City";
import { VehicleModel } from "../../entity/Miles/VehicleModel";

export type VehicleMetaProps = {
  name: string;
  seats: number;
  electric: boolean;
  enginePower: number;
  transmission: string;
  fuelType: string;
  sizeId: number;
};

export async function insertVehicleModel(
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
  const model = new VehicleModel();
  model.name = props.name;
  model.seats = props.seats;
  model.electric = props.electric;
  model.enginePower = props.enginePower;
  model.transmission = props.transmission;
  model.fuelType = props.fuelType;
  model.sizeId = props.sizeId;

  const saved = await manager.save(model);
  return saved.id;
}

async function insertRedis(
  redis: RedisClientType,
  id: number,
  props: VehicleMetaProps,
) {
  redis.set(`miles:model:${props.name}`, id);
}
