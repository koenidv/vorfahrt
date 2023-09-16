import { EntityManager, Point } from "typeorm";
import { RedisClientType } from "@redis/client";
import { VehicleSize } from "../../entity/Miles/VehicleSize";

export type SizeProps = {
  name: string;
};

export async function insertVehicleSize(
  manager: EntityManager,
  redis: RedisClientType,
  props: SizeProps,
): Promise<number> {
  const id = await insertPostgres(manager, props);
  await insertRedis(redis, id, props);
  return id;
}

async function insertPostgres(
  manager: EntityManager,
  props: SizeProps,
): Promise<number> {
  const size = new VehicleSize();
  size.name = props.name;

  const saved = await manager.save(size);
  return saved.id;
}

async function insertRedis(
  redis: RedisClientType,
  id: number,
  props: SizeProps,
) {
  await redis.set(`miles:size:${props.name}`, id);
}
