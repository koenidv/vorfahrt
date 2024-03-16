import { App } from "@/app";
import { AuthController } from "@controllers/auth.controller";
import { UserController } from "@controllers/users.controller";
import { VehicleController } from "@controllers/vehicles.controller";
import { ValidateEnv } from "@utils/validateEnv";

ValidateEnv();

const app = new App([AuthController, UserController, VehicleController]);
app.listen();
