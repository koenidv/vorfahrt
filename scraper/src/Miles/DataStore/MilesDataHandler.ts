import { DataSource } from "typeorm";
import { apiVehicleJsonParsed } from "@koenidv/abfahrt/dist/src/miles/apiTypes";
import { MilesRelationalStore } from "./MilesRelationalStore";
import { MilesCityMeta } from "../Miles.types";
import MilesScraperVehicles, { QueryPriority } from "../Scraping/MilesScraperVehicles";
import { MilesClient, MilesVehicleStatus, getInfoFromMilesVehicleStatus } from "@koenidv/abfahrt";
import { QueryApi, WriteApi } from "@influxdata/influxdb-client";
import { MilesInfluxStore } from "./MilesInfluxStore";
import { type } from "os";

export default class MilesDataHandler {
  relationalStore: MilesRelationalStore;
  influxStore: MilesInfluxStore;
  vehicleScraper: MilesScraperVehicles;

  constructor(dataSource: DataSource, influxWriteClient: WriteApi, influxQueryClient: QueryApi, vehicleScraper: MilesScraperVehicles) {
    this.relationalStore = new MilesRelationalStore(dataSource.manager);
    this.influxStore = new MilesInfluxStore(influxWriteClient, influxQueryClient);
    this.vehicleScraper = vehicleScraper;
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


    //this.handleMoveQueues(vehicle, priority);
  }

  private handleMoveQueues(vehicle: apiVehicleJsonParsed, source: QueryPriority | string) {
    if (vehicle.idVehicleStatus === MilesVehicleStatus.DEPLOYED_FOR_RENTAL) {
      this.vehicleScraper.deregister(vehicle.idVehicle);
    }

    if (source !== QueryPriority.LOW &&
      getInfoFromMilesVehicleStatus(vehicle.idVehicleStatus as keyof typeof MilesVehicleStatus).isInLifecycle) {
      this.vehicleScraper.register([vehicle.idVehicle], QueryPriority.LOW);
    }
  }
}
