import { MilesClient } from "@koenidv/abfahrt";
import { DataSource } from "typeorm";
import MilesDataHandler from "./DataStore/MilesDataHandler";
import env from "../env";
import MilesScraperMap from "./Scraping/MilesScraperMap";
import MilesScraperVehicles, { QueryPriority } from "./Scraping/MilesScraperVehicles";
import { InfluxDB, QueryApi, WriteApi } from "@influxdata/influxdb-client";
import MilesScraperCitiesMeta from "./Scraping/MilesScraperCitiesMeta";
import * as clc from "cli-color";
import { MilesCityMeta } from "./Miles.types";

export default class MilesController {
  scraperMap: MilesScraperMap;
  scraperVehicles: MilesScraperVehicles;
  scraperCitiesMeta: MilesScraperCitiesMeta

  dataSource: DataSource;
  influxWriteClient: WriteApi;
  influxQueryClient: QueryApi;
  dataHandler: MilesDataHandler;

  constructor(appDataSource: DataSource) {
    console.log(clc.bgBlackBright("MilesController"), clc.blue("Initializing"));

    const abfahrt = new MilesClient();
    const dataHandler = this.createDataHandler(appDataSource);

    this.tempPrepareCities(abfahrt);

    const scraperVehicles = this.startVehiclesScraper(abfahrt, dataHandler);
    // todo properly populate singlevehicles from relational
    Array.from({ length: 10 }, (_, i) => 10161 + i).forEach(i => {
      this.scraperVehicles.register(i, QueryPriority.NORMAL);
    })

    const scraperMap = this.startMapScraper(abfahrt, dataHandler);
    // todo populate cities from relational
    const scraperCitiesMeta = this.startCitiesMetaScraper(abfahrt, scraperMap);
  }

  private createDataHandler(appDataSource: DataSource): MilesDataHandler {
    this.dataSource = appDataSource;
    const influxdb = new InfluxDB({ url: env.influxUrl, token: env.influxToken });
    this.influxWriteClient = influxdb.getWriteApi("vorfahrt", "miles", "s");
    this.influxQueryClient = influxdb.getQueryApi("vorfahrt");
    this.dataHandler = new MilesDataHandler(this.dataSource, this.influxWriteClient, this.influxQueryClient, this.scraperVehicles);
    return this.dataHandler;
  }

  private startVehiclesScraper(abfahrt: MilesClient, dataHandler: MilesDataHandler): MilesScraperVehicles {
    this.scraperVehicles = new MilesScraperVehicles(abfahrt, 2 * 60, "miles-vehicles")
      .addListener(dataHandler.handleVehicles.bind(dataHandler))
      .start();
    return this.scraperVehicles;
  }

  private startMapScraper(abfahrt: MilesClient, dataHandler: MilesDataHandler): MilesScraperMap {
    this.scraperMap = new MilesScraperMap(abfahrt, 1, "miles-map")
      .addListener(dataHandler.handleVehicles.bind(dataHandler))
      .start();
    return this.scraperMap;
  }

  private startCitiesMetaScraper(abfahrt: MilesClient, mapScraper: MilesScraperMap): MilesScraperCitiesMeta {
    this.scraperCitiesMeta = new MilesScraperCitiesMeta(abfahrt, 1 / (60 * 12), "miles-cities-meta");
    // todo remove this once cities are properly populated
    this.scraperCitiesMeta.fetch().then(mapScraper.setAreas.bind(mapScraper));
    this.scraperCitiesMeta.addListener(mapScraper.setAreas.bind(mapScraper));
    // todo datahandler listener
    return this.scraperCitiesMeta.start();
  }


  async tempPrepareCities(abfahrt: MilesClient) {
    const citiesJson = (await abfahrt.getCityAreas()).Data.JSONCites;
    const cities = JSON.parse(citiesJson) as MilesCityMeta[];
    console.info("Found", cities.length, "cities");
    await this.dataHandler.handleCitiesMeta(cities);
  }

}
