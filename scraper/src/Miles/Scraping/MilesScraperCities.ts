import { MilesClient } from "@koenidv/abfahrt";

export default class MilesScraperCities {
    client: MilesClient;
    secondsDelay: number; // City queries are executed synchronously - delay between each query

    constructor(client: MilesClient, secondsDelay) {
        this.client = client;
        this.secondsDelay = secondsDelay;
        console.log(`Initialized MilesScraperCities with ${this.secondsDelay}s cooldown`)
    }


    registerAll(...cities: any) {
    }

    private async execute(city: any) {

    }


}