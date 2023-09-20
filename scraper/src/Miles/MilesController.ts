import { MilesClient } from "@koenidv/abfahrt";
import MilesScraper from "./MilesScraper";
import { DataSource } from "typeorm";
import MilesDatabase from "./MilesDatabase";
import env from "../env";
import { RedisClientType } from "@redis/client";

export default class MilesController {
  client: MilesClient;
  scraper: MilesScraper;
  dataSource: DataSource;
  redis: RedisClientType;
  database: MilesDatabase;

  constructor(appDataSource: DataSource, appRedis: RedisClientType) {
    console.log("miles account email:", env.milesAccountEmail);

    this.client = new MilesClient();
    this.scraper = new MilesScraper(this.client);
    this.dataSource = appDataSource;
    this.redis = appRedis;
    this.database = new MilesDatabase(this.dataSource, this.redis);
  }

}
