import { config } from "dotenv";

config({ path: ".env" });

const assertString = (value: unknown, key: string) => {
  if (typeof value !== "string" || value.length < 1) {
    throw new Error(`invalid .env: ${key} missing`);
  }
  return value;
};

const env = {
  dbHost: assertString(
    process.env.DB_HOST,
    "DB_HOST",
  ),
  dbPort: (process.env.DB_PORT ? parseInt(process.env.DB_PORT) : 5432),
  dbUser: assertString(
    process.env.DB_USER,
    "DB_USER",
  ),
  dbPassword: assertString(
    process.env.DB_PASSWORD,
    "DB_PASSWORD",
  ),
  dbName: assertString(
    process.env.DB_NAME,
    "DB_NAME",
  ),
  influxUrl: assertString(
    process.env.INFLUX_URL,
    "INFLUX_URL",
  ),
  influxToken: assertString(
    process.env.INFLUX_TOKEN,
    "INFLUX_TOKEN",
  ),
  rpm_map: (process.env.RPM_MAP ? parseInt(process.env.RPM_MAP) : 120),
  rpm_vehicle: (process.env.RPM_VEHICLE ? parseInt(process.env.RPM_VEHICLE) : 60),
  rpm_cities: (process.env.RPM_CITIES ? parseInt(process.env.RPM_CITIES) : 1 / (60 * 12)),
} as const;

export default env;
