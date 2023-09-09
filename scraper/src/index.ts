import env from "./env";
import { AppDataSource } from "./dataSource";
import { createClient as redisClient } from "redis";
import { RedisClientType } from "@redis/client";

import { MilesClient } from "@koenidv/abfahrt";
import MilesController from "./Miles/MilesController";


async function main() {
  const appDataSource = await AppDataSource.initialize();
  const appRedis: RedisClientType = redisClient();
  await appRedis.connect();
  const milesController = new MilesController(appDataSource, appRedis);
}
main();
