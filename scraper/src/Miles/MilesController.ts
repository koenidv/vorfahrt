import { MilesClient } from "@koenidv/abfahrt";
import { DataSource } from "typeorm";
import MilesDatabase from "./MilesDatabase";
import env from "../env";
import MilesScraperCities from "./MilesScraperCities";
import MilesScraperVehicles, { QueryPriority } from "./MilesScraperVehicles";

export default class MilesController {
  abfahrtClient: MilesClient;
  scraperCities: MilesScraperCities;
  scraperVehicles: MilesScraperVehicles;
  dataSource: DataSource;
  database: MilesDatabase;

  constructor(appDataSource: DataSource) {
    console.log("miles account email:", env.milesAccountEmail);

    this.abfahrtClient = new MilesClient();

    this.scraperCities = new MilesScraperCities(this.abfahrtClient, 120);
    this.scraperVehicles = new MilesScraperVehicles(this.abfahrtClient, 5);

    this.dataSource = appDataSource;
    this.database = new MilesDatabase(this.dataSource);
  }

}
