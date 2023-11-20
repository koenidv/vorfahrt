import { DataSource } from "typeorm";
import { AppDataSource } from "./dataSource";
import MilesController from "./Miles/MilesController";
import { InfluxDB, WriteApi } from "@influxdata/influxdb-client";
import { SystemObserver } from "./SystemObserver";
import env from "./env";

class Main {
  appDataSource: DataSource;
  observabilityInfluxClient: WriteApi;
  observer: SystemObserver;
  milesController: MilesController;

  constructor() { }

  async initialize() {
    this.appDataSource = await AppDataSource.initialize();
    const influxdb = new InfluxDB({ url: env.influxUrl, token: env.influxToken, timeout: 60000 });
    this.observabilityInfluxClient = influxdb.getWriteApi("vorfahrt", "system_scraper", "s");
    this.observer = new SystemObserver(this.observabilityInfluxClient).start();
    this.milesController = new MilesController(this.appDataSource);
  }

}

new Main().initialize();