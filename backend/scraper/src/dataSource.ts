import "reflect-metadata";
import { DataSource } from "typeorm";
import env from "./env";
import { MilesEntities, TomTomEntities, WeatherEntities } from "@vorfahrt/shared";

export const AppDataSource = new DataSource({
  type: "postgres",
  host: env.dbHost,
  port: env.dbPort,
  username: env.dbUser,
  password: env.dbPassword,
  database: env.dbName,
  synchronize: true,
  entities: [...MilesEntities, ...TomTomEntities, ...WeatherEntities],
  migrations: [],
  subscribers: [],
  logging: false,
});
