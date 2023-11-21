import { DataSource } from "typeorm";
import { AppDataSource } from "./dataSource";
import { InfluxDB, WriteApi } from "@influxdata/influxdb-client";
import { SystemObserver } from "./SystemObserver";
import env from "./env";
import { WebApiServer } from "./web-api/server";
import { SystemController } from "./SystemController";

class Main {
  appDataSource: DataSource;
  observer: SystemObserver;
  systemController: SystemController;
  apiServer: WebApiServer;

  constructor() { }

  async initialize() {
    this.appDataSource = await AppDataSource.initialize();
    this.observer = this.createObserver();
    this.systemController = new SystemController(this.observer);
    this.apiServer = new WebApiServer(this.systemController).start();
    
    this.systemController.createMilesScraper(this.appDataSource);
  }

  createObserver(): SystemObserver {
    const influxdb = new InfluxDB({ url: env.influxUrl, token: env.influxToken, timeout: 60000 });
    const observabilityInfluxClient = influxdb.getWriteApi("vorfahrt", "system_scraper", "s");
    return SystemObserver.createInstance(observabilityInfluxClient).start();
  }


}

new Main().initialize();