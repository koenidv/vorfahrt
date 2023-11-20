import { DataSource } from "typeorm";
import { AppDataSource } from "./dataSource";
import MilesController from "./Miles/MilesController";
import { InfluxDB, WriteApi } from "@influxdata/influxdb-client";
import { SystemObserver } from "./SystemObserver";
import env from "./env";
import { WebApiServer } from "./web-api/server";

class Main {
  appDataSource: DataSource;
  observabilityInfluxClient: WriteApi;
  observer: SystemObserver;
  milesController: MilesController;
  apiServer: WebApiServer;

  constructor() { }

  async initialize() {
    this.appDataSource = await AppDataSource.initialize();
    const influxdb = new InfluxDB({ url: env.influxUrl, token: env.influxToken, timeout: 60000 });
    this.observabilityInfluxClient = influxdb.getWriteApi("vorfahrt", "system_scraper", "s");
    this.observer = SystemObserver.createInstance(this.observabilityInfluxClient).start();
    this.milesController = new MilesController(this.appDataSource);
    this.apiServer = new WebApiServer(this.observer).start(); 
  }

}

new Main().initialize();