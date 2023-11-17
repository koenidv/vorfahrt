import { DataSource} from "typeorm";
import { apiVehicleJsonParsed } from "@koenidv/abfahrt/dist/src/miles/apiTypes";
import { MilesRelationalStore } from "./MilesRelationalStore";

export default class MilesDataHandler {
  relationalStore: MilesRelationalStore;

  constructor(dataSource: DataSource) {
    this.relationalStore = new MilesRelationalStore(dataSource.manager);

  }

  async handleSingleVehicleResponse(vehicle: apiVehicleJsonParsed) {
    this.relationalStore.handleVehicle(vehicle);
  }

}
