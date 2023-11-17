import { DataSource } from "typeorm";
import { apiVehicleJsonParsed } from "@koenidv/abfahrt/dist/src/miles/apiTypes";
import { MilesRelationalStore } from "./MilesRelationalStore";
import { MilesCityMeta } from "../Miles.types";
import MilesScraperVehicles, { QueryPriority } from "../Scraping/MilesScraperVehicles";
import { MilesClient, MilesVehicleStatus, getInfoFromMilesVehicleStatus } from "@koenidv/abfahrt";

export default class MilesDataHandler {
  relationalStore: MilesRelationalStore;
  vehicleScraper: MilesScraperVehicles;

  constructor(dataSource: DataSource, vehicleScraper: MilesScraperVehicles) {
    this.relationalStore = new MilesRelationalStore(dataSource.manager);
    this.vehicleScraper = vehicleScraper;
  }

  async handleCitiesMeta(cities: MilesCityMeta[]) {
    await this.relationalStore.insertCitiesMeta(...cities);
  }

  async handleSingleVehicleResponse(vehicle: apiVehicleJsonParsed, priority: QueryPriority) {
    this.relationalStore.handleVehicle(vehicle);

    if (vehicle.idVehicleStatus === MilesVehicleStatus.DEPLOYED_FOR_RENTAL) {
      this.vehicleScraper.deregister(vehicle.idVehicle);
    }

    if (priority !== QueryPriority.LOW &&
      getInfoFromMilesVehicleStatus(vehicle.idVehicleStatus as keyof typeof MilesVehicleStatus).isInLifecycle) {
      this.vehicleScraper.register(vehicle.idVehicle, QueryPriority.LOW);
    }

  }

}
