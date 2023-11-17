import { MilesClient } from "@koenidv/abfahrt";
import { DataSource } from "typeorm";
import MilesDataHandler from "./DataStore/MilesDataHandler";
import env from "../env";
import MilesScraperCities from "./Scraping/MilesScraperCities";
import MilesScraperVehicles, { QueryPriority } from "./Scraping/MilesScraperVehicles";

export default class MilesController {
  abfahrtClient: MilesClient;
  scraperCities: MilesScraperCities;
  scraperVehicles: MilesScraperVehicles;
  dataSource: DataSource;
  database: MilesDataHandler;

  constructor(appDataSource: DataSource) {
    console.log("miles account email:", env.milesAccountEmail);

    this.abfahrtClient = new MilesClient();

    this.scraperCities = new MilesScraperCities(this.abfahrtClient, 120);
    this.scraperVehicles = new MilesScraperVehicles(this.abfahrtClient, 5);

    this.dataSource = appDataSource;
    this.database = new MilesDataHandler(this.dataSource);
  }

}
