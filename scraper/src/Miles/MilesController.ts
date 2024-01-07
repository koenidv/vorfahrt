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
const RPM_MAP = 120;
const RPM_CITES = 1 / (60 * 12);

export default class MilesController {
  private systemController: SystemController;

  scraperMap: MilesScraperMap | undefined;
  scraperVehicles: MilesScraperVehicles | undefined;
  scraperCitiesMeta: MilesScraperCitiesMeta | undefined;

  dataSource: DataSource | undefined;
  influxWriteClient: WriteApi | undefined;
  influxQueryClient: QueryApi | undefined;
  dataHandler: MilesDataHandler | undefined;

  constructor(systemController: SystemController, appDataSource: DataSource) {
    console.log(clc.bgBlackBright("MilesController"), clc.blue("Initializing"));
    this.systemController = systemController;

    const abfahrt = new MilesClient();
    const dataHandler = this.createDataHandler(appDataSource);

    const scraperVehicles = this.startVehiclesScraper(abfahrt, dataHandler);
    dataHandler.vehicleScraper = scraperVehicles;

    this.populateVehiclesQueue(scraperVehicles, dataHandler);

    const scraperMap = this.startMapScraper(abfahrt, dataHandler);
    this.startCitiesMetaScraper(abfahrt, scraperMap);
  }

  private createDataHandler(appDataSource: DataSource): MilesDataHandler {
    this.dataSource = appDataSource;
    const influxdb = new InfluxDB({ url: env.influxUrl, token: env.influxToken, timeout: 60000 });
    this.influxWriteClient = influxdb.getWriteApi("vorfahrt", "miles", "s");
    this.influxQueryClient = influxdb.getQueryApi("vorfahrt");
    this.dataHandler = new MilesDataHandler(this.dataSource, this.influxWriteClient, this.influxQueryClient);
    return this.dataHandler;
  }

  private startVehiclesScraper(abfahrt: MilesClient, dataHandler: MilesDataHandler): MilesScraperVehicles {
    this.scraperVehicles = new MilesScraperVehicles(abfahrt, RPM_VEHICLE, "miles-vehicles", this.systemController)
      .addListener(dataHandler.handleVehicles.bind(dataHandler))
    if (process.argv.includes("--start")) this.scraperVehicles.start();
    return this.scraperVehicles;
  }

  private startMapScraper(abfahrt: MilesClient, dataHandler: MilesDataHandler): MilesScraperMap {
    this.scraperMap = new MilesScraperMap(abfahrt, RPM_MAP, "miles-map", this.systemController)
      .addListener(dataHandler.handleVehicles.bind(dataHandler))
    if (process.argv.includes("--start")) this.scraperMap.start();
    return this.scraperMap;
  }

  private async startCitiesMetaScraper(abfahrt: MilesClient, mapScraper: MilesScraperMap): Promise<MilesScraperCitiesMeta> {
    this.scraperCitiesMeta = new MilesScraperCitiesMeta(abfahrt, RPM_CITES, "miles-cities-meta", this.systemController)
      .addListener(mapScraper.setAreas.bind(mapScraper))
      .addListener(this.dataHandler!.handleCitiesMeta.bind(this.dataHandler))
    await this.scraperCitiesMeta.executeOnce(); // Cities meta is always executed once on start
    if (process.argv.includes("--start")) this.scraperCitiesMeta.start();
    return this.scraperCitiesMeta;
  }

  private async populateVehiclesQueue(vehicleScraper: MilesScraperVehicles, dataHandler: MilesDataHandler) {
    const values = await dataHandler.restoreVehicleQueue();
    vehicleScraper.register(values.normalQueue, QueryPriority.NORMAL);
    vehicleScraper.register(values.slowQueue, QueryPriority.LOW);
    // also register the next 2000 vehicles to normal queue
    vehicleScraper.register(Array.from({ length: 2000 }, (_, i) => values.highestId + i), QueryPriority.NORMAL);
  }

}
