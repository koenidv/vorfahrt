import { DataSource } from "typeorm";
import { apiVehicleJsonParsed } from "@koenidv/abfahrt/dist/src/miles/apiTypes";
import { MilesRelationalStore } from "./MilesRelationalStore";
import { MilesCityMeta } from "../Miles.types";
import MilesScraperVehicles, { QueryPriority } from "../Scraping/MilesScraperVehicles";
import { MilesVehicleStatus, getInfoFromMilesVehicleStatus } from "@koenidv/abfahrt";
import { QueryApi, WriteApi } from "@influxdata/influxdb-client";
import { MilesInfluxStore } from "./MilesInfluxStore";
import clc from "cli-color";

export default class MilesDataHandler {
  private relationalStore: MilesRelationalStore;
  private influxStore: MilesInfluxStore;
  private _vehicleScraper: MilesScraperVehicles | undefined = undefined;
  set vehicleScraper(value: MilesScraperVehicles) {
    this._vehicleScraper = value;
  }

  constructor(dataSource: DataSource, influxWriteClient: WriteApi, influxQueryClient: QueryApi) {
    this.relationalStore = new MilesRelationalStore(dataSource.manager);
    this.influxStore = new MilesInfluxStore(influxWriteClient, influxQueryClient);
  }

  async handleCitiesMeta(cities: MilesCityMeta[]) {
    await this.relationalStore.insertCitiesMeta(...cities);
  }

  async handleVehicles(vehicles: apiVehicleJsonParsed[], source: QueryPriority | string) {
    // fixme currently saving vehicles one after another - otherwise, insertion into postgres might fail
    // todo to fit the above, move iteration to the stores - also use influx writePoints instead of writePoint
    for (const vehicle of vehicles) {
      await this.handleSingleVehicleResponse(vehicle, source);
    }

  }

  private async handleSingleVehicleResponse(vehicle: apiVehicleJsonParsed, source: QueryPriority | string) {
    await this.relationalStore.handleVehicle(vehicle);
    this.influxStore.handleVehicle(vehicle);


    this.handleMoveQueues(vehicle, source);
    // todo if a vehicle isn't found at its last location on the map, add to single vehicle queue. this will require passing the region as source
  }

  private handleMoveQueues(vehicle: apiVehicleJsonParsed, source: QueryPriority | string) {
    if (!this._vehicleScraper) {
      console.error(clc.bgRed("MilesDataHandler"), clc.red("MilesVehicleScraper is undefined"));
      return;
    }

    if (vehicle.idVehicleStatus === MilesVehicleStatus.DEPLOYED_FOR_RENTAL) {
      this._vehicleScraper.deregister(vehicle.idVehicle); //fixme vehiclescraper measures should only be taken if a vehicle was actually removed
    }

    if (source !== QueryPriority.LOW &&
      getInfoFromMilesVehicleStatus(vehicle.idVehicleStatus as keyof typeof MilesVehicleStatus).isInLifecycle) {
      this._vehicleScraper.register([vehicle.idVehicle], QueryPriority.LOW);
    }
  }
}
