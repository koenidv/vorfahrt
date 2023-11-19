import { MilesClient } from "@koenidv/abfahrt";
import { BaseMilesScraper } from "../BaseMilesScraper";
import { QueryPriority } from "./MilesScraperVehicles";

export default class MilesScraperCities extends BaseMilesScraper {
    private cities: any[] = [];

    setCities(cities: any[]) {
    }
    
    cycle() {
        throw new Error("Method not implemented.");
    }

    popSystemStatus(): { [key: string]: number; } {
        throw new Error("Method not implemented.");
    }

    private async execute(city: any) {

    }


}