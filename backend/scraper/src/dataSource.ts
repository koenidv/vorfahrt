import "reflect-metadata";
import { DataSource } from "typeorm";
import env from "./env";
import { MilesEntities } from "./entity/Miles/_MilesEntities";

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
