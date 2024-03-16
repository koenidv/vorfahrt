import { config } from "dotenv";

config({ path: `.env.${process.env.NODE_ENV || "development"}.local` });

export const CREDENTIALS = process.env.CREDENTIALS === "true";
export const DB_PORT = Number.parseInt(process.env.DB_PORT) ?? 5432;
export const LOG_DIR = process.env.LOG_DIR ?? "logs";
export const { NODE_ENV, DB_HOST, DB_USER, DB_PASSWORD, DB_NAME, INFLUX_URL, INFLUX_TOKEN, SECRET_KEY, LOG_FORMAT, ORIGIN } = process.env;
