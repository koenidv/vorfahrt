import { DataSource } from "typeorm";
import { apiVehicleJsonParsed } from "@koenidv/abfahrt/dist/src/miles/apiTypes";
import { MilesRelationalStore } from "./MilesRelationalStore";
import { MilesCityMeta } from "../Miles.types";
import MilesScraperVehicles, { QueryPriority, MilesVehicleSource } from "../Scraping/MilesScraperVehicles";
import { MilesVehicleStatus, getInfoFromMilesVehicleStatus } from "@koenidv/abfahrt";
import { QueryApi, WriteApi } from "@influxdata/influxdb-client";
import { MilesInfluxStore } from "./MilesInfluxStore";
import clc from "cli-color";
import { MilesVehiclesPerCityCache } from "./MilesVehiclesPerCityCache";
import { MilesMapSource } from "../Scraping/MilesScraperMap";
import { MilesPercentageSource } from "../Scraping/MilesScraperPercentages";
import { SOURCE_TYPE, ValueSource } from "../../types";

export default class MilesDataHandler {
  private relationalStore: MilesRelationalStore;
  private influxStore: MilesInfluxStore;
  private _vehicleScraper: MilesScraperVehicles | undefined = undefined;
  set vehicleScraper(value: MilesScraperVehicles) {
    this._vehicleScraper = value;
  }
  private vehiclesPerCity = new MilesVehiclesPerCityCache();

  constructor(dataSource: DataSource, influxWriteClient: WriteApi, influxQueryClient: QueryApi) {
    this.relationalStore = new MilesRelationalStore(dataSource.manager);
    this.influxStore = new MilesInfluxStore(influxWriteClient, influxQueryClient);
  }

  async restoreVehicleQueue() {
    return await this.relationalStore.restoreVehicleQueue();
  }

  async handleCitiesMeta(cities: MilesCityMeta[]) {
    await this.relationalStore.insertCitiesMeta(...cities);
  }

  async handleVehicles(vehicles: apiVehicleJsonParsed[], source: ValueSource) {
    // fixme currently saving vehicles one after another - otherwise, insertion into postgres might fail
    // todo to fix the above, move iteration to the stores - also use influx writePoints instead of writePoint
    for (const vehicle of vehicles) {
      await this.handleSingleVehicleResponse(vehicle, source);
    }
    if (source.source === SOURCE_TYPE.MAP) {
      this.handleDisenqueuedVehicles(vehicles);
      if ((source as MilesMapSource).isFinal) {
        const disappearedIds = this.vehiclesPerCity.saveVehiclesDiffDisappeared(source as MilesMapSource, vehicles);
        if (disappearedIds.length) console.log(clc.bgBlackBright("MilesDataHandler"), disappearedIds.length, "vehicles became invisible in", (source as MilesMapSource).cityId);
        this.handleEnqueueDisappearedIds(disappearedIds);
      }
    } else if (source.source === SOURCE_TYPE.VEHICLE) {
      for (const vehicle of vehicles) {
        this.handleMoveQueues(vehicle);
      }
    } else if (source.source === SOURCE_TYPE.PERCENTAGE) {
      this.handleDisenqueuedVehicles(vehicles);
    }
  }

  private async handleSingleVehicleResponse(vehicle: apiVehicleJsonParsed, source: ValueSource) {
    await this.relationalStore.handleVehicle(vehicle);
    this.influxStore.handleVehicle(vehicle);
  }

  private handleMoveQueues(vehicle: apiVehicleJsonParsed) {
    if (!this._vehicleScraper) {
      console.error(clc.bgRed("MilesDataHandler"), clc.red("MilesVehicleScraper is undefined"));
      return;
    }

    if (vehicle.idVehicleStatus === MilesVehicleStatus.DEPLOYED_FOR_RENTAL) {
      this._vehicleScraper.deregister([vehicle.idVehicle]);
    }

    if (getInfoFromMilesVehicleStatus(vehicle.idVehicleStatus as keyof typeof MilesVehicleStatus).isInLifecycle) {
      this._vehicleScraper.register([vehicle.idVehicle], QueryPriority.LOW);
    }
  }

  private handleEnqueueDisappearedIds(vehicleIds: number[]) {
    if (!this._vehicleScraper) {
      console.error(clc.bgRed("MilesDataHandler"), clc.red("MilesVehicleScraper is undefined"));
      return;
    }
    this._vehicleScraper.register(vehicleIds, QueryPriority.HIGH);
  }

  private handleDisenqueuedVehicles(vehicles: apiVehicleJsonParsed[]) {
    if (!this._vehicleScraper) {
      console.error(clc.bgRed("MilesDataHandler"), clc.red("MilesVehicleScraper is undefined"));
      return;
    }
    this._vehicleScraper.deregister(vehicles.map(el => el.idVehicle));
  }
}
