import { DataSource, EntityManager } from "typeorm";
import { RedisClientType } from "@redis/client";

import { existsCity } from "./compare/existsCity";
import { CityProps, insertCity } from "./insert/insertCity";
import { existsSize } from "./compare/existsSize";
import { insertSize, SizeProps } from "./insert/insertSize";

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

  async insertCity(props: CityProps) {
    await insertCity(this.dataSource.manager, this.redis, props);
  }

  async existsSize(name: string) {
    return await existsSize(this.redis, name);
  }

  async insertSize(props: SizeProps) {
    await insertSize(this.dataSource.manager, this.redis, props);
  }
}
