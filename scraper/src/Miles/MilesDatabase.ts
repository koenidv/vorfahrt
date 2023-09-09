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

  async city(props: CityProps): Promise<number> {
    const id = await existsCity(this.redis, props.milesId);
    if (id) return id;
    else return await insertCity(this.dataSource.manager, this.redis, props);
  }

  async size(props: SizeProps): Promise<number> {
    const id = await existsSize(this.redis, props.name);
    if (id) return id;
    else return await insertSize(this.dataSource.manager, this.redis, props);
  }
}
