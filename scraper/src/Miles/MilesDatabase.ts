import { DataSource, EntityManager } from "typeorm";
import { RedisClientType } from "@redis/client";

import { idCity } from "./getRedis/cityInfo";
import { CityProps, insertCity } from "./insert/insertCity";
import { idSize } from "./getRedis/sizeInfo";
import { insertVehicleSize, SizeProps } from "./insert/insertVehicleSize";
import {
  insertVehicleModel,
  VehicleModelProps,
} from "./insert/insertVehicleModel";
import { idModel } from "./getRedis/modelInfo";
import {
  insertVehicleMeta,
  VehicleMetaProps,
} from "./insert/insertVehicleMeta";
import { idVehicleMeta } from "./getRedis/vehicleInfo";
import { createVehicleFromApiType } from "./monads/createVehicle";
import { apiVehicleJsonParsed } from "@koenidv/abfahrt/dist/src/miles/apiTypes";
import { VehicleChangeProps, insertVehicleChange } from "./insert/insertVehicleChange";
import { VehicleDamageProps, insertVehicleDamage } from "./insert/insertVehicleDamage";
import { PricingProps, insertPricing } from "./insert/insertPricing";
import { idPricing } from "./getRedis/pricingInfo";
import { updatePricingPreBooking } from "./insert/updatePricingPreBooking";
import { VehicleMeta } from "../entity/Miles/VehicleMeta";

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

  async getVehicleInfoByMilesId(milesId: number) {
    const vehicle = await this.dataSource.manager.findOne(VehicleMeta, { where: { milesId: milesId }, relations: { current: true } })
    return vehicle;
  }

  async getCityId(cityName: string): Promise<number | false> {
    return await idCity(this.redis, cityName);
  }
  async cityId(props: CityProps): Promise<number> {
    const id = await idCity(this.redis, props.milesId);
    if (id) return id;
    else return await insertCity(this.dataSource.manager, this.redis, props);
  }

  async sizeId(props: SizeProps): Promise<number> {
    const id = await idSize(this.redis, props.name);
    if (id) return id;
    else return await insertVehicleSize(this.dataSource.manager, this.redis, props);
  }

  async modelId(props: VehicleModelProps): Promise<number> {
    const id = await idModel(this.redis, props.name);
    if (id) return id;
    return await insertVehicleModel(this.dataSource.manager, this.redis, props);
  }

  async getVehicleMetaId(milesId: number): Promise<number | false> {
    return await idVehicleMeta(this.redis, milesId);
  }
  async vehicleMetaId(props: VehicleMetaProps): Promise<number> {
    const id = idVehicleMeta(this.redis, props.milesId);
    if (id) return id;
    return await insertVehicleMeta(this.dataSource.manager, this.redis, props);
  }

  async pricingId(props: PricingProps): Promise<number> {
    const id = await idPricing(this.redis, props);
    if (id) return id;
    // try getting id with unknown prebooking fee, and update if found
    if (props.pricePreBooking) {
      const id = await idPricing(this.redis, {
        ...props,
        pricePreBooking: undefined,
      });
      if (id) {
        await updatePricingPreBooking(this.dataSource.manager, this.redis, {
          ...props,
          pricePreBooking: props.pricePreBooking,
          pricingId: id
        });
        return id;
      }
    }
    return await insertPricing(this.dataSource.manager, this.redis, props);
  }

  async createVehicle(apiVehicle: apiVehicleJsonParsed) {
    return await createVehicleFromApiType(this, apiVehicle);
  }

  async insertVehicleChange(props: VehicleChangeProps) {
    return await insertVehicleChange(this.dataSource.manager, props);
  }

  async insertVehicleDamage(props: VehicleDamageProps) {
    return await insertVehicleDamage(this.dataSource.manager, this.redis, props);
  }
}
