import { EntityManager, Point } from "typeorm";
import { RedisClientType } from "@redis/client";
import { City } from "../../entity/Miles/City";
import { createPoint, insecureHash } from "./utils";
import { Pricing } from "../../entity/Miles/Pricing";
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
  damage.damages = JSON.stringify(props.damages); // todo json storage type

  const saved = await manager.save(damage);
  return saved.id;
}

async function insertRedis(
  redis: RedisClientType,
  props: VehicleDamageProps,
) {
  await redis.sAdd(`miles:vehicle:${props.milesId}:damages`, insecureHash(props.title, JSON.stringify(props.damages)));
}
