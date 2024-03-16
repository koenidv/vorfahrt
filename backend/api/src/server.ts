import { AppDataSource } from "./dataSource";
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

  const app = new App([AuthController, UserController, VehicleController]);
  app.listen();
})();
