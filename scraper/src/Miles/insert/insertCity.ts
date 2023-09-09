import { EntityManager, Point } from "typeorm";
import { RedisClientType } from "@redis/client";
import { City } from "../../entity/Miles/City";
import { createPoint } from "./parsePoint";

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
  const id = await insertCityPostgres(manager, props);
  await insertCityRedis(redis, id, props);
  return id;
}

async function insertCityPostgres(
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

async function insertCityRedis(
  redis: RedisClientType,
  id: number,
  props: CityProps,
) {
  redis.set(`miles:city:${props.milesId}`, id);
}
