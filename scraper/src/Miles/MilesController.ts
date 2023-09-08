import { MilesClient } from "@koenidv/abfahrt";
import MilesScraper from "./MilesScraper";
import { DataSource } from "typeorm";
import MilesDatabase from "./MilesDatabase";
import env from "../env";

export default class MilesController {
  client: MilesClient;
  scraper: MilesScraper;
  dataSource: DataSource;
  database: MilesDatabase;

  constructor(appDataSource: DataSource) {
    console.log("miles account email:", env.milesAccountEmail);

    this.client = new MilesClient();
    this.scraper = new MilesScraper(this.client);
    this.dataSource = appDataSource;
    this.database = new MilesDatabase(this.dataSource);
  }
}
