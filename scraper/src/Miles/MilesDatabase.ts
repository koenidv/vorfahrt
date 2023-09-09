import { DataSource, EntityManager } from "typeorm";
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

  async insertCity(props: iCity.CityProps) {
    await iCity.insertCity(this.dataSource.manager, this.redis, props);
  }
}
