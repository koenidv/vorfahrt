import "dotenv/config";
import { cleanEnv, port, str } from "envalid";

export const ValidateEnv = () => {
  cleanEnv(process.env, {
    NODE_ENV: str({ default: "development" }),
    DB_HOST: str(),
    DB_PORT: port(),
    DB_USER: str(),
    DB_PASSWORD: str(),
    DB_NAME: str(),
    INFLUX_URL: str(),
    INFLUX_TOKEN: str(),
  });
};
