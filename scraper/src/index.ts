import { MilesClient } from "@koenidv/abfahrt";

import env from "./env";
import { AppDataSource } from "./dataSource";
import MilesController from "./Miles/MilesController";

async function main() {
  const appDataSource = await AppDataSource.initialize();
  const milesController = new MilesController(appDataSource);
}
main();
