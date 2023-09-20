import { EntityManager } from "typeorm";
import { RedisClientType } from "@redis/client";
import { City } from "../../entity/Miles/City";
import Point from "../utils/Point";

export type CityProps = {
  milesId: string;
  name: string;
  latitude: number;
  longitude: number;
};

export async function insertCity(
  manager: EntityManager,
  redis: RedisClientType,
  props: CityProps,
): Promise<number> {
  const id = await insertPostgres(manager, props);
  await insertRedis(redis, id, props);
  return id;
}

async function insertPostgres(
  manager: EntityManager,
  props: CityProps,
): Promise<number> {
  const city = new City();
  city.milesId = props.milesId;
  city.name = props.name;
  city.location = new Point(props.latitude, props.longitude).toString();

  const saved = await manager.save(city);
  return saved.id;
}

async function insertRedis(
  redis: RedisClientType,
  id: number,
  props: CityProps,
) {
  await redis.set(`miles:city:${props.milesId}`, id);
}
