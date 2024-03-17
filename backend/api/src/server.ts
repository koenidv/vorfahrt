import { AppDataSource } from "./dataSource";
import { VehicleService } from "./services/vehicles.service";
import { App } from "@/app";
import { AuthController } from "@controllers/auth.controller";
import { UserController } from "@controllers/users.controller";
import { VehicleController } from "@controllers/vehicles.controller";
import { ValidateEnv } from "@utils/validateEnv";
import Container from "typedi";

(async () => {
  ValidateEnv();

  const appDataSource = await AppDataSource.initialize();
  Container.set("EntityManager", appDataSource.manager);

  // Get the caching services so they're initialized and have a cache ready for the first request
  Container.get(VehicleService);

  const app = new App([AuthController, UserController, VehicleController]);
  app.listen();
})();
