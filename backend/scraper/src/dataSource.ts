import "reflect-metadata";
import { DataSource } from "typeorm";
import env from "./env";
import { MilesEntities } from "@vorfahrt/shared/typeorm-entities/Miles/_MilesEntities";

export const AppDataSource = new DataSource({
  type: "postgres",
  host: env.dbHost,
  port: env.dbPort,
  username: env.dbUser,
  password: env.dbPassword,
  database: env.dbName,
  synchronize: true,
  entities: MilesEntities,
  migrations: [],
  subscribers: [],
  logging: false,
});
