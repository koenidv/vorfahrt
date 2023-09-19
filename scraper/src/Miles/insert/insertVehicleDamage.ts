import { EntityManager } from "typeorm";
import { RedisClientType } from "@redis/client";
import { insecureHash } from "./utils";
import { VehicleDamage } from "../../entity/Miles/VehicleDamages";

export type VehicleDamageProps = {
  vehicleMetaId: number,
  milesId: number,
  title: string,
  damages: string[],
};

export async function insertVehicleDamage(
  manager: EntityManager,
  redis: RedisClientType,
  props: VehicleDamageProps,
): Promise<number> {
  const id = await insertPostgres(manager, props);
  await insertRedis(redis, props);
  return id;
}

async function insertPostgres(
  manager: EntityManager,
  props: VehicleDamageProps,
): Promise<number> {
  const damage = new VehicleDamage();
  damage.vehicleMetaId = props.vehicleMetaId;
  damage.title = props.title;
  damage.damages = props.damages;

  const saved = await manager.save(damage);
  return saved.id;
}

async function insertRedis(
  redis: RedisClientType,
  props: VehicleDamageProps,
) {
  await redis.sAdd(`miles:vehicle:${props.milesId}:damages`, insecureHash(props.title, JSON.stringify(props.damages)));
}
