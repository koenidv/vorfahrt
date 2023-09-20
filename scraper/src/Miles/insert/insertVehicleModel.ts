import { EntityManager } from "typeorm";
import { RedisClientType } from "@redis/client";
import { VehicleModel } from "../../entity/Miles/VehicleModel";
import { MilesVehicleFuelReturn, MilesVehicleTransmissionReturn } from "@koenidv/abfahrt";

export type VehicleModelProps = {
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
  props: VehicleModelProps,
): Promise<number> {
  const id = await insertPostgres(manager, props);
  await insertRedis(redis, id, props);
  return id;
}

async function insertPostgres(
  manager: EntityManager,
  props: VehicleModelProps,
): Promise<number> {
  const model = new VehicleModel();
  model.name = props.name;
  model.seats = props.seats;
  model.electric = props.electric;
  model.enginePower = props.enginePower;
  model.transmission = props.transmission as unknown as typeof MilesVehicleTransmissionReturn;
  model.fuelType = props.fuelType as unknown as typeof MilesVehicleFuelReturn;
  model.sizeId = props.sizeId;

  const saved = await manager.save(model);
  return saved.id;
}

async function insertRedis(
  redis: RedisClientType,
  id: number,
  props: VehicleModelProps,
) {
  await redis.set(`miles:model:${props.name}`, id);
}
