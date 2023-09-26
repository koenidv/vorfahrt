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
): Promise<City> {
  const city = new City();
  city.milesId = props.milesId;
  city.name = props.name;
  city.location = new Point(props.latitude, props.longitude).toString();

  return await manager.save(city)
}