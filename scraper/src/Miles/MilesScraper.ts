import { MilesClient } from "@koenidv/abfahrt";

export default class MilesScraper {
    client: MilesClient;

    constructor(client: MilesClient) {
        this.client = client;
        console.log("Initialized MilesScraper, ", this.client)
    }


}