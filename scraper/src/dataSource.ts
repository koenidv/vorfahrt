import "reflect-metadata"
import { DataSource } from "typeorm"
import { VehicleSize } from "./entity/VehicleSize"
import env from "./env"

export const AppDataSource = new DataSource({
    type: "postgres",
    host: env.dbHost,
    port: env.dbPort,
    username: env.dbUser,
    password: env.dbPassword,
    database: env.dbName,
    synchronize: true,
    logging: false,
    entities: [VehicleSize],
    migrations: [],
    subscribers: [],
})
