import { DataSource } from "typeorm";

export default class MilesDatabase {
    dataSource: DataSource;

    constructor(dataSource: DataSource) {
        this.dataSource = dataSource;
        console.log("Initialized MilesDatabase, ", this.dataSource)
    }
}