import "reflect-metadata"
import { DataSource } from "typeorm"
import { MilesVehicleSize } from "./entity/MilesVehicleSize"
import env from "./env"

export const AppDataSource = new DataSource({
    type: "postgres",
    host: env.dbHost,
    port: env.dbPort,
    username: env.dbUser,
    password: env.dbPassword,
    database: env.dbDb,
    synchronize: true,
    logging: false,
    entities: [MilesVehicleSize],
    migrations: [],
    subscribers: [],
})
