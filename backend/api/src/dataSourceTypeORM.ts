// todo make env file shared or copy it to api
import { DB_HOST, DB_NAME, DB_PASSWORD, DB_PORT, DB_USER } from "@config";
import { MilesEntities } from "@vorfahrt/shared/typeorm-entities/Miles/_MilesEntities";
import { DataSource } from "typeorm";

export const AppDataSource = new DataSource({
  type: "postgres",
  host: DB_HOST,
  port: DB_PORT,
  username: DB_USER,
  password: DB_PASSWORD,
  database: DB_NAME,
  synchronize: false,
  entities: MilesEntities,
  migrations: [],
  subscribers: [],
  logging: false,
});
