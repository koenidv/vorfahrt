import { DataSource } from "typeorm";
import { apiVehicleJsonParsed } from "@koenidv/abfahrt/dist/src/miles/apiTypes";
import { MilesRelationalStore } from "./MilesRelationalStore";
import { MilesCityMeta } from "../Miles.types";
import MilesScraperVehicles, { QueryPriority } from "../Scraping/MilesScraperVehicles";
import { MilesVehicleStatus, getInfoFromMilesVehicleStatus } from "@koenidv/abfahrt";
import { QueryApi, WriteApi } from "@influxdata/influxdb-client";
import { MilesInfluxStore } from "./MilesInfluxStore";
import clc from "cli-color";
import { MilesVehiclesPerCityCache } from "./MilesVehiclesPerCityCache";
import { MapFiltersSource } from "../Scraping/MilesScraperMap";
import { PercentageSource } from "../Scraping/MilesScraperPercentages";

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

  async handleVehicles(vehicles: apiVehicleJsonParsed[], source: QueryPriority | MapFiltersSource | PercentageSource) {
    // fixme currently saving vehicles one after another - otherwise, insertion into postgres might fail
    // todo to fix the above, move iteration to the stores - also use influx writePoints instead of writePoint
    for (const vehicle of vehicles) {
      await this.handleSingleVehicleResponse(vehicle, source);
    }
// todo extended source type
// todo HANDLE PERCENTAGE SOURCE
    if ((source as MapFiltersSource).source === "map") {
      // source is Map Scraper
      const disappearedIds = this.vehiclesPerCity.saveVehiclesDiffDisappeared(source as MapFiltersSource, vehicles);
      if (disappearedIds.length) console.log(clc.bgBlackBright("MilesDataHandler"), disappearedIds.length, "vehicles became invisible in", (source as MapFiltersSource).cityId);
      this.handleEnqueueDisappearedIds(disappearedIds);
      this.handleDisenqueuedVehicles(vehicles);
    } else {
      // source is a QueryPriority from Vehicle Scraper
      for (const vehicle of vehicles) {
        this.handleMoveQueues(vehicle, source);
      }
    }
  }

  private async handleSingleVehicleResponse(vehicle: apiVehicleJsonParsed, source: QueryPriority | MapFiltersSource | PercentageSource) {
    await this.relationalStore.handleVehicle(vehicle);
    this.influxStore.handleVehicle(vehicle);
  }

  private handleMoveQueues(vehicle: apiVehicleJsonParsed, source: QueryPriority | MapFiltersSource | PercentageSource) {
    if (!this._vehicleScraper) {
      console.error(clc.bgRed("MilesDataHandler"), clc.red("MilesVehicleScraper is undefined"));
      return;
    }

    if (vehicle.idVehicleStatus === MilesVehicleStatus.DEPLOYED_FOR_RENTAL) {
      this._vehicleScraper.deregister([vehicle.idVehicle]);
    }

    if (source !== QueryPriority.LOW &&
      getInfoFromMilesVehicleStatus(vehicle.idVehicleStatus as keyof typeof MilesVehicleStatus).isInLifecycle) {
      this._vehicleScraper.register([vehicle.idVehicle], QueryPriority.LOW);
    }
  }

  private handleEnqueueDisappearedIds(vehicleIds: number[]) {
    if (!this._vehicleScraper) {
      console.error(clc.bgRed("MilesDataHandler"), clc.red("MilesVehicleScraper is undefined"));
      return;
    }
    this._vehicleScraper.register(vehicleIds, QueryPriority.NORMAL);
  }

  private handleDisenqueuedVehicles(vehicles: apiVehicleJsonParsed[]) {
    if (!this._vehicleScraper) {
      console.error(clc.bgRed("MilesDataHandler"), clc.red("MilesVehicleScraper is undefined"));
      return;
    }
    this._vehicleScraper.deregister(vehicles.map(el => el.idVehicle));
  }
}
