/* eslint-disable prettier/prettier */
import "reflect-metadata";
import { HistoryController } from "@controllers/history.controller";
import { App } from "@/app";
import { getInfluxQueryApi } from "@/dataSourceInflux";
import { AppDataSource } from "@/dataSourceTypeORM";
import { AuthController } from "@controllers/auth.controller";
import { UserController } from "@controllers/users.controller";
import { VehicleController } from "@controllers/vehicles.controller";
import { HistoryCachingService } from "@/services/historyCaching.service";
import { VehicleService } from "@services/vehicles.service";
import { ValidateEnv } from "@utils/validateEnv";
import Container from "typedi";

(async () => {
  ValidateEnv();

  const appDataSource = await AppDataSource.initialize();
  Container.set("EntityManager", appDataSource.manager);
  Container.set("InfluxQueryApi", getInfluxQueryApi());

  // Get the services that need to run all the time so they're initialized
  Container.get(VehicleService);
  Container.get(HistoryCachingService);
  Container.get(HistoryController);

  const app = new App([AuthController, UserController, VehicleController, HistoryController]);
  app.listen();
})();
