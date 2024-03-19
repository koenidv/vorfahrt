/* eslint-disable prettier/prettier */
import "reflect-metadata";
import { HistoryController } from "@controllers/history.controller";
import { App } from "@/app";
import { getInfluxQueryApi } from "@/dataSourceInflux";
import { AppDataSource } from "@/dataSourceTypeORM";
import { AuthController } from "@controllers/auth.controller";
import { UserController } from "@controllers/users.controller";
import { VehicleController } from "@controllers/vehicles.controller";
import { HistoryService } from "@services/history.service";
import { VehicleService } from "@services/vehicles.service";
import { ValidateEnv } from "@utils/validateEnv";
import Container from "typedi";

(async () => {
  ValidateEnv();

  const appDataSource = await AppDataSource.initialize();
  Container.set("EntityManager", appDataSource.manager);
  Container.set("InfluxQueryApi", getInfluxQueryApi());

  // Get the caching services so they're initialized and have a cache ready for the first request
  Container.get(VehicleService);
  Container.get(HistoryService);

  const app = new App([AuthController, UserController, VehicleController, HistoryController]);
  app.listen();
})();
