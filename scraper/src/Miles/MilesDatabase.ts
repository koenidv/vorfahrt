import { DataSource, EntityManager } from "typeorm";
import { RedisClientType } from "@redis/client";

import { existsCity } from "./compare/existsCity";
import { CityProps, insertCity } from "./insert/insertCity";
import { existsSize } from "./compare/existsSize";
import { insertVehicleSize, SizeProps } from "./insert/insertVehicleSize";
import {
  insertVehicleModel,
  VehicleModelProps,
} from "./insert/insertVehicleModel";
import { existsModel } from "./compare/existsModel";
import {
  insertVehicleMeta,
  VehicleMetaProps,
} from "./insert/insertVehicleMeta";
import { idVehicleMeta } from "./compare/vehicleInfo";

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

  async getCity(cityName: string): Promise<number | false> {
    return await existsCity(this.redis, cityName);
  }
  async city(props: CityProps): Promise<number> {
    const id = await existsCity(this.redis, props.milesId);
    if (id) return id;
    else return await insertCity(this.dataSource.manager, this.redis, props);
  }

  async size(props: SizeProps): Promise<number> {
    const id = await existsSize(this.redis, props.name);
    if (id) return id;
    else return await insertVehicleSize(this.dataSource.manager, this.redis, props);
  }

  async model(props: VehicleModelProps): Promise<number> {
    const id = await existsModel(this.redis, props.name);
    if (id) return id;
    return await insertVehicleModel(this.dataSource.manager, this.redis, props);
  }

  async vehicleMeta(props: VehicleMetaProps): Promise<number> {
    const id = idVehicleMeta(this.redis, props.milesId);
    if (id) return id;
    return await insertVehicleMeta(this.dataSource.manager, this.redis, props);
  }
}
