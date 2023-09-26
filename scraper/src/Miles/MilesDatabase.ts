import { DataSource, EntityManager } from "typeorm";
import { RedisClientType } from "@redis/client";

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
import { insertVehicleAndRelations } from "./monads/createVehicle";
import { apiVehicleJsonParsed } from "@koenidv/abfahrt/dist/src/miles/apiTypes";
import { VehicleChangeProps, insertVehicleChange } from "./insert/insertVehicleChange";
import { VehicleDamageProps, insertVehicleDamage } from "./insert/insertVehicleDamage";
import { insertPricing } from "./insert/insertPricing";
import { VehicleMeta } from "../entity/Miles/VehicleMeta";
import { VehicleCurrent } from "../entity/Miles/VehicleCurrent";
import { updateVehicleCurrent } from "./insert/updateVehicleCurrent";
import { Pricing } from "../entity/Miles/Pricing";
import { findPricingForVehicle } from "./find/findPricingForVehicle";
import { City } from "../entity/Miles/City";
import { findCity } from "./find/findCity";
import { CityProps, insertCity } from "./insert/insertCity";
import { findVehicleInfoByMilesId } from "./find/findVehicleInfo";

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

  /**
   * Queries information about a vehicle by its milesId, including:
   * - current vehicle state
   * - current pricing
   * - first city
   * @param milesId Vehicle id assigned by Miles
   * @returns VehicleMeta with expanded current, city, pricing relations
   */
  async getVehicleInfoByMilesId(milesId: number) {
    return await findVehicleInfoByMilesId(this.dataSource.manager, milesId);
  }

  /**
   * Retrieves an existing city from a miles city id
   * @param cityName City id assigned by Miles, eg "BER"
   * @returns City entity from postgres or null if not found
   */
  async getCity(milesCityId: string): Promise<City|null> {
    return await findCity(this.dataSource.manager, milesCityId);
  }

  /**
   * Inserts a new city to the database
   * @param props City properties. Not included in vehicles, but in UserHello
   * @returns City entity that was inserted
   */
  async insertCity(props: CityProps): Promise<City> {
    return await insertCity(this.dataSource.manager, this.redis, props);
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
    const id = idVehicleMeta(this.redis, props.apiVehicle.idVehicle);
    if (id) return id;
    return await insertVehicleMeta(this.dataSource.manager, this.redis, props);
  }

  /**
   * Finds or inserts a pricing entity. Used when creating or updating a vehicle.
   * @param vehicle Parsed vehicle as returned by the Miles API, including pricing
   * @returns Pricing entity - either existing or newly inserted
   */
  async getOrInsertPricing(vehicle: apiVehicleJsonParsed): Promise<Pricing> {
    const pricing = await findPricingForVehicle(this.dataSource.manager, vehicle);
    if (pricing) return pricing;
    else return await insertPricing(this.dataSource.manager, vehicle);
  }

  /**
   * Inserts a vehicle to the database. This includes:
   * - vehicle meta
   * - vehicle current
   * - vehicle added change event
   * - vehicle size if new
   * - vehicle model if new
   * * Cities cannot be created from vehicles, will throw if city is not found
   * @param apiVehicle Single vehicle as returned by the Miles API
   * @returns id of the inserted vehicle meta
   * @throws Error if city is not found
   */
  async createVehicle(apiVehicle: apiVehicleJsonParsed) {
    return await insertVehicleAndRelations(this, apiVehicle);
  }

  /**
   * Inserts a vehicle change event <i>without updating the current vehicle state</i>
   * This is used when creating a new vehicle, as the current state is cascaded with the vehicle meta
   * todo: reconsider inserting current state with vehicle change instead of vehicle meta
   * @param props what has changed
   * @returns id of the change event
   */
  async insertVehicleChange(props: VehicleChangeProps) {
    return await insertVehicleChange(this.dataSource.manager, props);
  }

  /**
   * Inserts a vehicle change event and updates the current vehicle state
   * @param current current vehicle state to update
   * @param props what has changed
   * @returns id of the change event
   */
  async updateVehicle(current: VehicleCurrent, props: VehicleChangeProps) {
    const changeId = await insertVehicleChange(this.dataSource.manager, props);
    await updateVehicleCurrent(this.dataSource.manager, current, props);
    return changeId;
  }

  /**
   * Inserts a damage for a vehicle and saves a hash in redis
   * @param props damage title and description
   * @returns id of the damage
   */
  async insertVehicleDamage(props: VehicleDamageProps) {
    return await insertVehicleDamage(this.dataSource.manager, this.redis, props);
  }
}
