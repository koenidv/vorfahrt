import { DataSource } from "typeorm";
import { AppDataSource } from "./dataSource";
import { InfluxDB, WriteApi } from "@influxdata/influxdb-client";
import { Observer } from "./Observer";
import env from "./env";
import { WebApiServer } from "./web-api/server";
import { SystemController } from "./SystemController";

class Main {
  appDataSource: DataSource;
  systemController: SystemController;
  apiServer: WebApiServer;

  constructor() { }

  async initialize() {
    this.appDataSource = await AppDataSource.initialize();

    this.systemController = new SystemController(this.getObserverWriteClient());
    this.apiServer = new WebApiServer(this.systemController).start();

    this.systemController.createMilesScraper(this.appDataSource);
  }

  getObserverWriteClient(): WriteApi {
    return new InfluxDB({ url: env.influxUrl, token: env.influxToken, timeout: 60000 })
      .getWriteApi("vorfahrt", "system_scraper", "s");
  }


}

new Main().initialize();