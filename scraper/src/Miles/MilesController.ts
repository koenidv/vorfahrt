import { MilesClient } from "@koenidv/abfahrt";
import { DataSource } from "typeorm";
import MilesDataHandler from "./DataStore/MilesDataHandler";
import env from "../env";
import MilesScraperMap from "./Scraping/MilesScraperMap";
import MilesScraperVehicles, { QueryPriority } from "./Scraping/MilesScraperVehicles";
import { MilesCityMeta } from "./Miles.types";
import { InfluxDB, QueryApi, WriteApi } from "@influxdata/influxdb-client";
import { SystemObserver } from "../SystemObserver";
import MilesScraperCitiesMeta from "./Scraping/MilesScraperCitiesMeta";

export default class MilesController {
  scraperMap: MilesScraperMap;
  scraperVehicles: MilesScraperVehicles;
  scraperCitiesMeta: MilesScraperCitiesMeta

  dataSource: DataSource;
  influxWriteClient: WriteApi;
  influxQueryClient: QueryApi;
  dataHandler: MilesDataHandler;

  constructor(appDataSource: DataSource, observer: SystemObserver) {
    console.log("miles account email:", env.milesAccountEmail);

    const abfahrt = new MilesClient();

    const dataHandler = this.createDataHandler(appDataSource);
    
    const scraperVehicles = this.startVehiclesScraper(abfahrt, dataHandler, observer);
    const scraperMap = new MilesScraperMap(abfahrt, 0.5, "miles-cities");
    const scraperCitiesMeta = this.startCitiesMetaScraper(abfahrt, scraperMap, observer);

    // this.scraperCities = new MilesScraperMap(abfahrt, 0.5, "miles-cities");
    // this.prepareCities(abfahrt);
  }

  private createDataHandler(appDataSource: DataSource): MilesDataHandler {
    this.dataSource = appDataSource;
    const influxdb = new InfluxDB({ url: env.influxUrl, token: env.influxToken });
    this.influxWriteClient = influxdb.getWriteApi("vorfahrt", "miles", "s");
    this.influxQueryClient = influxdb.getQueryApi("vorfahrt");
    this.dataHandler = new MilesDataHandler(this.dataSource, this.influxWriteClient, this.influxQueryClient, this.scraperVehicles);
    return this.dataHandler;
  }


  private startVehiclesScraper(abfahrt: MilesClient, dataHandler: MilesDataHandler, observer: SystemObserver): MilesScraperVehicles {
    this.scraperVehicles = new MilesScraperVehicles(abfahrt, 2 * 60, "miles-vehicles")
    this.scraperVehicles.addListener(dataHandler.handleVehicles.bind(dataHandler)));
    observer.registerScraper(this.scraperVehicles);
    return this.scraperVehicles.start();
  }

  private startCitiesMetaScraper(abfahrt: MilesClient, mapScraper: MilesScraperMap, observer): MilesScraperCitiesMeta {
    this.scraperCitiesMeta = new MilesScraperCitiesMeta(abfahrt, 1 / (60 * 12), "miles-cities-meta");
    this.scraperCitiesMeta.fetch().then(mapScraper.setAreas.bind(mapScraper));
    this.scraperCitiesMeta.addListener(mapScraper.setAreas.bind(mapScraper));
    observer.registerScraper(this.scraperCitiesMeta);
    return this.scraperCitiesMeta.start();
  }

  async prepareCities(abfahrt: MilesClient) {
    const citiesJson = (await abfahrt.getCityAreas()).Data.JSONCites;
    const cities = JSON.parse(citiesJson) as MilesCityMeta[];
    console.info("Found", cities.length, "cities");
    await this.dataHandler.handleCitiesMeta(cities);
    // todo register cities with cities scraper

    Array.from({ length: 300 }, (_, i) => 20000 + i).forEach(i => {
      this.scraperVehicles.register(i, QueryPriority.NORMAL);
    })
    this.scraperVehicles.start();
  }

}
