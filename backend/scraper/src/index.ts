import { DataSource } from "typeorm";
import { AppDataSource } from "./dataSource";
import { InfluxDB, WriteApi } from "@influxdata/influxdb-client";
import env from "./env";
import { WebApiServer } from "./web-api/server";
import { SystemController } from "./SystemController";

class Main {
  appDataSource: DataSource | undefined;
  systemController: SystemController | undefined;
  apiServer: WebApiServer | undefined;

  constructor() { }

  async initialize() {
    this.appDataSource = await AppDataSource.initialize();
    const observerWriteApi = this.getObserverWriteClient();

    this.systemController = new SystemController(observerWriteApi);
    this.apiServer = new WebApiServer(this.systemController).start().startWs();
    
    this.systemController.createMilesScraper(this.appDataSource, observerWriteApi);
    this.systemController.createTomTomScraper(this.appDataSource, observerWriteApi);
    this.systemController.createWeatherScraper(this.appDataSource, observerWriteApi);
  }

  getObserverWriteClient(): WriteApi {
    return new InfluxDB({ url: env.influxUrl, token: env.influxToken, timeout: 60000 })
      .getWriteApi("vorfahrt", "system_scraper", "ms", { defaultTags: { host: env.hostname }, flushInterval: 20000 });
  }

}

new Main().initialize();