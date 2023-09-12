import { EntityManager, Point } from "typeorm";
import { RedisClientType } from "@redis/client";
import { City } from "../../entity/Miles/City";
import { createPoint } from "./utils";

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
  city.location = createPoint({ lat: props.latitude, lng: props.longitude });

  const saved = await manager.save(city);
  return saved.id;
}

async function insertRedis(
  redis: RedisClientType,
  id: number,
  props: CityProps,
) {
  redis.set(`miles:city:${props.milesId}`, id);
}
