import { MilesClient } from "@koenidv/abfahrt";
import { DataSource } from "typeorm";
import MilesDataHandler from "./DataStore/MilesDataHandler";
import env from "../env";
import MilesScraperMap from "./Scraping/MilesScraperMap";
import MilesScraperVehicles, { QueryPriority } from "./Scraping/MilesScraperVehicles";
import { InfluxDB, QueryApi, WriteApi } from "@influxdata/influxdb-client";
import MilesScraperCitiesMeta from "./Scraping/MilesScraperCitiesMeta";
import clc from "cli-color";
import { SystemController } from "../SystemController";

const RPM_VEHICLE = 60;
const RPM_MAP = 1;
const RPM_CITES = 1 / (60 * 12);

export default class MilesController {
  private systemController: SystemController;

  scraperMap: MilesScraperMap;
  scraperVehicles: MilesScraperVehicles;
  scraperCitiesMeta: MilesScraperCitiesMeta

  dataSource: DataSource;
  influxWriteClient: WriteApi;
  influxQueryClient: QueryApi;
  dataHandler: MilesDataHandler;

  constructor(systemController: SystemController, appDataSource: DataSource) {
    console.log(clc.bgBlackBright("MilesController"), clc.blue("Initializing"));
    this.systemController = systemController;

    const abfahrt = new MilesClient();
    const dataHandler = this.createDataHandler(appDataSource);

    const scraperVehicles = this.startVehiclesScraper(abfahrt, dataHandler);
    // todo properly populate singlevehicles from relational
    this.scraperVehicles.register(Array.from({ length: 10 }, (_, i) => 10161 + i), QueryPriority.NORMAL);

    const scraperMap = this.startMapScraper(abfahrt, dataHandler);
    // todo populate cities from relational
    const scraperCitiesMeta = this.startCitiesMetaScraper(abfahrt, scraperMap);
  }

  private createDataHandler(appDataSource: DataSource): MilesDataHandler {
    this.dataSource = appDataSource;
    const influxdb = new InfluxDB({ url: env.influxUrl, token: env.influxToken, timeout: 60000 });
    this.influxWriteClient = influxdb.getWriteApi("vorfahrt", "miles", "s");
    this.influxQueryClient = influxdb.getQueryApi("vorfahrt");
    this.dataHandler = new MilesDataHandler(this.dataSource, this.influxWriteClient, this.influxQueryClient, this.scraperVehicles);
    return this.dataHandler;
  }

  private startVehiclesScraper(abfahrt: MilesClient, dataHandler: MilesDataHandler): MilesScraperVehicles {
    this.scraperVehicles = new MilesScraperVehicles(abfahrt, RPM_VEHICLE, "miles-vehicles", this.systemController)
      .addListener(dataHandler.handleVehicles.bind(dataHandler))
      .start();
    return this.scraperVehicles;
  }

  private startMapScraper(abfahrt: MilesClient, dataHandler: MilesDataHandler): MilesScraperMap {
    this.scraperMap = new MilesScraperMap(abfahrt, RPM_MAP, "miles-map", this.systemController)
      .addListener(dataHandler.handleVehicles.bind(dataHandler))
      .start();
    return this.scraperMap;
  }

  private startCitiesMetaScraper(abfahrt: MilesClient, mapScraper: MilesScraperMap): MilesScraperCitiesMeta {
    this.scraperCitiesMeta = new MilesScraperCitiesMeta(abfahrt, RPM_CITES, "miles-cities-meta", this.systemController)
      .addListener(mapScraper.setAreas.bind(mapScraper))
      .addListener(this.dataHandler.handleCitiesMeta.bind(this.dataHandler))
      .start()
      .executeNow();
    return this.scraperCitiesMeta;
  }

}
