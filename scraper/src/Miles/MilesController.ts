import { MilesClient } from "@koenidv/abfahrt";
import { DataSource } from "typeorm";
import MilesDataHandler from "./DataStore/MilesDataHandler";
import env from "../env";
import MilesScraperCities from "./Scraping/MilesScraperCities";
import MilesScraperVehicles, { QueryPriority } from "./Scraping/MilesScraperVehicles";
import { MilesCityMeta } from "./Miles.types";
import { InfluxDB, QueryApi, WriteApi } from "@influxdata/influxdb-client";

export default class MilesController {
  abfahrtClient: MilesClient;

  scraperCities: MilesScraperCities;
  scraperVehicles: MilesScraperVehicles;

  dataSource: DataSource;
  influxWriteClient: WriteApi;
  influxQueryClient: QueryApi;
  dataHandler: MilesDataHandler;

  constructor(appDataSource: DataSource) {
    console.log("miles account email:", env.milesAccountEmail);

    this.abfahrtClient = new MilesClient();

    this.scraperCities = new MilesScraperCities(this.abfahrtClient, 120);
    this.scraperVehicles = new MilesScraperVehicles(this.abfahrtClient, 2);

    this.dataSource = appDataSource;
    const influxdb = new InfluxDB({ url: env.influxUrl, token: env.influxToken });
    this.influxWriteClient = influxdb.getWriteApi("vorfahrt", "miles");
    this.influxQueryClient = influxdb.getQueryApi("vorfahrt");
    this.dataHandler = new MilesDataHandler(this.dataSource, this.influxWriteClient, this.influxQueryClient, this.scraperVehicles);

    this.scraperVehicles.addListener(
      (vehicle, priority) =>
        this.dataHandler.handleSingleVehicleResponse(vehicle, priority));

    this.prepareCities();
  }

  async prepareCities() {
    const citiesJson = (await this.abfahrtClient.getCityAreas()).Data.JSONCites;
    const cities = JSON.parse(citiesJson) as MilesCityMeta[];
    console.info("Found", cities.length, "cities");
    await this.dataHandler.handleCitiesMeta(cities);
    // todo register cities with cities scraper

    Array.from({ length: 100 }, (_, i) => 20000 + i).forEach(i => {
      this.scraperVehicles.register(i, QueryPriority.NORMAL);
    })
    this.scraperVehicles.start();
  }

}
