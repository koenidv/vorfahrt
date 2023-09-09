import { DataSource, EntityManager } from "typeorm";
import { existsCity } from "./compare/existsCity";
import * as iCity from "./insert/insertCity";
import { RedisClientType } from "@redis/client";

export default class MilesDatabase {
  dataSource: DataSource;
  manager: EntityManager;
  redis: RedisClientType;

  constructor(dataSource: DataSource, redis: RedisClientType) {
    this.dataSource = dataSource;
    this.manager = dataSource.manager;
    this.redis = redis;

    console.log("[Miles]", "Database initialized");
  }

  async existsCity(milesId: string) {
    return await existsCity(this.redis, milesId);
  }

  async insertCity(props: iCity.CityProps) {
    await iCity.insertCity(this.dataSource.manager, this.redis, props);
  }
}
